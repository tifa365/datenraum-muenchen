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

import { computed, ref, watch, type Ref } from 'vue'

export const DATASET_ACCESS_FILTERS = ['public', 'confidential', 'internal'] as const
export const DATASET_PUBLICATION_FILTERS = ['draft', 'published'] as const

export type DatasetAccessFilter = (typeof DATASET_ACCESS_FILTERS)[number]
export type DatasetPublicationFilter = (typeof DATASET_PUBLICATION_FILTERS)[number]

const ACCESS_FILTER_VALUES: Record<DatasetAccessFilter, string[]> = {
  public: ['public'],
  confidential: ['internal'],
  internal: ['restricted'],
}

interface SearchFacetItem {
  id?: string
}

interface SearchFacet {
  id?: string
  items?: SearchFacetItem[]
}

export interface AdditionalFilter {
  id: string
  value: string
}

function getFacetItems(queryData: any, facetId: string) {
  const facets = (queryData?.result?.facets ?? []) as SearchFacet[]
  return facets.find((facet) => facet.id === facetId)?.items ?? []
}

function normalizePublicationStatus(value: unknown): DatasetPublicationFilter {
  return String(value ?? '').toLowerCase().includes('draft') ? 'draft' : 'published'
}

function buildPublicationValueMap(queryData: unknown) {
  const valueMap: Record<DatasetPublicationFilter, string[]> = {
    draft: [],
    published: [],
  }

  for (const item of getFacetItems(queryData, 'publication_status')) {
    const itemId = String(item.id ?? '')
    if (!itemId) continue

    const status = normalizePublicationStatus(itemId)
    if (!valueMap[status].includes(itemId)) valueMap[status].push(itemId)
  }

  return valueMap
}

export function useOrganisationDatasetFilters(sort: Ref<string>, sortDirection: Ref<string>) {
  const selectedAccessFilters = ref<DatasetAccessFilter[]>([])
  const selectedPublicationFilters = ref<DatasetPublicationFilter[]>([])
  const selectedAdditionalFilters = ref<AdditionalFilter[]>([])

  const normalizedSortDirection = computed<'asc' | 'desc'>(() =>
    sortDirection.value === 'asc' ? 'asc' : 'desc'
  )
  const requestSort = computed(() => `modified+${normalizedSortDirection.value}`)
  const filterSignature = computed(
    () =>
      [...selectedAccessFilters.value].sort().join('|') +
      '::' +
      [...selectedPublicationFilters.value].sort().join('|') +
      '::' +
      [...selectedAdditionalFilters.value].sort((a, b) => a.id.localeCompare(b.id)).join('|')
  )
  const hasActiveFilters = computed(
    () =>
      selectedAccessFilters.value.length > 0 ||
      selectedPublicationFilters.value.length > 0 ||
      selectedAdditionalFilters.value.length > 0
  )

  if (sort.value !== 'modified') sort.value = 'modified'

  watch(sort, (value) => {
    if (value !== 'modified') sort.value = 'modified'
  })

  function buildFilterFacets(unfilteredQueryData: unknown) {
    const publicationValueMap = buildPublicationValueMap(unfilteredQueryData)
    const allAccessFiltersSelected =
      selectedAccessFilters.value.length === DATASET_ACCESS_FILTERS.length
    const allPublicationFiltersSelected =
      selectedPublicationFilters.value.length === DATASET_PUBLICATION_FILTERS.length
    const publicationStatuses = allPublicationFiltersSelected
      ? []
      : [
          ...new Set(
            selectedPublicationFilters.value.flatMap((status) =>
              publicationValueMap[status].length ? publicationValueMap[status] : [status]
            )
          ),
        ]

    return {
      ...(selectedAccessFilters.value.length > 0 &&
        !allAccessFiltersSelected && {
          access_level: [
            ...new Set(
              selectedAccessFilters.value.flatMap((value) => ACCESS_FILTER_VALUES[value])
            ),
          ],
        }),
      ...(publicationStatuses.length > 0 && {
        publication_status: publicationStatuses,
      }),
      ...(selectedAdditionalFilters.value.length > 0 && selectedAdditionalFilters.value.reduce((acc, filter) => {
        acc[filter.id] = filter.value
        return acc
      }, {} as Record<string, string>)),
    }
  }

  function clearFilters() {
    selectedAccessFilters.value = []
    selectedPublicationFilters.value = []
    selectedAdditionalFilters.value = []
  }

  function toggleSortDirection() {
    sort.value = 'modified'
    sortDirection.value = normalizedSortDirection.value === 'desc' ? 'asc' : 'desc'
  }

  return {
    buildFilterFacets,
    clearFilters,
    filterSignature,
    hasActiveFilters,
    requestSort,
    selectedAccessFilters,
    selectedAdditionalFilters,
    selectedPublicationFilters,
    sortDirection: normalizedSortDirection,
    toggleSortDirection,
  }
}
