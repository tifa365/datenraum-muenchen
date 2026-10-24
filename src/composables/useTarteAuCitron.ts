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

import { computed, onScopeDispose, reactive, ref } from 'vue'
import { createSharedComposable } from '@vueuse/core'
import appConfig from '@config/appConfig'

declare global {
  interface Window {
    tarteaucitron?: TarteAuCitronGlobal
  }
}

interface TarteAuCitronGlobal {
  init: (config: Record<string, unknown>) => void
  services: Record<string, TarteAuCitronServiceDefinition>
  job: string[]
  state: Record<string, boolean | undefined>
  setConsent: (key: string, status: boolean) => void
  userInterface: {
    respondAll: (status: boolean) => void
  }
}

interface TarteAuCitronServiceDefinition {
  key: string
  type: string
  name: string
  needConsent: boolean
  cookies: string[]
  js: () => void
  fallback?: () => void
}

/**
 * A consent-gated service that tarteaucitron will register, e.g. loading an
 * analytics/tracking snippet. Display text (name/description) is intentionally
 * not part of this definition — the UI layer resolves it via i18n so that it
 * reacts to locale changes, unlike tarteaucitron's own bundled translations.
 */
export interface ConsentServiceDefinition {
  /** Stable identifier, must only contain letters/numbers (used as a DOM id fragment by tarteaucitron) */
  key: string
  /** Category used by tarteaucitron internally, defaults to 'analytic' */
  type?: string
  /**
   * Cookie name prefixes written by this service — anything whose name
   * starts with one of these strings is purged when consent is revoked.
   * E.g. ["_pk_id.", "_pk_ses."] for Matomo.
   */
  cookiePrefixes?: string[]
  /** Executed once the user grants consent to this service */
  onAccept: () => void
  /** Executed when the user denies/revokes consent to this service */
  onReject?: () => void
}

export interface ConsentServiceStatus {
  key: string
  /** true = allowed, false = denied, undefined = not yet decided */
  allowed: boolean | undefined
}

function buildServiceDefinitions(): ConsentServiceDefinition[] {
  const services: ConsentServiceDefinition[] = []
  const embedCode = appConfig.trackingEmbedCode?.trim()
  const trackingCookiePrefixes = appConfig.trackingCookiePrefixes as string | undefined
  const cookiePrefixList = trackingCookiePrefixes
    ?.split(',')
    .map((c) => c.trim())
    .filter(Boolean)
  const trackingNodes: HTMLElement[] = []
  const trackingNodeIdPrefix = 'usage-analytics-tracking-node'
  let trackingNodeIdCounter = 0

  function withTrackingNodeTestId<T extends HTMLElement>(node: T): T {
    trackingNodeIdCounter += 1
    node.setAttribute('data-testid', `${trackingNodeIdPrefix}-${trackingNodeIdCounter}`)
    return node
  }

  if (embedCode) {
    services.push({
      key: 'usageAnalytics',
      type: 'analytic',
      cookiePrefixes: cookiePrefixList,
      onAccept: () => {
        if (trackingNodes.some((node) => node.isConnected)) {
          return
        }

        const container = document.createElement('div')
        container.innerHTML = embedCode

        if (!container.children.length) {
          const script = document.createElement('script')
          script.type = 'text/javascript'
          script.textContent = embedCode
          document.head.appendChild(withTrackingNodeTestId(script))
          trackingNodes.push(script)
          return
        }

        Array.from(container.children).forEach((node) => {
          if (node.tagName === 'SCRIPT') {
            const script = document.createElement('script')

            Array.from(node.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value))

            if (node.textContent) {
              script.textContent = node.textContent
            }

            document.head.appendChild(withTrackingNodeTestId(script))
            trackingNodes.push(script)
            return
          }

          document.head.appendChild(withTrackingNodeTestId(node as HTMLElement))
          trackingNodes.push(node as HTMLElement)
        })
      },
      onReject: () => {
        trackingNodes.forEach((node) => node.remove())
        trackingNodes.length = 0
        // Remove any cookies whose name starts with one of the configured prefixes
        if (cookiePrefixList?.length) {
          const cookieNames = document.cookie.split(';').map((c) => c.trim().split('=')[0].trim())
          for (const name of cookieNames) {
            if (cookiePrefixList.some((prefix) => name.startsWith(prefix))) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
            }
          }
        }
      },
    })
  }

  return services
}

/**
 * Headless integration of Tarte Au Citron: it registers consent-gated
 * services and drives tarteaucitron's consent engine (cookie persistence,
 * script gating, Google/Bing/Piano consent-mode wiring), but never renders
 * tarteaucitron's own banner/panel — that DOM is hidden globally via CSS
 * (see cookie-consent.css). The actual UI is built with regular, fully
 * reactive Vue/i18n components (see CIVCookieConsentManager.vue), which
 * sidesteps tarteaucitron's language strings being loaded once at init time.
 */
