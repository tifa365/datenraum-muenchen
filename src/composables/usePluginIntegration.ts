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

import { computed, getCurrentInstance, onMounted, ref, watch, type ShallowRef  } from 'vue'
import * as z from 'zod'
import { useEventListener } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import appConfig from '@config/appConfig'

export interface ResponseMessage {
  type: 'CIVORA_CONTEXT'
  payload: {
    user: {
      id?: string
      token?: string
    }
  }
  tenant: {
    id: string
  }
  locale: string
}

const requestMessageSchema = z.object({
  type: z.enum(['GET_CIVORA_CONTEXT']),
})
export type RequestMessage = z.infer<typeof requestMessageSchema>

/**
 * Validates a message event from an iframe.
 * @param event The event to validate
 * @param allowedOrigin origin that is allowed to send messages to this window. If null, no origin is allowed.
 * @returns The result of the validation, including success status, validated message data, and/or error if any.
 */
export function validateMessage(event: MessageEvent<any>, target: HTMLIFrameElement | null, allowedOrigin: string | null, ignoredOrigins: string[]): z.ZodSafeParseError<RequestMessage> | z.ZodSafeParseSuccess<RequestMessage> | null {
  if (ignoredOrigins.includes(event.origin)) {
    // console.debug(`Received message from ignored origin: ${event.origin}`)
    return null
  }
  if (!allowedOrigin || event.origin !== allowedOrigin) {
    console.warn(`Received message from disallowed origin: ${event.origin}. Expected: ${allowedOrigin}`)
    return null
  }
  if (!event.source || event.source !== target?.contentWindow) {
    console.warn('Received message from invalid source:', event.source)
    return null
  }
  return requestMessageSchema.safeParse(event.data)
}

/**
 * Sends the context to the target iframe.
 * @param target the target Iframe to send the context to
 * @param origin allowed origins to check against
 * @param authStore the auth store
 * @param locale the locale
 * @returns void
 */
function sendContext(target: HTMLIFrameElement | null, origin: string | null, authStore: ReturnType<typeof useAuthStore>, locale: string) {
  if (!origin) {
    console.warn('Invalid parameter: Can not send context with undefined allowed origin')
    return
  }
  if (!target) {
    console.warn('Invalid parameter: Can not send context to null target')
    return
  }
  if (!target.contentWindow) {
    console.warn('Can not send context to iframe with no contentWindow')
    return
  }
  if (!target.src || URL.parse(target.src)?.origin !== origin) {
    console.warn('Origin mismatch: Can not send context to iframe with src that does not match allowed origin')
    return
  }

  const context: ResponseMessage = {
    type: 'CIVORA_CONTEXT',
    payload: {
      user: {
        id: authStore?.user?.username,
        token: authStore?.authToken,
      },
    },
    tenant: {
      id: appConfig.customer.name,
    },
    locale: locale,
  }
  target.contentWindow.postMessage(context, origin)
}

export function usePluginIntegration(target: Readonly<ShallowRef<HTMLIFrameElement | null>>) {
  const vm = getCurrentInstance()
  if (!vm) {
    throw new Error('usePluginIntegration must be called within a setup function')
  }

  const iframe = computed(() => target.value)
  const iframeSrc = computed(() => iframe.value?.src)
  const allowedOrigin = computed(() => {
    if (!iframeSrc.value) {
      return null
    }
    try {
      const url = new URL(iframeSrc.value)
      return url.origin
    } catch (error) {
      console.error('Invalid iframe src URL:', iframeSrc.value)
      return null
    }
  })
  const ignoredOrigins = computed(() => {
    const authOrigin = URL.parse(appConfig.keycloakUrl)?.origin
    const ownOrigin = URL.parse(appConfig.appUrl)?.origin
    return [
      authOrigin,
      ownOrigin,
    ].filter(origin => !!origin) as string[]
  })

  const authStore = useAuthStore()
  const { locale } = useI18n()
  
  // continuous updates are not enabled until
  // first request by plugin for context
  const active = ref(false)

  // Listen for messages from the embedded plugin iframe
  onMounted(() => {
    useEventListener(window, 'message', (event) => {
      // make sure message is safe and correct
      const result = validateMessage(event, target.value, allowedOrigin.value, ignoredOrigins.value)
      if (!result) {
        return
      }
      if (!result.success) {
        console.warn('Received invalid message from plugin:', result.error)
        return
      }

      // handle the message
      const data = result.data
      if (data.type === 'GET_CIVORA_CONTEXT') {
        if (!active.value) {
          active.value = true
        }
        sendContext(target.value, allowedOrigin.value, authStore, locale.value)
      }
    })
  })

  watch(
    () => authStore.authToken,
    (newToken) => {
      if (active.value) {
        sendContext(target.value, allowedOrigin.value, authStore, locale.value)
      }
    }
  )

  watch(
    () => target.value,
    (newTarget) => {
      active.value = false
    }
  )

  return {
    active,
    allowedOrigin,
  }
}