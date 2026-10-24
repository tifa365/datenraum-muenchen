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
import { searchResource } from '@piveau/sdk-core'

export type LocalizedText = Record<string, string>
export type CatalogQuality = 'good' | 'sufficient' | 'insufficient' | null

interface CatalogPublisher {
  name?: string | null
}

export interface CatalogResource {
  id?: string
  is_open_data_presence?: boolean
  is_part_of?: string
  has_part?: string[]
  title?: LocalizedText | null
  name?: LocalizedText | null
  description?: LocalizedText | null
  publisher?: CatalogPublisher | null
}

export interface CatalogSearchPage {
  catalogs: CatalogResource[]
  total: number
}

interface CatalogSearchResponse {
  result?: {
    results?: CatalogResource[]
    count?: number
  }
}

interface CatalogMetricsResponse {
  result?: {
    results?: Array<{ score?: number }>
  }
}

interface CatalogSearchOptions {
  baseUrl: string
  query: string
  accessToken?: string
}

interface CatalogPageOptions extends CatalogSearchOptions {
  page: number
  pageSize: number
}

const CATALOG_BATCH_SIZE = 100
const GOOD_QUALITY_SCORE = 221
const SUFFICIENT_QUALITY_SCORE = 121

function getAuthorizationHeaders(accessToken?: string): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
}

export async function fetchCatalogPage(options: CatalogPageOptions): Promise<CatalogSearchPage> {
  const response = await searchResource<CatalogSearchResponse>({
    baseUrl: options.baseUrl,
    params: {
      filter: 'catalogue',
      q: options.query,
      limit: options.pageSize,
      page: options.page,
    },
    headers: getAuthorizationHeaders(options.accessToken),
  })

  return {
    catalogs: response.data.result?.results ?? [],
    total: response.data.result?.count ?? 0,
  }
}

export async function fetchAllCatalogs(options: CatalogSearchOptions): Promise<CatalogResource[]> {
  const catalogs: CatalogResource[] = []
  let page = 0
  let total = Infinity

  while (catalogs.length < total) {
    const result = await fetchCatalogPage({
      ...options,
      page,
      pageSize: CATALOG_BATCH_SIZE,
    })
    total = result.total

    if (result.catalogs.length === 0) break

    catalogs.push(...result.catalogs)
    page++
  }

  return catalogs
}

export async function fetchCatalogQuality(baseUrl: string, catalogId: string): Promise<CatalogQuality> {
  const normalizedBaseUrl = baseUrl.trim().replace(/\/+$/, '')
  if (!normalizedBaseUrl) return null

  try {
    const response = await fetch(`${normalizedBaseUrl}/catalogues/${encodeURIComponent(catalogId)}`)
    if (!response.ok) throw new Error(`Failed to fetch catalog quality ${response.status}`)

    const json: CatalogMetricsResponse = await response.json()
    const score = json.result?.results?.[0]?.score

    if (typeof score !== 'number' || !Number.isFinite(score)) return null
    if (score >= GOOD_QUALITY_SCORE) return 'good'
    if (score >= SUFFICIENT_QUALITY_SCORE) return 'sufficient'
    return 'insufficient'
  } catch (error) {
    console.warn(`Unable to load MQA data for catalogue ${catalogId}`, error)
    return null
  }
}