function useTarteAuCitronImpl() {
  const definitions = buildServiceDefinitions()
  const services: ConsentServiceStatus['key'][] = definitions.map((service) => service.key)

  const isReady = ref(false)
  const consent = reactive<Record<string, boolean | undefined>>({})

  const hasServices = computed(() => definitions.length > 0)
  const needsConsent = computed(() => definitions.some((service) => consent[service.key] === undefined))

  const listenerCleanups: Array<() => void> = []

  function syncConsentFromState(tac: TarteAuCitronGlobal) {
    for (const key of services) {
      if (tac.state[key] === true || tac.state[key] === false) {
        consent[key] = tac.state[key]
      }
    }
  }

  function bindServiceEvents() {
    const pendingKeys = new Set(services)

    for (const service of definitions) {
      const onAllowed = () => {
        consent[service.key] = true
      }
      const onDisallowed = () => {
        consent[service.key] = false
        service.onReject?.()
      }
      const onAdded = () => {
        if (window.tarteaucitron) {
          syncConsentFromState(window.tarteaucitron)
        }
        pendingKeys.delete(service.key)
        if (pendingKeys.size === 0) {
          isReady.value = true
        }
      }

      document.addEventListener(`${service.key}_allowed`, onAllowed)
      document.addEventListener(`${service.key}_disallowed`, onDisallowed)
      document.addEventListener(`${service.key}_added`, onAdded)

      listenerCleanups.push(() => {
        document.removeEventListener(`${service.key}_allowed`, onAllowed)
        document.removeEventListener(`${service.key}_disallowed`, onDisallowed)
        document.removeEventListener(`${service.key}_added`, onAdded)
      })
    }
  }

  function registerServices(tac: TarteAuCitronGlobal) {
    for (const service of definitions) {
      tac.services[service.key] = {
        key: service.key,
        type: service.type ?? 'analytic',
        name: service.key,
        needConsent: true,
        cookies: service.cookiePrefixes ?? [],
        js: service.onAccept,
        fallback: service.onReject,
      }
    }

    tac.job = services
  }

  function init() {
    if (!hasServices.value) {
      isReady.value = true
      return
    }

    if (typeof window === 'undefined' || !window.tarteaucitron) {
      console.warn('[useTarteAuCitron] window.tarteaucitron is not available.')
      isReady.value = true
      return
    }

    bindServiceEvents()
    registerServices(window.tarteaucitron)

    window.tarteaucitron.init({
      privacyUrl: '/app/data-notices?tab=PrivacyPolicy',
      cookieName: 'tac-cmp',
      highPrivacy: true,
      mandatory: false,
      mandatoryCta: false,
      serviceDefaultState: 'wait',
      useExternalCss: true,
      showAlertSmall: false,
      showIcon: false,
      groupServices: false,
      alwaysNeedConsent: true,
    })
  }

  function acceptAll() {
    if (!isReady.value) {
      console.warn('[useTarteAuCitron] acceptAll() called before tarteaucitron is ready.')
      return
    }
    window.tarteaucitron?.userInterface.respondAll(true)
  }

  function rejectAll() {
    if (!isReady.value) {
      console.warn('[useTarteAuCitron] rejectAll() called before tarteaucitron is ready.')
      return
    }
    window.tarteaucitron?.userInterface.respondAll(false)
  }

  function setConsent(key: string, status: boolean) {
    if (!isReady.value) {
      console.warn('[useTarteAuCitron] setConsent() called before tarteaucitron is ready.')
      return
    }
    window.tarteaucitron?.setConsent(key, status)
  }

  init()

  onScopeDispose(() => {
    listenerCleanups.forEach((cleanup) => cleanup())
  })

  return {
    /** Whether any consent-gated service is configured at all */
    hasServices,
    /** Whether tarteaucitron has finished registering every configured service */
    isReady,
    /** The registered service keys */
    services,
    /** Reactive per-service consent state */
    consent,
    /** Whether at least one service is still awaiting a decision */
    needsConsent,
    /** Accept every service */
    acceptAll,
    /** Reject every service */
    rejectAll,
    /** Accept or reject a single service */
    setConsent,
  }
}

/**
 * Shared singleton: tarteaucitron is a global, page-lifetime engine, so every
 * caller (banner, settings dialog, footer links, ...) must observe/drive the
 * same state instead of re-initializing tarteaucitron multiple times.
 */
export const useTarteAuCitron = createSharedComposable(useTarteAuCitronImpl)
