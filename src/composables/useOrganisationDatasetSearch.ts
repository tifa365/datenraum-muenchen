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

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useDebounce } from '@vueuse/core'
import { computed, ref, watch, type ComputedRef } from 'vue'
import appConfig from '@config/appConfig'
import { usePermissions } from '@/composables/useAccessPermissions'
import { useOrganisationDatasetFilters } from '@/composables/useOrganisationDatasetFilters'
import { useSearchParams } from '@/projects/kdw/composables/useSearchParams'
import { useAuthStore } from '@/stores/authStore'

export const ORGANISATION_DATASETS_QUERY_KEY = ['orgdatasetsdatasets'] as const
export const ORGANISATION_DATASETS_TOTAL_QUERY_KEY = ['orgdatasetsdatasetscount'] as const
export const ORGANISATION_CATALOGS_QUERY_KEY = ['orgdatasetscatalogs'] as const

export interface FacetItem {
  id: string
  title: string
  items: any[]
}

const ADMIN_GROUPS = new Set([
  'Administrator',
  '/Administrator',
  '/Piveau/Civora Piveau Administrator',
])

function createSearchUrl() {
  return appConfig.piveauHubSearchUrl.endsWith('/')
    ? `${appConfig.piveauHubSearchUrl}search?`
    : `${appConfig.piveauHubSearchUrl}/search?`
}

