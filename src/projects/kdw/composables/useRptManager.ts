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

import { toRef, type MaybeRef, computed, unref, ref, type MaybeRefOrGetter, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'

export interface UseRptManagerOptions {
  baseUrlKeycloak: string
  authToken?: MaybeRefOrGetter<string | undefined>
  realm: string
  grantType: string
  audience: string
  immediate?: MaybeRef<boolean>
  enabled?: MaybeRef<boolean>
}

export interface GetRtpTokenOptions {
  baseUrlKeycloak: string
  authToken: string
  realm: string
  grantType: string
  audience: string
  refreshToken?: string
}

async function getRtpToken(options: GetRtpTokenOptions): Promise<string> {
  const normalizedHost = options.baseUrlKeycloak.endsWith('/')
    ? options.baseUrlKeycloak
    : `${options.baseUrlKeycloak}/`
  const endpoint = `${normalizedHost}realms/${options.realm}/protocol/openid-connect/token`
  const reqBody = {
    grant_type: options.grantType,
    audience: options.audience,
    ...(options.refreshToken && { refresh_token: options.refreshToken }),
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${options.authToken}`,
    },
    body: new URLSearchParams(reqBody).toString(),
  })

  if (!res.ok) {
    throw new Error('Failed to fetch RPT token')
  }

  const data = await res.json()

  return data.access_token
}

export function useRptManager(options: UseRptManagerOptions) {
  const {
    baseUrlKeycloak,
    authToken,
    immediate = true,
    enabled = true,
  } = options || {}

  const _enabled = toRef(enabled)
  function enable() { _enabled.value = true }
  function disable() { _enabled.value = false }
  if (!immediate) disable()

  const refreshToken = ref('')
  const refreshInterval = ref(300 * 1000)

  const enableQuery = computed(() => _enabled.value && !!unref(authToken))
  const queryKey = computed(() => ([
    'useRptManager',
    baseUrlKeycloak,
    unref(authToken),
  ]))

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      return await getRtpToken({
        baseUrlKeycloak,
        authToken: toValue(authToken) || '',
        realm: options.realm,
        grantType: options.grantType,
        audience: options.audience,
        refreshToken: unref(refreshToken),
      })
    },
    refetchInterval: computed(() => refreshInterval.value),
    staleTime: computed(() => refreshInterval.value),
    refetchOnWindowFocus: false,
    enabled: enableQuery,
  })

  return {
    enable,
    disable,
    enabled: _enabled,
    query,
  }
}