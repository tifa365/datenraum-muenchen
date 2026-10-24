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
import Paginator from 'primevue/paginator'
import { computed, nextTick, ref, toRef, toRefs, unref, watch } from 'vue'
import { useSelectedFacets } from '../composables/useSelectedFacets'
import { useSearchParams } from '../composables/useSearchParams'
import SearchPageLayout from '../components/layout/SearchPageLayout.vue'
import Sidebar from 'primevue/sidebar'
import Typography from '../components/base/typography/Typography.vue'
import KButton from '../components/base/button/KButton.vue'
import CIVViewHeader from '@/components/civora-ui/CIVViewHeader.vue'
import CIVButton from '@/components/civora-ui/CIVButton.vue'
import { useRouter } from 'vue-router'
import { usePermissions } from '@/composables/useAccessPermissions'
import KSearchInput from '../components/search-input/KSearchInput.vue'
import KDataInfoBox from '../components/base/data-info-box/KDataInfoBox.vue'
import KSearchInfoPanel from '../components/base/search-info-panel/SearchInfoPanel.vue'
import SelectedFacetsOverview from '../components/selected-facets-overview/SelectedFacetsOverview.vue'
import FacetSidebar from '../components/facet-sidebar/FacetSidebar.vue'
import { useDatasetsSearch } from '@/composables/useDatasetsSearch'
import { getLicenseLabelShort, getLocalizedValue } from '../sdk/utils/helpers'
import PhGlobeHemisphereWestLight from '~icons/ph/globe-hemisphere-west'
import PhTextAlignLeft from '~icons/ph/text-align-left';
import { useRoute, type LocationQueryValue } from "vue-router";
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'
import type { DatasetType } from '../utils/types'
import appConfig from '@config/appConfig'
import CIVDatasetList from '@/components/civora-ui/CIVDatasetList.vue'
import CIVSearchInput from '@/components/civora-ui/CIVSearchInput.vue'

const props = withDefaults(defineProps<{
  public?: boolean
}>(), {
  public: false
})

const { t, te, locale } = useI18n()
const authStore = useAuthStore()
const router = useRouter()
const { canCreateInAnyCatalog } = usePermissions()
const isAuthenticated = computed(() => !!authStore.authenticated)
const useNewCivoraUi = computed(() => appConfig.customer.useNewCivoraUi === 'true')
const dpiRoute = computed(() => (appConfig.civoraDpiUrl ? '/civora-dpi' : '/dpi/datasets'))

const searchBaseUrl = appConfig.rawDataSearchUrl
  ? appConfig.rawDataSearchUrl
  : appConfig.piveauHubSearchUrl

const { useSearch } = useDatasetsSearch(searchBaseUrl)
const route = useRoute()

const showOnlyPublic = computed(() => props.public || !isAuthenticated.value)

function toStringOrFirst(value: LocationQueryValue | LocationQueryValue[]) {
  return Array.isArray(value) ? value[0] : value
}
const searchQueryArgs = {
  disableUserToken: !!route?.query?.['disable-user-token'],
  forceUserToken: toStringOrFirst(route?.query?.['force-user-token'])
}

const { queryParams, sort, sortDirection } = useSearchParams()
const selectedFacets = toRef(useSelectedFacets())
const isAppRoute = computed(() => route.path.startsWith('/app'));

// disable token in header until rbac is ready
const searchHeaders = computed(() => {
  const isEnabled = appConfig.customer?.enableDataSetLevelAccessControl === true || 
                    appConfig.customer?.enableDataSetLevelAccessControl === 'true';

  if (!isEnabled) {
    return {};
  }

  return {
    ...!searchQueryArgs.disableUserToken && !!authStore.authToken
      ? { 'Authorization': `Bearer ${searchQueryArgs.forceUserToken ?? authStore.authToken}` }
      : {},
  };
});

// dataset scope
const softDataModel = computed({
  get: () => selectedFacets.value.is_soft_data.includes('true'),
  set: (selected: boolean) => {
    selectedFacets.value.is_soft_data = selected ? ['true'] : []
  },
})
// Route updates can replace the facet array without changing the selection.
watch(softDataModel, () => {
  queryParams.page.value = 0
})

const hvdModel = ref(false)
const livedataModel = ref(false)
const isHvd = computed(() => hvdModel.value ? ['true'] : [])
const isLivedata = computed(() => livedataModel.value ? ['http://publications.europa.eu/resource/authority/frequency/UPDATE_CONT'] : [])
const publicationStatus = computed(() => ['published'])

// access level filter — separate ref so it doesn't conflict with useSelectedFacets
const selectedAccessLevels = ref<string[]>([])

const enableAccessControl = computed(() => {
  const flag = (appConfig as any).customer?.enableDataSetLevelAccessControl
  return flag === true || flag === 'true'
})

// Only watch when access control is enabled — when disabled, selectedAccessLevels
// never changes so the watch would be a no-op anyway, but this makes intent explicit.
watch(
  selectedAccessLevels,
  async () => {
    if (!enableAccessControl.value) return
    queryParams.page.value = 1
    await nextTick()
    queryParams.page.value = 0
  },
  { deep: true }
)