export function useOrganisationDatasetSearch() {
  const authStore = useAuthStore()
  const queryClient = useQueryClient()
  const { accessControlEnabled } = usePermissions()
  const isAccessControlEnabled = computed(() => accessControlEnabled)
  const { queryParams, sort, sortDirection } = useSearchParams()
  const filters = useOrganisationDatasetFilters(sort, sortDirection)
  const pageSize = ref(10)
  const searchInput = ref(String(queryParams.q.value ?? ''))
  const debouncedSearchInput = useDebounce(searchInput, 250)
  const groupMemberships = computed(() => authStore.user?.groupMemberships ?? [])
  const membershipsSignature = computed(() => [...groupMemberships.value].sort().join('|'))
  const searchUrl = createSearchUrl()

  const currentPage = computed({
    get: () => Math.max(1, Number(queryParams.page.value ?? 0) + 1),
    set: (value: number) => {
      queryParams.page.value = Math.max(1, value || 1) - 1
    },
  })

  const isAdmin = computed(() =>
    groupMemberships.value.some((group: string) => ADMIN_GROUPS.has(group))
  )

  const authReady = computed(() => {
    if (!isAccessControlEnabled.value || !authStore.authenticated) return true
    return Boolean(authStore.authToken) && Array.isArray(authStore.user?.groupMemberships)
  })

  const catalogsQuery = useQuery({
    queryKey: ORGANISATION_CATALOGS_QUERY_KEY,
    staleTime: 2 * 60 * 1000,
    enabled: computed(() => !isAccessControlEnabled.value),
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const results: any[] = []
      const limit = 100
      let page = 0
      let total = Infinity

      while (results.length < total) {
        const response = await fetch(
          searchUrl +
            new URLSearchParams({
              filters: 'catalogue',
              limit: limit.toString(),
              page: page.toString(),
            }).toString(),
          { method: 'GET' }
        )

        if (!response.ok) {
          throw new Error(
            `failed to fetch data from piveau ${response.status} ${response.statusText}`
          )
        }

        const data = await response.json()
        const pageResults = data?.result?.results ?? []
        total = data?.result?.count ?? pageResults.length
        results.push(...pageResults)
        page += 1
      }

      return { result: { results } }
    },
  })

  function hasCatalogMembership(catalogId: string) {
    return groupMemberships.value.some(
      (group: string) =>
        group === catalogId || group === `/${catalogId}` || group.startsWith(`/${catalogId}/`)
    )
  }

  function buildAccessFacets() {
    if (isAccessControlEnabled.value || isAdmin.value) return {}

    const catalogs = catalogsQuery.data.value?.result?.results ?? []
    const superCatalogs = catalogs
      .filter((catalog: any) => catalog.has_part && hasCatalogMembership(catalog.id))
      .map((catalog: any) => catalog.id)
    const memberCatalogs = catalogs
      .filter((catalog: any) => !catalog.has_part && hasCatalogMembership(catalog.id))
      .map((catalog: any) => catalog.id)

    if (superCatalogs.length === 0 && memberCatalogs.length === 0) return null

    return {
      ...(superCatalogs.length > 0 && { superCatalog: superCatalogs }),
      ...(memberCatalogs.length > 0 && { catalog: memberCatalogs }),
    }
  }

  function getRequestOptions(): RequestInit {
    return {
      method: 'GET',
      ...(isAccessControlEnabled.value &&
        authStore.authToken && {
          headers: {
            Authorization: `Bearer ${authStore.authToken}`,
            'Content-Type': 'application/json',
          },
        }),
    }
  }

  const enableDatasetQueries = computed(
    () =>
      authReady.value &&
      (isAccessControlEnabled.value || catalogsQuery.isSuccess.value)
  )

  const totalQuery = useQuery({
    queryKey: [...ORGANISATION_DATASETS_TOTAL_QUERY_KEY, membershipsSignature],
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: enableDatasetQueries,
    placeholderData: (previousData: unknown) => previousData,
    queryFn: async () => {
      const facets = buildAccessFacets()
      if (!facets) return { result: { count: 0, facets: [] } }

      const response = await fetch(
        searchUrl +
          new URLSearchParams({
            facets: JSON.stringify(facets),
            filters: 'dataset',
            facetOperator: 'OR',
            facetGroupOperator: 'AND',
            limit: '1',
            page: '0',
            ...(isAccessControlEnabled.value && {
              accessControlPermissions: 'edit,publish,delete',
            }),
          }).toString(),
        getRequestOptions()
      )

      if (!response.ok) {
        throw new Error(
          `failed to fetch data from piveau ${response.status} ${response.statusText}`
        )
      }

      return response.json()
    },
  })

  const datasetsQuery = useQuery({
    queryKey: [
      ...ORGANISATION_DATASETS_QUERY_KEY,
      membershipsSignature,
      filters.filterSignature,
      filters.requestSort,
      debouncedSearchInput,
      currentPage,
      pageSize,
    ],
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: enableDatasetQueries,
    placeholderData: (previousData: unknown) => previousData,
    queryFn: async () => {
      const accessFacets = buildAccessFacets()
      if (!accessFacets) return { result: { results: [], count: 0 } }
      const facets = {
        ...accessFacets,
        ...filters.buildFilterFacets(totalQuery.data.value),
      }

      const response = await fetch(
        searchUrl +
          new URLSearchParams({
            q: debouncedSearchInput.value,
            facets: JSON.stringify(facets),
            filters: 'dataset',
            sort: filters.requestSort.value,
            facetOperator: 'OR',
            facetGroupOperator: 'AND',
            limit: pageSize.value.toString(),
            page: (currentPage.value - 1).toString(),
            ...(isAccessControlEnabled.value && {
              accessControlPermissions: 'edit,publish,delete',
            }),
          }).toString(),
        getRequestOptions()
      )

      if (!response.ok) {
        throw new Error(
          `failed to fetch data from piveau ${response.status} ${response.statusText}`
        )
      }

      return response.json()
    },
  })

  const totalRecords = computed(() => datasetsQuery.data.value?.result?.count ?? 0)
  const totalItemsCount = computed(() => totalQuery.data.value?.result?.count ?? 0)
  const availableFacets: ComputedRef<FacetItem[]> = computed(() => datasetsQuery.data.value?.result?.facets ?? [])

  const isLoading = computed(
    () =>
      (!isAccessControlEnabled.value && catalogsQuery.isPending.value) ||
      totalQuery.isPending.value ||
      datasetsQuery.isPending.value ||
      datasetsQuery.isFetching.value
  )

  watch(
    () => queryParams.q.value,
    (value) => {
      const nextValue = String(value ?? '')
      if (searchInput.value !== nextValue) searchInput.value = nextValue
    }
  )

  watch(debouncedSearchInput, (value) => {
    if (String(queryParams.q.value ?? '') !== value) queryParams.q.value = value
  })

  watch(
    [
      searchInput,
      pageSize,
      filters.selectedAccessFilters,
      filters.selectedPublicationFilters,
      filters.selectedAdditionalFilters,
      filters.sortDirection,
    ],
    () => {
      currentPage.value = 1
    }
  )

  watch([totalRecords, pageSize], () => {
    const maximumPage = Math.max(1, Math.ceil(totalRecords.value / pageSize.value))
    if (currentPage.value > maximumPage) currentPage.value = maximumPage
  })

  watch([authReady, membershipsSignature, () => authStore.authToken], ([ready]) => {
    if (ready) refresh()
  })

  async function refresh() {
    if (!isAccessControlEnabled.value) await catalogsQuery.refetch()
    await queryClient.invalidateQueries({ queryKey: ORGANISATION_DATASETS_TOTAL_QUERY_KEY })
    await queryClient.invalidateQueries({ queryKey: ORGANISATION_DATASETS_QUERY_KEY })
    await totalQuery.refetch()
    return datasetsQuery.refetch()
  }

  return {
    catalogsQuery,
    currentPage,
    datasetsQuery,
    ...filters,
    isAccessControlEnabled,
    isLoading,
    pageSize,
    refresh,
    searchInput,
    availableFacets,
    totalItemsCount,
    totalRecords,
    totalQuery,
  }
}
