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

import { type MaybeRefOrGetter, computed, ref, toValue } from 'vue'
import { useRouteQuery } from '@vueuse/router'
import { useRoute, useRouter } from 'vue-router'
import { syncRef } from '@vueuse/core'
import { useDatasetsSearch } from '../sdk'
import appConfig from '@/../config/appConfig.js'

export function useSearchParams(locale?: MaybeRefOrGetter) {
  const { refSyncedWithRouteQuery } = useDatasetsSearch()

  const q = refSyncedWithRouteQuery('q', '')
  const limit = refSyncedWithRouteQuery('limit', appConfig.customer.modules.dataCatalog?.datasetsPerPage || 10)
  const displayedPage = refSyncedWithRouteQuery('page', 1)
  const page = computed({
    get: () => displayedPage.value - 1,
    set: (val: number) => {
      displayedPage.value = val + 1
    },
  })

  const sort = ref('modified')
  const sortDirection = ref('desc')
  // const computedSort = computed(() => `${sort.value}+${sortDirection.value}`)
  const computedSort = computed({
    get() {
      return `${sort.value}+${sortDirection.value}`
    },
    set(val: string) {
      const [sortValue, sortDirectionValue] = val.split('+')
      sort.value = sortValue
      sortDirection.value = sortDirectionValue
    },
  })
  const finalComputedSort = computed(() => {
    const unrefLocale = toValue(locale) || 'de'
    const titleSort = `title.${unrefLocale}+${sortDirection.value}`
    if (sort.value === 'relevance') return `${computedSort.value},modified+desc,${titleSort}`
    if (sort.value === 'modified') return `${computedSort.value},relevance+desc,${titleSort}`
    if (sort.value === 'issued') return `${computedSort.value},relevance+desc,${titleSort}`
    return computedSort.value
  })
  const routerQuerySort = useRouteQuery<string>('sort', 'modified+desc', {
    mode: 'push',
    router: useRouter(),
    route: useRoute(),
  })
  syncRef(routerQuerySort, computedSort, { direction: 'both' })

  return {
    displayedPage,
    queryParams: {
      q,
      limit,
      page,
      sort: finalComputedSort,
    },
    sort,
    sortDirection,
  }
}
