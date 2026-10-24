/*
 * This file is part of Civora UI.
 *
 * Copyright (C) 2025 DKSR GmbH.
 *
 * Civora UI is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { type Ref } from "vue"
import { ref, shallowRef, markRaw, watch } from "vue"
import { defineStore } from "pinia"
import type { KeycloakInitOptions, KeycloakLoginOptions, KeycloakLogoutOptions, KeycloakRegisterOptions } from "keycloak-js"
import Keycloak from "keycloak-js"

import appConfig from "@config/appConfig.js"

let _initOpts: KeycloakInitOptions | undefined

export interface AuthStoreUser {
  username: string
  parsedToken: object | undefined
  groupMemberships: string[]
}

export interface RptPermission {
  scopes: string[]
  rsid: string
  rsname: string
}

// RPT refresh interval — 5 minutes, matching useRptManager's original default
const RPT_REFRESH_INTERVAL_MS = 5 * 60 * 1000

/**
 * Return or create authentication store
 * Authentication store must be initialized before use
 * see authStore.init
 */
const useKeycloakStore = defineStore(
  'keycloak',
  () => {
    const isInitialized = ref(false)

    // shallowRef makes the ref itself reactive while markRaw
    // makes the Keycloak object completely opaque to Vue's reactivity system.
    const service: Ref<Keycloak> = shallowRef(markRaw(new Keycloak({
      url: appConfig.keycloakUrl,
      clientId: appConfig.keycloakClientId,
      realm: appConfig.keycloakRealm
    })))

    async function init(initOpts: KeycloakInitOptions) {
      if (isInitialized.value) {
        console.warn('tried to init already initialized keycloak instance, skipping...')
        return
      }
      try {
        await service.value.init(initOpts)
        isInitialized.value = true
      } catch (err) {
        console.error('failed to initialize keycloak instance', err)
        throw err
      }
    }

    return { init, service, isInitialized }
  }
)

/**
 * Decode JWT token payload
 */
function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}

/**
 * Check if running inside an iframe.
 * @returns true if running in iframe, false otherwise
 */
function isInIframe(): boolean {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}

/**
 * @returns {string} a redirect uri based on location
 */
function buildRedirectUri(): string {
  if (isInIframe()) {
    try {
      const url = new URL(document.referrer || window.parent.origin)
      return url.origin
    } catch (e) {
      console.error('error determining redirectUri in iframe', e)
      return appConfig.appUrl
    }
  }
  return window.location.origin
}

/**
 * Fetch an RPT (Requesting Party Token) from Keycloak.
 */
