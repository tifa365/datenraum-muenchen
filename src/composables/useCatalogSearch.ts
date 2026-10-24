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
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useQueries, useQueryClient } from '@tanstack/vue-query'
import { schemaCatalog, type SearchResult } from '@piveau/sdk-core'
import { createUseResourceSearch } from '@piveau/sdk-vue'
import { useI18n } from 'vue-i18n'
import appConfig from '@config/appConfig'
import { useAuthStore } from '@/stores/authStore'
import { usePermissions } from './useAccessPermissions'
import { useCatalogMetricsUrls } from './useCatalogMetricsUrls'
import {
  fetchAllCatalogs,
  fetchCatalogPage,
  fetchCatalogQuality,
  type CatalogQuality,
  type CatalogResource,
  type LocalizedText,
} from '@/services/catalogSearch'

export interface CatalogListItem {
  id: string
  isOpenDataPresence: boolean
  name: LocalizedText
  publisher: string
  description: LocalizedText
  quality: CatalogQuality
  qualityLoading: boolean
  canEdit: boolean
}

const STALE_TIME = 2 * 60 * 1000
const PAGE_SIZE = 10

export interface CatalogSearchOptions {
  /** Additional filtering after checking catalogue visibility. */
  filter?: (catalog: CatalogResource) => boolean
}