const {
  getSearchResults,
  getSearchResultsCount,
  getSearchResultsPagesCount,
  getAvailableFacetsLocalized,
  isFetching,
  isLoading,
  toGetters,
} = useSearch({
  queryParams,
  selectedFacets: {
    ...toRefs(selectedFacets.value),
    is_hvd: isHvd,
    periodicity: isLivedata,
    ...(enableAccessControl.value
      ? {
          publication_status: publicationStatus,
          access_level: selectedAccessLevels,
        }
      : {}),
  },
  headers: searchHeaders,
})

// SearchInputBar
const dropdownItems = ref([
  { label: 'New York', value: 'NY' },
  { label: 'Rome', value: 'RM' },
  { label: 'London', value: 'LDN' },
  { label: 'Istanbul', value: 'IST' },
  { label: 'Paris', value: 'PRS' },
])

const searchInput = ref('')

watch(
  () => queryParams.q.value,
  (val) => {
    searchInput.value = val
  },
  {
    immediate: true,
  }
)

function doSearch() {
  if (queryParams.q.value === searchInput.value) return
  queryParams.q.value = searchInput.value
  queryParams.page.value = 0
}

// SearchInfoPanel
const numOfSearchResults = computed(() => getSearchResultsCount.value)
const formattedDatasetResultCount = computed(() => {
  const numOfDatasetsSoFar = Math.min((queryParams.page.value+1) * queryParams.limit.value, numOfSearchResults.value)
  return `${numOfDatasetsSoFar}/${numOfSearchResults.value} ${t('kdw.views.DatasetSearchView.datasets')}`
})

// Search result cards
const datasets = computed(() => {
  const results = getSearchResults.value
  if (!results || !results.length) return []

  return results.map((dcat) => {
    const { getLocalizedProperties, getDistributions, getPublisher } = toGetters(dcat)
    return {
      id: dcat.id,
      is_hvd: dcat.is_hvd,
      title: getLocalizedProperties.value.title,
      publisher: getPublisher.value?.name || '',
      categories: getLocalizedProperties.value.categories.map((category) => category.label ?? ''),
      formats: getDistributions.value.getFormatsUnique.map((format) => format.label ?? ''),
      issued: getLocalizedProperties.value.issued,
      datasetType: enableAccessControl.value
                  ? dcat?.catalog_record?.access_level
                  : (dcat as any)?.public === false ? 'kritis' : 'opendata',
    }
  })
})

// facets
const availableFacetsLocalized = getAvailableFacetsLocalized(toRef(locale))
const availableFacetsFormatted = computed(() => {
  const formatted =
  availableFacetsLocalized.value
      ?.map((facet) => {
        return {
          id: facet.id,
          label: te(`datasetFacets.facets.${facet.id}`) ? t(`datasetFacets.facets.${facet.id}`) : facet.id,
          items: facet.items.map((item, idx) => {
            const label =
              typeof item.title === 'string'
                ? item.title
                : !item.title
                  ? item.id || `item${idx}` || ''
                  : getLocalizedValue({
                      obj: item.title,
                      fallbackLocale: 'de',
                    })

            return {
              id: item.id || `${idx}`,
              label: facet.id === 'license'
                ? getLicenseLabelShort({ label, href: item.id })
                : label,
              title: facet.id === 'license' ? label : undefined,
              count: item.count ?? 0,
              value: item.id ?? '__value__',
            }
          }),
        }
      })
      .filter((facet) => Object.keys(unref(selectedFacets)).includes(facet.id)) || []
  return formatted
})

// access level facet items for DataOwnerCards
const stableAccessLevelItems = ref<{ id: string; label: string; count: number }[]>([])

watch(
  () => availableFacetsLocalized.value?.find(f => f.id === 'access_level'),
  (facet) => {
    if (!facet) return

    const incoming = facet.items
      .filter(item => (item.count ?? 0) > 0 || stableAccessLevelItems.value.some(s => s.id === item.id))
      .map(item => ({
        id: item.id ?? '',
        label: typeof item.title === 'string'
          ? item.title.charAt(0).toUpperCase() + item.title.slice(1)
          : item.id ?? '',
        count: item.count ?? 0,
      }))

    // Merge: add any new ids, update counts, keep previously seen ids even if count is now 0
    const merged = [...stableAccessLevelItems.value]
    for (const inc of incoming) {
      const existing = merged.find(s => s.id === inc.id)
      if (existing) {
        existing.count = inc.count
      } else {
        merged.push(inc)
      }
    }
    stableAccessLevelItems.value = merged
  },
  { immediate: true }
)

const accessLevelFacetItems = stableAccessLevelItems

const visible = ref(false)
</script>

