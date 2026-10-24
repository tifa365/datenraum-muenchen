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

import { getCurrentInstance, onBeforeUnmount, ref, type Ref } from 'vue'

export interface FetchBlobResult {
  blob: Blob
  headers: Headers
  status: number
  statusText: string
  url: string
}

export interface UseFetchWithProgressResult {
  isFetching: Ref<boolean>
  progress: Ref<number>
  error: Ref<Error | null>
  fetchBlob: (input: RequestInfo | URL, init?: RequestInit) => Promise<FetchBlobResult>
  cancel: () => void
}

async function getResponseError(response: Response) {
  return new Error(
    'Failed to fetch file: '
    + response.status + ' '
    + response.statusText + ' '
    + await response.text()
  )
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function useFetchWithProgress(): UseFetchWithProgressResult {
  const vm = getCurrentInstance()
  if (!vm) {
    throw new Error('useFetchWithProgress must be called within a setup function')
  }

  const isFetching = ref(false)
  const progress = ref(-1)
  const error = ref<Error | null>(null)
  const controller = ref<AbortController | null>(null)

  const resetController = () => {
    controller.value = null
  }

  const cancel = () => {
    controller.value?.abort()
    resetController()
    isFetching.value = false
    progress.value = -1
  }

  const fetchBlob = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    cancel()

    const abortController = new AbortController()
    controller.value = abortController
    isFetching.value = true
    progress.value = -1
    error.value = null

    try {
      const response = await fetch(input, {
        ...init,
        signal: abortController.signal,
      })

      if (!response.ok) {
        throw await getResponseError(response)
      }

      const contentType = response.headers.get('content-type') || undefined
      const contentLength = Number(response.headers.get('content-length'))

      if (!response.body) {
        return {
          blob: await response.blob(),
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
          url: response.url,
        }
      }

      const reader = response.body.getReader()
      const chunks: Uint8Array[] = []
      let loaded = 0

      let isDone = false
      while (!isDone) {
        if (abortController.signal.aborted) {
          throw new DOMException('The operation was aborted.', 'AbortError')
        }

        const { done, value } = await reader.read()
        isDone = done
        if (done) {
          break
        }

        chunks.push(value)
        loaded += value.length

        if (contentLength > 0) {
          progress.value = Math.min(100, Math.round((loaded / contentLength) * 100))
        }
      }

      if (contentLength > 0) {
        progress.value = 100
      }

      return {
        blob: new Blob(chunks, { type: contentType }),
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      }
    } catch (err) {
      if (!isAbortError(err)) {
        error.value = err instanceof Error ? err : new Error(String(err))
      }
      throw err
    } finally {
      if (controller.value === abortController) {
        resetController()
      }
      isFetching.value = false
      progress.value = -1
    }
  }

  onBeforeUnmount(cancel)

  return {
    isFetching,
    progress,
    error,
    fetchBlob,
    cancel,
  }
}