async function fetchRptToken(authToken: string): Promise<string> {
  const base = appConfig.keycloakUrl.endsWith('/')
    ? appConfig.keycloakUrl
    : `${appConfig.keycloakUrl}/`
  const endpoint = `${base}realms/${appConfig.keycloakRealm}/protocol/openid-connect/token`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${authToken}`,
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
      audience: appConfig.keycloakPiveauClientId,
    }).toString(),
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch RPT token: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  return data.access_token
}

/**
 * Return or create authentication store.
 * Authentication store must be initialized before use — see authStore.init.
 *
 * Owns the full auth lifecycle including RPT token acquisition via UMA protocol.
 * RPT is fetched automatically whenever an authToken is present and refreshed
 * every RPT_REFRESH_INTERVAL_MS. Consumers (e.g. useAuthToDpiBridge) simply
 * read rptToken / rptPermissions.
 */
export const useAuthStore = defineStore(
  'auth',
  () => {
    const keycloak = useKeycloakStore()

    const authenticated = ref(keycloak.service.authenticated ?? false)
    const idTokenParsed = ref(keycloak.service.idTokenParsed)
    const authToken = ref(keycloak.service.token)
    const authTokenParsed = ref(keycloak.service.tokenParsed)
    const refreshToken = ref(keycloak.service.refreshToken)
    const refreshTokenParsed = ref(keycloak.service.refreshTokenParsed)
    const rptToken = ref('')
    const rptPermissions = ref<RptPermission[]>([])
    const user: Ref<AuthStoreUser> = ref(<AuthStoreUser>{})
    const registrationUrl = ref('')

    const tokenRefreshTimer = ref()
    const rptRefreshTimer = ref<ReturnType<typeof setTimeout>>()

    // -------------------------------------------------------------------------
    // RPT management — plain fetch + setTimeout, no Vue Query context needed
    // -------------------------------------------------------------------------

    /**
     * Decode the RPT and store its permissions
     */
    function applyRptToken(token: string) {
      rptToken.value = token
      const decoded = decodeToken(token)
      rptPermissions.value = decoded?.authorization?.permissions ?? []
    }

    /**
     * Fetch a fresh RPT and schedule the next refresh.
     * Safe to call multiple times — cancels any pending timer first.
     */
    async function refreshRpt() {
      if (rptRefreshTimer.value) {
        clearTimeout(rptRefreshTimer.value)
        rptRefreshTimer.value = undefined
      }

      if (!authToken.value) return

      try {
        const token = await fetchRptToken(authToken.value)
        applyRptToken(token)
      } catch (err) {
        console.error('Failed to refresh RPT token:', err)
      } finally {
        // Schedule next refresh only if we still have an auth token
        if (authToken.value) {
          rptRefreshTimer.value = setTimeout(refreshRpt, RPT_REFRESH_INTERVAL_MS)
        }
      }
    }

    /**
     * Cancel the RPT refresh cycle and clear stored RPT data.
     * Called on logout or when the auth token disappears.
     */
    function clearRpt() {
      if (rptRefreshTimer.value) {
        clearTimeout(rptRefreshTimer.value)
        rptRefreshTimer.value = undefined
      }
      rptToken.value = ''
      rptPermissions.value = []
    }

    // Start/stop RPT refresh cycle whenever authToken changes
    watch(authToken, (newToken) => {
      if (newToken) {
        refreshRpt()
      } else {
        clearRpt()
      }
    })

    // -------------------------------------------------------------------------
    // Keycloak event hooks
    // -------------------------------------------------------------------------

    keycloak.service.onReady = updateValues

    keycloak.service.onAuthSuccess = updateValues

    keycloak.service.onAuthError = (error) => {
      console.error('Unexpected error during authentication:', error)
      updateValues()
    }

    keycloak.service.onAuthLogout = () => {
      console.debug('Logout event received')
      updateValues()
    }

    keycloak.service.onAuthRefreshSuccess = updateValues

    keycloak.service.onAuthRefreshError = updateValues

    keycloak.service.onTokenExpired = () => {
      console.debug('Token expired event received, attempting to refresh token')
      updateToken(-1)
    }

    watch(
      [authenticated, authTokenParsed, refreshToken],
      setRefreshTimeout,
      { immediate: true }
    )

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    /**
     * Sync values with keycloak store
     */
    function updateValues() {
      authenticated.value = !!keycloak.service?.authenticated
      idTokenParsed.value = keycloak.service?.idTokenParsed
      authToken.value = keycloak.service?.token
      authTokenParsed.value = keycloak.service?.tokenParsed
      refreshToken.value = keycloak.service?.refreshToken
      refreshTokenParsed.value = keycloak.service?.refreshTokenParsed
      registrationUrl.value = keycloak.service.createRegisterUrl()
      user.value = {
        username: idTokenParsed.value?.preferred_username,
        parsedToken: idTokenParsed.value,
        groupMemberships: idTokenParsed.value?.group_membership ?? []
      }
    }

    function setRefreshTimeout() {
      if (tokenRefreshTimer.value) {
        clearTimeout(tokenRefreshTimer.value)
        tokenRefreshTimer.value = undefined
      }

      if (!authenticated.value || !refreshToken.value) {
        // not authenticated or no refresh token available, skipping...
        return
      }

      const tokenExpireTime = authTokenParsed?.value?.exp
         ? new Date(authTokenParsed.value.exp * 1000)
         : new Date(Date.now() + 60 * 1000) // default to 60 seconds if no exp claim

      const validDuration = tokenExpireTime.getTime() - Date.now()

      const refreshTimeBase = validDuration * 0.7

      // clamp refresh time to at least 30 seconds to avoid excessive refreshes
      const refreshTime = Math.floor(Math.max(
        refreshTimeBase,
        30 * 1000 + Math.random() * 30 * 1000
      ))

      tokenRefreshTimer.value = setTimeout(
        async () => {
          try {
            // force refresh the token,
            // if it fails, we will try again in the next interval
            await updateToken(-1)
          } catch (err) {
            console.error('token refresh failed', err)
          } finally {
            setRefreshTimeout()
          }
        },
        refreshTime
      )
    }

    // lazy re-init helper — attempts to initialize the Keycloak instance if it's not already initialized.
    async function ensureInitialized(): Promise<void> {
      if (keycloak.isInitialized) return
      if (!_initOpts) throw new Error('init() has never been called')
      await keycloak.init(_initOpts)
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Initialize authentication store
     * @param initOpts
     */
    async function init(initOpts: KeycloakInitOptions) {
      _initOpts = initOpts
      if (!keycloak.isInitialized) {
        await keycloak.init(initOpts)
      } else {
        console.warn('keycloak was already initialized, skipping...')
      }
    }

    /**
     * Login User, throws error if store is not initialized
     * Redirects user to alternative loginUrl if specified
     * in configuration
     * @param options
     * @returns
     */
    async function login(options?: KeycloakLoginOptions) {
      await ensureInitialized()
      if (appConfig.customer.loginUrl) {
        window.location = appConfig.customer.loginUrl
        return
      }
      try {
        await keycloak.service.login(options)
        updateValues()
      } catch (err) {
        console.error('login failed', err)
      }
    }

    /**
     * Logout user, throws error if store is not initialized
     * @param options
     */
    async function logout(options?: KeycloakLogoutOptions) {
      await ensureInitialized()

      if (!options?.redirectUri) {
        options = {
          ...options,
          redirectUri: buildRedirectUri()
        }
      }

      try {
        await keycloak.service.logout(options)
        updateValues()
        clearRpt()
      } catch (err) {
        console.error('logout failed', err)
      }
    }

    /**
     * Redirect user to registration form
     * @param options
     */
    async function register(options: KeycloakRegisterOptions) {
      await ensureInitialized()
      try {
        await keycloak.service.register(options)
        updateValues()
      } catch (err) {
        console.error('register failed', err)
      }
    }

    /**
     * Check if user has a given realm role
     * @param role
     * @returns true if user has given realm role
     */
    function hasRealmRole(role: string) {
      return keycloak.service.hasRealmRole(role)
    }

    /**
     * Check if user has a given role for a resource
     * @param role
     * @param resource
     * @returns true if the user has a given role for a resource
     */
    function hasResourceRole(role: string, resource: string) {
      return keycloak.service.hasResourceRole(role, resource)
    }

    /**
     * Retrieve authentication token.
     * If authenticated, checks token validity and refreshes
     * token before return if it expires within minValidity seconds
     * @param minValidity in seconds
     * @returns
     */
    async function getAuthToken(minValidity?: number) {
      if (authenticated.value) {
        await updateToken(minValidity)
      }
      return authToken.value
    }

    /**
     * Update token if it expires within minValidity seconds
     * @param minValidity in seconds (default 60)
     * @returns Promise which evaluates to true if refreshed, false otherwise
     */
    async function updateToken(minValidity: number = 60) {
      await ensureInitialized()
      let refreshed = false
      if (authenticated.value) {
        try {
          refreshed = await keycloak.service.updateToken(minValidity)
        } catch (err) {
          console.error('failed to refresh the token or session expired', err)
        } finally {
          updateValues()
        }
      }
      return refreshed
    }

    return {
      authenticated,
      idTokenParsed,
      authToken,
      authTokenParsed,
      rptToken,
      rptPermissions,
      user,
      registrationUrl,
      init,
      register,
      login,
      logout,
      getAuthToken,
      updateToken,
      updateValues,
      hasRealmRole,
      hasResourceRole,
    }
  }
)