<template>
  <SearchPageLayout>
    <template #hamburger>
      <div class="flex items-center p-2 gap-2">
        <KButton
          severity="contrast"
          size="large"
          @click="visible = true"
        >
          <template #icon>
            <PhTextAlignLeft />
          </template>
        </KButton>
        <Typography
          as="h4"
          variant="header-4">
          Katalog durchsuchen
      </Typography>
      </div>
    </template>
    <template #sidebar>
      <FacetSidebar
        :public="showOnlyPublic"
        v-model="selectedFacets"
        v-model:soft-data="softDataModel"
        v-model:hvd="hvdModel"
        v-model:livedata="livedataModel"
        v-model:access-levels="selectedAccessLevels"
        :access-level-items="accessLevelFacetItems"
        :enable-access-control="enableAccessControl"
        :facets="availableFacetsFormatted" />
    </template>
    <template #top>
      <section
        name="top"
        class="flex flex-col gap-7 bg-bg-base">
        <CIVViewHeader
          :title="t('kdw.components.headline.KHeadline.datacatalog')"
          :description="t('kdw.components.headline.KHeadline.datacatalog-text')">
          <template v-if="isAuthenticated" #bottomLeft>
            <CIVButton
              v-if="useNewCivoraUi && isAuthenticated"
              size="medium"
              type="hero-secondary"
              icon-prefix="/src/assets/icons/ArrowRight.svg"
              to="/app/data-catalog/organisation-data"
              :label="t('kdw.components.headline.KHeadline.organizationData')"
            />
            <CIVButton
              v-if="useNewCivoraUi && isAuthenticated"
              size="medium"
              type="hero-primary"
              :disabled="!canCreateInAnyCatalog()"
              icon-prefix="/src/assets/icons/ArrowRight.svg"
              :to="dpiRoute"
              :label="t('kdw.components.headline.KHeadline.newData')"
            />
            <KButton v-if="!useNewCivoraUi && isAuthenticated" class="cos-k-button cos-k-button-large cos-k-button-secondary" severity="secondary"
              :label="t('kdw.components.headline.KHeadline.organizationData')"
              @click="router.push('data-catalog/organisation-data')">
              <template v-slot:icon>
                <div class="masked-icon-secondary"></div>
              </template>
            </KButton>
            <KButton v-if="!useNewCivoraUi && isAuthenticated" class="cos-k-button cos-k-button-large cos-k-button-primary" to="/datasets"
              :disabled="!canCreateInAnyCatalog()"
              :label="t('kdw.components.headline.KHeadline.newData')" @click="router.push(dpiRoute)">
              <template v-slot:icon>
                <div class="masked-icon-primary"></div>
              </template>
            </KButton>
          </template>
        </CIVViewHeader>

        <form @submit.prevent="doSearch">
          <CIVSearchInput v-model="searchInput" disable-dropdown class="w-full px-8 py-2"
            :placeholder="$t('kdw.views.DatasetSearchView.searchDataCatalog')" :onClear="doSearch" :on-icon-search="doSearch" :has-meta-data="false"
            :has-search-button="false" />
        </form>
      </section>
    </template>
    <section
      name="datasets"
      class="flex flex-col gap-6 bg-bg-base px-6 py-8">
      <SelectedFacetsOverview
        v-model="selectedFacets"
        :facets="availableFacetsFormatted" />
      <div class="flex flex-col gap-6">
        <KSearchInfoPanel
          v-model:direction="sortDirection"
          v-model:sort="sort">
          {{ formattedDatasetResultCount }}
        </KSearchInfoPanel>
      </div>
      <CIVDatasetList
        v-if="appConfig.customer.useNewCivoraUi === 'true'"
        :datasets="datasets"
        :isLoading="isLoading"
        :isFetching="isFetching"
        :isAppRoute="isAppRoute"
      />
      <div v-else class="flex flex-col gap-2">
        <template v-if="!isLoading">
          <KDataInfoBox
            v-for="dataset in datasets"
            :key="dataset.id"
            :to="{ name: isAppRoute ? 'datasets-detail' : 'public-datasets-detail', params: { datasetId: dataset.id } }"
            :super-title="dataset.publisher"
            :ghost="isFetching"
            :title="dataset.title"
            :formats="dataset.formats"
            :issued="dataset.issued || '—'"
            :categories="dataset.categories"
            :dataset-type="dataset.datasetType as DatasetType"
          >
          </KDataInfoBox>
        </template>
        <template v-else>
          <KDataInfoBox
            v-for="i in 8"
            :key="`placeholder--${i}`"
            title="na"
            :categories="['na']"
            ghost />
        </template>
      </div>
      <div class="grid w-full place-content-center">
        <Paginator
          v-model:first="queryParams.page.value"
          class="rounded"
          :rows="1"
          :total-records="getSearchResultsPagesCount" />
      </div>
    </section>
  </SearchPageLayout>
  <Sidebar v-model:visible="visible" header="Kataloge durchsuchen">
    <FacetSidebar
      :public="showOnlyPublic"
      v-model:model-value="selectedFacets"
      v-model:soft-data="softDataModel"
      v-model:hvd="hvdModel"
      v-model:livedata="livedataModel"
      v-model:access-levels="selectedAccessLevels"
      :access-level-items="accessLevelFacetItems"
      :enable-access-control="enableAccessControl"
      mobile
      :facets="availableFacetsFormatted" />
  </Sidebar>
</template>