export function useCatalogSearch(options: CatalogSearchOptions = {}) {
  const { locale, t } = useI18n()
  const authStore = useAuthStore()
  const { accessControlEnabled, permissionsKey, canSeeCatalog, canEditCatalog } = usePermissions()
  const paginateLocally = accessControlEnabled || Boolean(options.filter)

  // Dataset management owns the route-level q/page parameters. Keeping catalogue
  // state here prevents one tab from silently changing the other tab's results.
  const searchQuery = ref('')
  const page = ref(0)
  const serverPage = computed(() => paginateLocally ? 0 : page.value)

  const { metricsCacheUrl } = useCatalogMetricsUrls()
  const userKey = computed(() =>
    authStore.authenticated ? authStore.user?.username || 'authenticated-user' : 'anonymous-user'
  )

  if (accessControlEnabled) {
    // A different user or permission set can have fewer pages of visible catalogues.
    watch([userKey, () => permissionsKey.value], () => {
      page.value = 0
    })
  }

  const queryEnabled = computed(
    () => !accessControlEnabled || (Boolean(authStore.authenticated) && Boolean(authStore.rptToken))
  )

  function setSearchQuery(value: string) {
    searchQuery.value = value.trim()
    page.value = 0
  }

  function setPageFromFirstRow(firstRow: number) {
    page.value = Math.max(0, Math.floor(firstRow / PAGE_SIZE))
  }

  function getAccessToken(): string | undefined {
    // Match dataset search: send the current access token, never the RPT.
    // The auth store owns refreshes, so changing tabs cannot trigger one.
    return accessControlEnabled && authStore.authenticated ? authStore.authToken : undefined
  }

  const queryClient = useQueryClient()
  const { useSearch } = createUseResourceSearch<string, {}, 'catalogue', CatalogResource>({
    resourceSearchOptions: {
      baseUrl: appConfig.piveauHubSearchUrl,
      index: 'catalogue',
      schema: schemaCatalog,
      enabled: queryEnabled,
    },
    getters: {},
    options: {
      qc: queryClient,
      fetcherFn: async ({ params }): Promise<SearchResult<CatalogResource>> => {
        const searchOptions = {
          baseUrl: appConfig.piveauHubSearchUrl,
          query: params.q ?? '',
          accessToken: getAccessToken(),
        }

        // Catalogue metadata can be public even with an access token. Collect all
        // pages before applying visibility and caller filters so totals stay accurate.
        // https://doc.piveau.io/hub/access-control/#configuration-of-document-types-exempt-from-access-control-hub-search
        const result = paginateLocally
          ? await fetchAllCatalogs(searchOptions).then((catalogs) => ({ catalogs, total: catalogs.length }))
          : await fetchCatalogPage({ ...searchOptions, page: params.page ?? 0, pageSize: PAGE_SIZE })

        return { result: { results: result.catalogs, count: result.total, facets: [], index: 'catalogue' } }
      },
    },
  })

  const { query: catalogsQuery, getSearchResults, getSearchResultsCount } = useSearch({
    queryParams: {
      q: searchQuery,
      page: serverPage,
      limit: PAGE_SIZE,
    },
    // The SDK includes additionalParams in its cache key. These identify our
    // fetcher and permission context; the fetcher never forwards them to the API.
    additionalParams: computed(() => ({
      catalogSearch: {
        baseUrl: appConfig.piveauHubSearchUrl,
        paginateLocally,
        user: accessControlEnabled ? userKey.value : undefined,
        permissions: accessControlEnabled ? permissionsKey.value : undefined,
      },
    })),
    queryOptions: { staleTime: STALE_TIME, refetchOnWindowFocus: false },
  })

  // The SDK reads reactive parameters when a paused request resumes. Cancel
  // abandoned paused searches so new parameters cannot populate an old cache key.
  function cancelInactivePausedSearches() {
    void queryClient.cancelQueries({
      type: 'inactive',
      fetchStatus: 'paused',
      predicate: (query) => query.queryKey.some((part) =>
        typeof part === 'object' && part !== null && 'catalogSearch' in part
      ),
    })
  }
  watch([searchQuery, serverPage, userKey, permissionsKey, queryEnabled], cancelInactivePausedSearches, { flush: 'post' })
  onScopeDispose(cancelInactivePausedSearches)

  // keepPreviousData reports success during a new request. Pending/loading alone
  // miss it; placeholder data must also stay hidden when a request is paused.
  const isLoading = computed(() => queryEnabled.value && (
    catalogsQuery.isPending.value || catalogsQuery.isFetching.value || catalogsQuery.isPlaceholderData.value
  ))
  const canShowResults = computed(() => queryEnabled.value && !isLoading.value && !catalogsQuery.isError.value)
  const availableCatalogs = computed(() => {
    if (!canShowResults.value) return []
    const catalogs = getSearchResults.value ?? []
    // Recheck current permissions when cached data is rendered, including logout
    // and permission changes while a request is still in flight.
    return catalogs.filter((catalog) =>
      (!accessControlEnabled || canSeeCatalog(catalog)) && (!options.filter || options.filter(catalog))
    )
  })
  const total = computed(() =>
    !canShowResults.value ? 0 : paginateLocally ? availableCatalogs.value.length : getSearchResultsCount.value
  )
  const catalogsOnCurrentPage = computed<CatalogResource[]>(() => {
    const catalogs = availableCatalogs.value
    if (!paginateLocally) return catalogs

    const first = page.value * PAGE_SIZE
    return catalogs.slice(first, first + PAGE_SIZE)
  })

  function mapCatalog(catalog: CatalogResource): CatalogListItem {
    const id = catalog.id || ''
    return {
      id,
      isOpenDataPresence: catalog.is_open_data_presence === true,
      name: catalog.title || catalog.name || { [locale.value]: t('organisation.catalogs.noName') },
      publisher: catalog.publisher?.name || '-',
      description: catalog.description || {},
      quality: null,
      qualityLoading: Boolean(id && metricsCacheUrl),
      canEdit: canEditCatalog(catalog),
    }
  }

  const catalogItems = computed(() => catalogsOnCurrentPage.value.map(mapCatalog))
  const qualityQueries = useQueries({
    queries: () =>
      catalogItems.value.map((catalog) => ({
        queryKey: ['catalog-quality', metricsCacheUrl, catalog.id],
        queryFn: () => fetchCatalogQuality(metricsCacheUrl, catalog.id),
        enabled: Boolean(metricsCacheUrl && catalog.id),
        staleTime: STALE_TIME,
        refetchOnWindowFocus: false,
      })),
  })

  const catalogs = computed<CatalogListItem[]>(() =>
    catalogItems.value.map((catalog, index) => {
      const qualityQuery = qualityQueries.value[index]

      return {
        ...catalog,
        quality: qualityQuery?.data ?? null,
        qualityLoading:
          Boolean(metricsCacheUrl && catalog.id) && (qualityQuery == null || qualityQuery.isPending),
      }
    })
  )

  return {
    catalogs,
    total,
    page,
    pageSize: PAGE_SIZE,
    searchQuery,
    setSearchQuery,
    setPageFromFirstRow,
    isLoading,
    isFetching: catalogsQuery.isFetching,
  }
}
