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

import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'
import { useFetchWithProgress } from '@/composables/useFetchWithProgress'
import { useAuthStore } from '@/stores/authStore'
import { getFilenameFromUrl } from '@/utils/downloadFilename'
import { isMiddlewareUrl, isOUPUrl } from '@/utils/distributionUrl'

export { isMiddlewareUrl, isOUPUrl }

function getErrorMessage(error: unknown) {
  console.log('Download error:', error)
  return error instanceof Error ? error.message : String(error)
}

function getInlineContentTypeFromFilename(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    case 'svg':
      return 'image/svg+xml'
    case 'pdf':
      return 'application/pdf'
    case 'csv':
      return 'text/csv'
    case 'json':
      return 'application/json'
    case 'xml':
      return 'application/xml'
    case 'txt':
      return 'text/plain'
    default:
      return null
  }
}

function isInlineContentType(contentType: string | null | undefined) {
  if (!contentType) return false

  return contentType.startsWith('image/')
    || contentType.startsWith('text/')
    || contentType.startsWith('audio/')
    || contentType.startsWith('video/')
    || contentType === 'application/pdf'
    || contentType === 'application/json'
    || contentType === 'application/xml'
    || contentType.endsWith('+json')
    || contentType.endsWith('+xml')
}

function resolveInlineContentType(contentTypeHeader: string | null, fileName: string) {
  const normalizedHeader = contentTypeHeader?.split(';')[0]?.trim().toLowerCase()

  if (isInlineContentType(normalizedHeader)) {
    return normalizedHeader
  }

  return getInlineContentTypeFromFilename(fileName)
}

function triggerBlobDownload(blob: Blob, fileName: string, container: HTMLElement) {
  const objectUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName

  container.appendChild(link)
  link.click()
  container.removeChild(link)
  window.URL.revokeObjectURL(objectUrl)
}

function openBlobInNewTab(blob: Blob, container: HTMLElement, targetWindow?: Window | null) {
  const objectUrl = window.URL.createObjectURL(blob)

  if (targetWindow) {
    targetWindow.location.href = objectUrl
  } else {
    const link = document.createElement('a')
    link.href = objectUrl
    link.target = '_blank'
    link.rel = 'noopener noreferrer'

    container.appendChild(link)
    link.click()
    container.removeChild(link)
  }

  // the new tab needs the blob URL to still resolve after this call returns, so revoke later
  window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60_000)
}

export function needsAuth(url: string | null | undefined) {
  return isOUPUrl(url) || isMiddlewareUrl(url)
}

export function useDownload(
  // element the temporary download link is appended to; must stay inside an active focus trap so its click isn't blocked
  container?: MaybeRefOrGetter<HTMLElement | null | undefined>
) {
  const authStore = useAuthStore()
  const fetchWithProgress = useFetchWithProgress()
  const error = ref<string | null>(null)

  const isPreparing = ref(false)
  const isDownloading = computed(() => isPreparing.value || fetchWithProgress.isFetching.value)

  const cancel = () => {
    isPreparing.value = false
    fetchWithProgress.cancel()
  }

  const handleDownload = async (url: string | null | undefined, mode: 'open' | 'download' = 'download') => {
    if (isDownloading.value || !url) {
      console.warn('Download is already in progress or URL is invalid.', { url, isDownloading: isDownloading.value })
      return
    }

    error.value = null

    if (!isOUPUrl(url) && !isMiddlewareUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }

    const pendingWindow = mode === 'open'
      ? window.open('', '_blank')
      : null

    if (pendingWindow) {
      pendingWindow.opener = null
    }

    isPreparing.value = true

    let authToken: string | null | undefined
    try {
      authToken = await authStore.getAuthToken()
    } catch (err) {
      console.warn('Failed to retrieve auth token for download.', { url, error: err })
    }

    try {
      const result = await fetchWithProgress.fetchBlob(url, {
        method: 'GET',
        headers: authToken
          ? { Authorization: `Bearer ${authToken}` }
          : undefined,
      })
      const targetContainer = toValue(container) || document.body
      const contentDisposition = result.headers.get('content-disposition')
      if (!contentDisposition) {
        console.warn(
          'The middleware response did not expose the Content-Disposition header to the browser. ' +
          'Add Access-Control-Expose-Headers: Content-Disposition on the middleware response ' +
          'to preserve the server-provided download filename.',
          {
            url,
            hasToken: Boolean(authToken),
          }
        )
      }
      const fileName = getFilenameFromUrl(url, contentDisposition)

      if (mode === 'open') {
        const inlineContentType = resolveInlineContentType(result.headers.get('content-type'), fileName)

        if (isInlineContentType(inlineContentType)) {
          const blob = inlineContentType && result.blob.type !== inlineContentType
            ? new Blob([result.blob], { type: inlineContentType })
            : result.blob
          openBlobInNewTab(blob, targetContainer, pendingWindow)
          return
        }

        pendingWindow?.close()
      }

      triggerBlobDownload(result.blob, fileName, targetContainer)

    } catch (err) {
      pendingWindow?.close()
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }

      error.value = getErrorMessage(err)

    } finally {
      isPreparing.value = false
    }
  }

  return {
    needsAuth,
    isDownloading,
    progress: fetchWithProgress.progress,
    error,
    cancel,
    handleDownload,
  }
}