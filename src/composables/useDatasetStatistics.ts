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

import { computed } from "vue"
import { useQuery } from "@tanstack/vue-query"
import appConfig from "@/../config/appConfig"

const searchUrl = appConfig.piveauHubSearchUrl.endsWith('/')
  ? appConfig.piveauHubSearchUrl + 'search?'
  : appConfig.piveauHubSearchUrl + '/search?'
const staleTime = 60 * 60 * 24 * 1000
const refetchOnWindowFocus = false

export function useDatasetStatistics() {

  const datasetsQuery = useQuery({
    queryKey: ['datasetsStats'],
    refetchOnWindowFocus,
    staleTime,
    queryFn: async () => {
      const response = await fetch(
        searchUrl + new URLSearchParams({
          filter: 'dataset',
          limit: '0'
        }).toString(),
      )
      if (!response.ok) {
        throw new Error(`failed to fetch dataset statistics from piveau ${response.status} ${response.statusText}`);
      }
      return await response.json()
    },
  })

  const distributionsQuery = useQuery({
  queryKey: ['distributionsCount'],
  refetchOnWindowFocus,
  staleTime,
  queryFn: async () => {
    const response = await fetch(
      searchUrl + new URLSearchParams({
        filter: 'dataset',
        limit: '0'
      }).toString()
    )
    if (!response.ok) {
      throw new Error(`failed to fetch distribution statistics from piveau ${response.status} ${response.statusText}`);
    }
    const data = await response.json()
    const facets = data?.result?.facets ?? []

    const facet = facets.find((f: any) => f.id === 'distributions_total')
    if (!facet) {
      throw new Error("facet 'distributions_total' not found in response")
    }

    const categories = facets.find((f: any) => f.id === 'categories')
    if (!categories) {
      throw new Error("facet 'categories' not found in response")
    }
    return {
      distributions: facet.items.length,
      categories: categories.items
    }
  },
})


  const isError = computed(() =>
    datasetsQuery.isError || distributionsQuery.isError
  )
  const isLoading = computed(() =>
    datasetsQuery.isLoading || distributionsQuery.isLoading
  )

  const datasetsCount = computed(() => {
    if (datasetsQuery.isSuccess && !!datasetsQuery.data.value) {
      return datasetsQuery.data.value?.result.count
    }
    return '-'
  })

  const publisherCount = computed(() => {
    if (datasetsQuery.isSuccess && !!datasetsQuery.data.value) {
      const publisherFacet = datasetsQuery.data.value?.result.facets
        .find((facet: any) => facet.id === 'publisher')
      if (publisherFacet) {
        return publisherFacet.items.length
      }
    }
    return '-'
  })

  const distributionsCount = computed(() => {
    if (distributionsQuery.isSuccess && distributionsQuery.data.value != null) {
      return distributionsQuery.data.value.distributions
    }
    return '-'
  })

   const categories = computed(() => distributionsQuery?.data?.value?.categories)

  return {
    datasetsCount,
    distributionsCount,
    publisherCount,
    isError,
    isLoading,
    categories
  }
}