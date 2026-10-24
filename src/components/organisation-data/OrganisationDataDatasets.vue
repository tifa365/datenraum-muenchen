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
import { computed, onActivated, onMounted, onUnmounted, ref, watchEffect, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getTranslationFor } from '@/projects/kdw/sdk/utils/helpers'
import appConfig from '@config/appConfig'
import { useAuthStore } from '@/stores/authStore'
import { useDatasetDrafts } from '@/composables/useDatasetDrafts'
import { useDpiUtils } from '../../projects/kdw/utils/dpi'
import Paginator from 'primevue/paginator'
import CIVSearchInput from '../civora-ui/CIVSearchInput.vue'

const { toEditMode } = useDpiUtils()

const { revertDatasetToDraft } = useDatasetDrafts()

interface DatasetItem {
  id: string
  catalogId: string
  name: string
  status: string
  modified: string
  url: string
  distributions: string[]
  license: string | undefined
}

let authStore = useAuthStore()
const staleTime = 2 * 60 * 1000

const page = ref(1)
const limit = ref(10)

const dropdownOpen = ref<Record<number, boolean>>({})

var q = ref('')
const itemsList = ref<DatasetItem[]>([])

const searchUrlDataset = appConfig.piveauHubSearchUrl.endsWith('/')
  ? appConfig.piveauHubSearchUrl + 'search?'
  : appConfig.piveauHubSearchUrl + '/search?'

const catalogsQuery = useQuery({
  queryKey: ['orgdatasetscatalogs'],
  staleTime: staleTime,
  refetchOnWindowFocus: false,
  queryFn: async () => {
    const allResults: any[] = []
    const limit = 100
    let page = 0
    let totalResults = Infinity

    while (allResults.length < totalResults) {
      const response = await fetch(
        searchUrlDataset +
          new URLSearchParams({
            filters: 'catalogue',
            limit: limit.toString(),
            page: page.toString(),
          }).toString(),
        { method: 'GET' }
      )

      if (!response.ok) throw new Error(`failed to fetch data from piveau ${response.status} ${response.statusText}`)

      const data = await response.json()
      const results = data?.result?.results || []
      totalResults = data?.result?.count ?? results.length
      allResults.push(...results)

      page++
    }

    return {
      result: {
        results: allResults,
      },
    }
  },
})

const enableDatasetsQuery = computed(() => catalogsQuery.isSuccess.value)
const datasetsQuery = useQuery({
  queryKey: ['orgdatasetsdatasets', page.value],
  staleTime: staleTime,
  refetchOnWindowFocus: false,
  enabled: enableDatasetsQuery,
  queryFn: async () => {
    const isAdmin = authStore.user?.groupMemberships.includes('/Piveau/Civora Piveau Administrator') ||
                    authStore.user?.groupMemberships.includes('/Administrator')

    let facetsObject = {};

    if (!isAdmin) {
      const facetSuperCatalogueGroups = catalogsQuery.data.value?.result.results
        .filter(
          (catalog: any) =>
            catalog.has_part && authStore.user?.groupMemberships.includes(`/${catalog.id}`)
        )
        .map((superCatalog: any) => superCatalog.id)

      const facetCatalogueGroups = catalogsQuery.data.value?.result.results
        .filter(
          (catalog: any) => authStore.user?.groupMemberships.includes(`/${catalog.id}`)
        )
        .map((catalog: any) => catalog.id)

      if ((!facetSuperCatalogueGroups || facetSuperCatalogueGroups.length === 0)
          && (!facetCatalogueGroups || facetCatalogueGroups.length === 0)) {
        return { result: { results: [] } }
      }

      facetsObject = {
        ...(facetSuperCatalogueGroups.length > 0 && { superCatalog: facetSuperCatalogueGroups }),
        ...(facetCatalogueGroups.length > 0 && { catalog: facetCatalogueGroups }),
      }
    }

    const facets = JSON.stringify(facetsObject)

    const response = await fetch(
      searchUrlDataset +
        new URLSearchParams({
          facets,
          filters: 'dataset',
          sort: 'issued+desc',
          facetOperator: 'OR',
          facetGroupOperator: 'OR',
          limit: limit.value.toString(),
          page: (page.value - 1).toString(), // backend starts with 0 index
          q: q.value,
        }).toString(),
      {
        method: 'GET',
      }
    )
    if (!response.ok) {
      throw new Error(`failed to fetch data from piveau ${response.status} ${response.statusText}`)
    }

    return await response.json()
  },
})

