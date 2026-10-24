<!--
  ~ This file is part of Civora UI.
  ~
  ~ Copyright (C) 2025 DKSR GmbH.
  ~
  ~ Civora UI is free software: you can redistribute it and/or modify
  ~ it under the terms of the GNU Affero General Public License as published by
  ~ the Free Software Foundation, version 3.
  ~
  ~ This program is distributed in the hope that it will be useful,
  ~ but WITHOUT ANY WARRANTY; without even the implied warranty of
  ~ MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  ~ GNU Affero General Public License for more details.
  ~
  ~ You should have received a copy of the GNU Affero General Public License
  ~ along with this program. If not, see <https://www.gnu.org/licenses/>.
-->

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import appConfig from '@config/appConfig'
import { useAuthStore } from '@/stores/authStore'
import { getTranslationFor, getLocalizedValue } from '@/projects/kdw/sdk/utils/helpers'
import KDataInfoBox from '@/projects/kdw/components/base/data-info-box/KDataInfoBox.vue'
import CIVDataInfoBox from '../civora-ui/CIVDataInfoBox.vue'

const route = useRoute()
const organisationId = route.params.organisationId || ''
const staleTime = 2 * 60 * 1000

const authStore = useAuthStore()

const DataInfoBox = appConfig.customer.useNewCivoraUi === 'true' ? CIVDataInfoBox : KDataInfoBox
const { locale } = useI18n()

var q = ref('')
const searchUrlDataset = appConfig.piveauHubSearchUrl.endsWith('/')
  ? appConfig.piveauHubSearchUrl + 'search?'
  : appConfig.piveauHubSearchUrl + '/search?'


const enableAccessControl = computed(() => {
  const flag = (appConfig as any).customer?.enableDataSetLevelAccessControl
  return flag === true || flag === 'true'
})

const datasetsQuery = useQuery({
  queryKey: computed(() => [
    `orgdetaildatasets${organisationId}`,
    authStore.authenticated,
    authStore.user?.username ?? 'anonymous',
  ]),
  staleTime: staleTime,
  refetchOnWindowFocus: false,
  queryFn: async () => {
    // query for all datasets that either belong to the super catalog OR the catalog itself
    const facets = `{"catalog":["${organisationId}"],"superCatalog":["${organisationId}"]}`
    const authToken = enableAccessControl.value && authStore.authenticated
      ? await authStore.getAuthToken()
      : undefined
    const response = await fetch(
      searchUrlDataset +
        new URLSearchParams({
          facets: facets,
          q: q.value,
          /*
          without this facetGroupOperator the search would never match
          as catalog and superCatalog can not be the same for one dataset
           */
          facetGroupOperator: 'OR',
          filter: 'dataset',
          sort: 'issued+desc',
          limit: '50',
        }).toString(),
      {
        method: 'GET',
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : undefined,
      }
    )
    if (!response.ok) {
      throw new Error(`failed to fetch data from piveau ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    return data
  },
})

const items = computed(() => {
  if (datasetsQuery.isSuccess.value && datasetsQuery.data.value) {
    return datasetsQuery.data.value?.result.results.map((dataset: any) => {
      const formats = dataset?.distributions?.length
        ? [
          ...new Set(
            dataset.distributions
              .map((d: any) => d?.format?.label || '')
              .filter(Boolean)
          ),
        ]
        : []

      return {
        title: getTranslationFor(dataset?.title, locale),
        superTitle: dataset?.publisher?.name,
        to: `/app/data-catalog/${dataset?.id}`,
        categories: dataset?.categories
          ? dataset.categories?.map((category) =>
              getLocalizedValue({ obj: category?.label, fallbackLocale: locale }))
          : [],
        formats,
        issued: formatDate(dataset?.issued),
        datasetType: enableAccessControl.value
                  ? dataset?.catalog_record?.access_level
                  : (dataset as any)?.public === false ? 'kritis' : 'opendata',
      }
    })
  }
  return []
})
function searchAgain() {
  datasetsQuery.refetch()
}
const dateTimeFormat = Intl.DateTimeFormat('DE-de')
function formatDate(date: string) {
  if (!date) {
    return '-'
  }
  const parsedDate = new Date(date)
  if (parsedDate.toString() === 'Invalid Date') {
    return '-'
  }
  return dateTimeFormat.format(parsedDate)
}
</script>
<template>
  <div class="row">
    <input
      type="search"
      v-model="q"
      @keyup.enter="searchAgain"
      :placeholder="$t('organisation.datasets.search')" />
  </div>

  <div
    class="row"
    v-if="items.length == 0">
    {{ $t('organisation.datasets.noData') }}
  </div>

  <div v-if="items.length >= 1">
    <div class="data-info">
      <component :is="DataInfoBox" v-for="(item, i) in items" :key="i" v-bind="item" />
    </div>
  </div>
</template>

<style scoped>
.data-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 40px;
}

.row {
  font-size: 14px;
  font-weight: 500;
  display: flex;
  width: calc(100% - 60px);
  margin: 20px 40px;
  padding: 5px;
}
    
input[type='search'] {
  border: 1px solid var(--color-border);
  padding: 15px 15px 15px 50px;
  border-radius: 3px;
  width: 50%;
  margin: 20px 0px;
  background: url(../../assets/icons/Searchgray.svg) no-repeat scroll 15px 15px;
  font-weight: 400;
}
@media (max-width: 768px) {
  .row {
    flex-wrap: wrap;
    margin: 10px 20px;
    width: unset;
  }
  input[type='search'] {
    width: 100%;
  }
}
</style>
