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

import { computed, getCurrentInstance, type MaybeRefOrGetter, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import appConfig from '@config/appConfig'
import { useAuthStore } from '@/stores/authStore'
import { isMiddlewareUrl, isOUPUrl } from '@/utils/distributionUrl'
import type { DistributionViewModel } from '@/projects/kdw/components/dsitribution-data-info-box/shared'

/**
 * Piveau data preview API response structure
 */
export interface PiveauDataPreviewResponse {
  default_view_options: {
    default_view: 'table' | 'numerical' | 'categorical'
    default_numerical_chart: 'line' | null
    default_categorical_chart: 'bar' | 'doughnut' | null
    default_axes: {
      numerical_chart: {
        x: string
        y: string[]
      }
      categorical_chart: string
    }
  }
  labels: {
    all_labels: string[]
    numerical_labels: string[]
    categorical_labels: string[]
    time_labels: string[]
  }
  data: Array<Record<string, any>>
  categorized: Array<{
    column: string
    categories: Record<string, number>
    chart: 'bar' | 'doughnut'
  }>
}

export interface PiveauDataPreviewError {
  code?: string
  message?: string
  status?: number
}

/**
 * Supported file formats for piveau data preview
 */
const SUPPORTED_FORMATS = ['csv', 'tsv', 'json', 'xlsx', 'xls', 'ods']

const SUPPORTED_COMPRESS_FORMATS = [
  'application/zip', 'zip',
  'application/x-tar', 'application/tar', 'tar',
  'application/gzip', 'gzip',
]

const MIME_TYPE_REGEX = /https?:\/\/www\.iana\.org\/assignments\/media-types\/(.*\/.*)/

export function hasPreview(distribution: MaybeRefOrGetter<DistributionViewModel | null | undefined>): boolean {
  const dist = toValue(distribution)
  if (!dist) {
    return false
  }

  const format = dist.format?.toLowerCase().trim()
  if (!format || (!SUPPORTED_FORMATS.includes(format) && !isOUPUrl(dist.downloadUrls?.[0] || dist.accessUrls?.[0]))) {
    return false
  }

  const hasUrls = !!(dist.downloadUrls?.length || dist.accessUrls?.length)
  if (!hasUrls) {
    return false
  }

  const isSupportedCompressFormat = !dist.compressFormat
     || (!dist.compressFormat.label && !dist.compressFormat.resource)
     || (dist.compressFormat.label && SUPPORTED_COMPRESS_FORMATS.includes(normalizeCompressFormat(dist.compressFormat.label)))
     || (dist.compressFormat.resource && SUPPORTED_COMPRESS_FORMATS.includes(normalizeCompressFormat(dist.compressFormat.resource)))
  if (!isSupportedCompressFormat) {
    return false
  }

  return true
}

function normalizeCompressFormat(compressFormat: string): string {
  const match = compressFormat?.toLowerCase()?.trim()?.match(MIME_TYPE_REGEX)
  if (match) {
    return match[1]
  }
  return compressFormat
}

/**
 * Manages async fetching of piveau data preview for file formats
 * Supports csv, tsv, xlsx, xls, ods with optional compression and auth forwarding
 * @param distribution The distribution for which to fetch the preview. Must contain access/download URL and format.
 * @returns Preview data, loading state, and error state
 */
export function usePiveauDataPreview(distribution: MaybeRefOrGetter<DistributionViewModel | null | undefined>) {
  const vm = getCurrentInstance()
  if (!vm) {
    throw new Error('usePiveauDataPreview must be called within a setup function')
  }
  const authStore = useAuthStore()

  const piveauPreviewUrl = appConfig.piveauPreviewUrl?.endsWith('/')
    ? appConfig.piveauPreviewUrl
    : `${appConfig.piveauPreviewUrl}/`

  const distributionUrl = computed(() => 
    toValue(distribution)?.downloadUrls?.[0] || toValue(distribution)?.accessUrls?.[0] || '')

  const fileFormat = computed(() => {
    if (isOUPUrl(distributionUrl.value)) {
      return 'csv' // OUP historic API only supports CSV preview
    }

    const distFormat = toValue(distribution)?.format
    return distFormat ? distFormat.toLowerCase().trim() : ''
  })

  const compressFormat = computed(() => 
    toValue(distribution)?.compressFormat?.label?.trim() || toValue(distribution)?.compressFormat?.resource?.trim() || '')

  // Normalize compression format (remove URL wrapper if present)
  const normalizedCompressFormat = computed(() => normalizeCompressFormat(compressFormat.value))

  const queryKey = computed(() => [
    'piveauDataPreview',
    distributionUrl.value,
    fileFormat.value,
    normalizedCompressFormat.value,
  ])

  const isEnabled = computed(() => {
    const url = distributionUrl.value
    const format = fileFormat.value
    return !!piveauPreviewUrl && !!url && !!format
  })

  const previewQuery = useQuery({
    queryKey: queryKey,
    enabled: isEnabled,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    retry: 1,
    queryFn: async () => {
      const url = distributionUrl.value
      const format = fileFormat.value
      const compress = normalizedCompressFormat.value

      if (!url || !format) {
        throw new Error('Distribution URL and file format are required')
      }

      const params = new URLSearchParams({
        urlString: url,
        fileFormat: format,
      })

      if (compress) {
        params.append('compressFormat', compress)
      }

      const endpoint = `${piveauPreviewUrl}dataPreview?${params.toString()}`

      // Get auth token for protected URLs
      let authToken: string | undefined
      if (authStore.authenticated) {
        try {
          authToken = await authStore.getAuthToken()
        } catch (err) {
          console.warn('Failed to get auth token for preview:', err)
        }
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: authToken && (isOUPUrl(url) || isMiddlewareUrl(url))
          ? {
              Authorization: `Bearer ${authToken}`,
            }
          : undefined,
      })

      if (!response.ok) {
        const errorData = await parseErrorResponse(response)
        const error = new Error(errorData.message || `Failed to fetch preview: ${response.status} ${response.statusText}`) as Error & PiveauDataPreviewError
        error.code = errorData.code
        error.status = response.status
        throw error
      }

      const data = (await response.json()) as PiveauDataPreviewResponse
      return data
    },
  })

  const isLoading = computed(() => previewQuery.isFetching.value)
  const isError = computed(() => previewQuery.isError.value)
  const error = computed(() => {
    const err = previewQuery.error.value
    if (!err) {
      return null
    }

    return {
      code: (err as PiveauDataPreviewError).code,
      message: err.message || 'An error occurred while loading preview data',
      status: (err as PiveauDataPreviewError).status,
    }
  })

  const labels = computed(() => previewQuery.data.value?.labels || { all_labels: [], numerical_labels: [], categorical_labels: [], time_labels: [] })
  const defaultViewOptions = computed(() => previewQuery.data.value?.default_view_options || null)
  const data = computed(() => previewQuery.data.value?.data || [])
  const categorized = computed(() => previewQuery.data.value?.categorized || [])

  return {
    labels,
    defaultViewOptions,
    data,
    categorized,
    isLoading,
    isError,
    error,
  }
}

/**
 * Parse error response from piveau API
 */
async function parseErrorResponse(response: Response): Promise<PiveauDataPreviewError> {
  try {
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const json = await response.json()
      return {
        code: json.error,
        message: json.description,
        status: response.status,
      }
    }
  } catch (err) {
    // Fallback to text parsing
  }

  const text = await response.text()
  return {
    message: text || `HTTP ${response.status} ${response.statusText}`,
    status: response.status,
  }
}