watch(page, () => {
  datasetsQuery.refetch()
})

watch(limit, () => {
  page.value = 1
  datasetsQuery.refetch()
})

watchEffect(() => {
  if (datasetsQuery.isSuccess.value && datasetsQuery.data.value) {
    datasetsQuery.data?.value?.result.results &&
      (itemsList.value = datasetsQuery.data.value.result.results.map(
        (dataset: { id: any; catalog: { id: any }; title: any; issued: any; distributions: any[] }) => ({
          id: dataset.id,
          catalogId: dataset.catalog.id,
          name: dataset.title,
          status: 'public',
          modified: dataset.issued,
          url: `app/data-catalog/${dataset.id}`,
          distributions: [
            ...new Set(dataset?.distributions?.map((distribution) => distribution.format?.label).filter(Boolean) || []),
          ],
          license: dataset.distributions?.[0]?.license?.label,
        })
      ))
  }
})

onActivated(() => {
  datasetsQuery.refetch()
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

async function editItem(item: { id: any; catalogId: any }) {
  try {
    handleEdit(item.id, item.catalogId)
    closeAllDropdowns()
  } catch (error) {
    console.error(error)
  }
}

function handleEdit(datasetId: any, catalogId: any) {
  toEditMode({
    id: datasetId,
    catalogId: catalogId,
    isDraft: false,
  })
}

async function revertToDraft(item: { id: any; catalogId: any }) {
  try {
    const response = await revertDatasetToDraft(item.id, item.catalogId)
    if (response?.ok) {
      itemsList.value = itemsList.value.filter((dataset) => dataset.id !== item.id)
      closeAllDropdowns()
    } else {
      console.error(`Failed to revert item to draft: ${response?.statusText}`)
    }
  } catch (error) {
    console.error('Error reverting dataset to draft:', error)
  }
}

function toggleDropdown(index: number) {
  dropdownOpen.value = { ...dropdownOpen.value, [index]: !dropdownOpen.value[index] }
}

function closeAllDropdowns() {
  dropdownOpen.value = {}
}

function handleOutsideClick(event: MouseEvent) {
  const target = event.target as Element
  if (!target.closest('.dropdown')) {
    closeAllDropdowns()
  }
}

onMounted(() => {
  catalogsQuery.refetch().then(() => {
    datasetsQuery.refetch()
  })
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>
<template>
  <div class="row">
    <form @submit.prevent="searchAgain" class="searchInput">
      <CIVSearchInput v-model="q" :onClear="searchAgain" :has-search-button="false"
        :placeholder="$t('organisation.datasets.search')" />
    </form>
  </div>

  <div
    class="row"
    v-if="itemsList.length == 0">
    {{ $t('organisation.datasets.noData') }}
  </div>

  <div
    v-if="itemsList.length > 0"
    class="table-container">
    <div class="row">
      <div class="col">{{ $t('organisation.datasets.datasetName') }}</div>
      <div class="col">{{ $t('organisation.datasets.createdOn') }}</div>
      <div class="col">{{ $t('organisation.datasets.license') }}</div>
      <div class="col">{{ $t('organisation.datasets.format') }}</div>
      <div class="col"></div>
    </div>
    <template
      v-for="(item, i) in itemsList"
      :key="i">
      <a
        :href="item.url"
        class="row row-data link-container">
        <div class="col">
          {{ getTranslationFor(item.name, $i18n.locale) }}
        </div>
        <div class="cos-orgnews-widget-grid-item-status-container col">
          {{ formatDate(item.modified) }}
        </div>
        <div class="cos-orgnews-widget-grid-item-status-container col">
          {{ item.license }}
        </div>
        <div class="cos-orgnews-widget-grid-item-format-container col">
          <span
            v-for="(format, key) in item.distributions"
            :key="key"
            class="cos-orgnews-widget-grid-item-format">
            {{ format }}
          </span>
        </div>
        <div class="col">
          <div
            class="dropdown"
            ref="dropdowns">
            <img
              @click.stop.prevent="toggleDropdown(i)"
              class="dropdown-button"
              src="../../../src/assets/icons/ThreeDotsVertical.svg" />
            <div
              class="dropdown-content"
              v-show="dropdownOpen[i]">
              <a @click.stop.prevent="editItem(item)">{{ $t('organisation.datasets.edit') }}</a>
              <a @click.stop.prevent="revertToDraft(item)">{{ $t('organisation.datasets.setToDraft') }}</a>
            </div>
          </div>
        </div>
      </a>
    </template>
  </div>
  <div class="grid w-full place-content-center">
    <Paginator
      :first="(page - 1) * limit"
      :rows="limit"
      :total-records="datasetsQuery.data?.value?.result?.count || 0"
      @page="(e) => page = Math.floor(e.first / limit) + 1"
      class="rounded" />
  </div>
</template>

<style scoped>
.dropdown {
  position: relative;
}

.dropdown-button {
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
}

.dropdown-button:hover {
  background-color: #f4f6f9;
}

.dropdown-content {
  position: absolute;
  background-color: var(--color-bg-darker);
  border: solid 1px #d5d7da;
  border-radius: 8px;
  width: 180px;
  height: auto;
  z-index: 1;
  right: 0;
  top: -90px;
}

.dropdown-content a {
  margin: auto;
  padding: 10px;
  text-decoration: none;
  display: block;
  color: #1a2025;
  font-size: 16px;
  font-weight: 400;
  line-height: 26px;
}

.dropdown-content a:hover {
  background-color: #d5d7da;
}

.cos-orgnews-widget-grid-item-format-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
}

.cos-orgnews-widget-grid-item-format {
  width: fit-content;
  height: fit-content;
  padding: 4px;
  background: var(--color-bg-darker);
  border: 1px solid var(--color-border);
  border-radius: 8px;

  font-family: var(--font-family), sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #33404a;
}

.row {
  font-family: var(--font-family), serif;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  width: calc(100% - 60px);
  margin: 20px 40px;
  padding: 5px;
}

.row-data {
  font-size: 15px;
  font-weight: 400;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 30px 20px;
}

.row .col {
  width: calc((100% - 54px) / 5);
  padding: 5px;
  display: flex;
  align-items: center;
}

.row .col:first-of-type {
  width: calc((100% - 54px) / 5 * 2);
  padding-right: 25px;
  word-break: break-word;
}

.row .col:last-of-type {
  width: 54px;
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

.row-data.link-container {
  text-decoration: none;
  color: inherit;
  transition: background-color 0.3s ease;
  cursor: default;
}

.row-data.link-container:hover {
  background-color: #f0f0f0; /* Light grey background on hover */
}

.row-data .dropdown-content a {
  color: #1a2025;
}

.row-data .dropdown-content a:hover {
  background-color: #d5d7da;
}

.searchInput {
  max-width: 716px;
  width: 100%;
}

@media (max-width: 768px) {
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0 10px;
    min-width: 450px;
  }

  .row {
    font-family: var(--font-family), serif;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    width: 100%;
    margin: 20px 0;
    padding: 5px;
  }

  .row-data {
    font-size: 15px;
    font-weight: 400;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    padding: 30px 20px;
  }

  .row .col {
    width: calc((100% - 54px) / 5);
    padding: 5px;
    display: flex;
    align-items: center;
  }

  .row .col:first-of-type {
    width: calc((100% - 54px) / 5 * 2);
  }

  .row .col:last-of-type {
    width: 54px;
    position: sticky;
    right: 0;
    background-color: white;
    z-index: 2;
  }

  .dropdown-container {
    display: flex;
    align-items: center;
  }

  .dropdown {
    position: relative;
  }

  .dropdown-button {
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
  }

  .dropdown-button:hover {
    background-color: #f4f6f9;
  }

  .dropdown-content {
    position: absolute;
    background-color: var(--color-bg-darker);
    border: solid 1px #d5d7da;
    border-radius: 8px;
    width: 180px;
    height: auto;
    z-index: 1;
    right: 0;
    top: -90px;
  }

  .dropdown-content a {
    margin: auto;
    padding: 10px;
    text-decoration: none;
    display: block;
    color: #1a2025;
    font-size: 16px;
    font-weight: 400;
    line-height: 26px;
  }

  .dropdown-content a:hover {
    background-color: #d5d7da;
  }
}
</style>
