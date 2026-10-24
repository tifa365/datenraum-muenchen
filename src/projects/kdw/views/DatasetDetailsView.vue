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
import { useRouteParams } from '@vueuse/router'
import { type Ref, toValue, computed, ref } from 'vue'
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'
import { shallowReactive } from 'vue'
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dropdown from 'primevue/dropdown';
import Typography from '../components/base/typography/Typography.vue';
import { useDatasetsSearch } from '../sdk'
import DatasetDetailsContainer from '../components/dataset-details-container/DatasetDetailsContainer.vue'
import { useDatasetPreviewTable, isOUPUrl } from '../composables/useDatasetPreviewTable';
import type { DistributionViewModel } from '../components/dsitribution-data-info-box/shared';
import { useAuthStore } from '@/stores/authStore'
import { usePermissions } from '@/composables/useAccessPermissions'
import KCard from '../components/base/card/KCard.vue'
import appConfig from '@config/appConfig'
import CIVDatacatalogDistribution from '@/components/civora-ui/datacatalog/CIVDatacatalogDistribution.vue';
import CIVDataDetailHeader from '@/components/civora-ui/layout/header/CIVDataDetailHeader.vue';

const authStore = useAuthStore()
const { authenticated, accessControlEnabled, getDatasetPermissions } = usePermissions()

function ensureDatasetId(id: Ref): asserts id is Ref<string> {
  if (typeof toValue(id) !== 'string') throw new Error('id must be a string')
}

const datasetId = useRouteParams('datasetId', '', {
  router: useRouter(),
  route: useRoute(),
})

ensureDatasetId(datasetId)

const route = useRoute()
function toStringOrFirst(value: LocationQueryValue | LocationQueryValue[]) {
  return Array.isArray(value) ? value[0] : value
}
const searchQueryArgs = {
  disableUserToken: !!route?.query?.['disable-user-token'],
  forceUserToken: toStringOrFirst(route?.query?.['force-user-token'])
}
// disable token in header until rbac is ready
const searchHeaders = computed(() => {
  const isEnabled = appConfig.customer.enableDataSetLevelAccessControl === true || 
                    appConfig.customer.enableDataSetLevelAccessControl === 'true';

  if (!isEnabled) {
    return {};
  }

  return {
    ...!searchQueryArgs.disableUserToken && !!authStore.authToken
      ? { 'Authorization': `Bearer ${searchQueryArgs.forceUserToken ?? authStore.authToken}` }
      : {},
  };
});

const { useResource: getDataset } = useDatasetsSearch()

const { isLoading, isSuccess, query, getters, result } = shallowReactive(
  getDataset(datasetId, { headers: searchHeaders })
)
const { getTitle, getId, getDescription, getPropertyTable, getFormattedDistributions } = getters
const { isError: searchError, error } = query
// Parse AxiosError to get the error message
const errorView = computed(() => {
  if (searchError.value) {
    return error.value?.message || 'An error occurred'
  }
  return ''
})

// ### Dataset preview table

const availablePreviewOptions = computed(() => {
  if (!getFormattedDistributions.value || getFormattedDistributions.value.length === 0) return []
  // Per convention, we use the distributions's `accessUrl` property to determine if it's an OUP distribution
  const oupOnlyFn = (distribution: DistributionViewModel) => distribution.accessUrls?.some(isOUPUrl)
  return getFormattedDistributions.value
    .filter(oupOnlyFn)
    .map((dist) => ({
      title: dist.title || dist.id || 'Unknown',
      id: dist.id,
      accessUrl: dist.accessUrls?.find(isOUPUrl),
    }))
})

const selectedPreview = ref()
const selectedPreviewId = computed(() => selectedPreview.value?.id)
const selectedPreviewUrl = computed(() => selectedPreview.value?.accessUrl)
const { previewTableHeader, previewTableData, isLoadingPreviewTable, isError } =
  useDatasetPreviewTable(selectedPreviewId, selectedPreviewUrl)

const organisation = computed(() => {
  const res = {} as Record<string, any>
  getPropertyTable?.value?.forEach((item) => {
    res[item?.data[0].id] = item?.data[0].data
  })
  return {
    ...res,
    title: (isSuccess && getTitle.value) || '',
    description: (isSuccess && getDescription.value) || '',
    url: selectedPreviewUrl.value || '',
  }
})

/**
 * Access-right value from the raw dataset result.
 */
const accessRightVal = computed<string>(() => {
  const r = (result as any)?.value ?? result
  // access_right is an object: { label, resource }
  const ar = r?.access_right
  if (ar?.resource) return ar.resource  // e.g. "...CONFIDENTIAL"
  if (ar?.label) return ar.label        // e.g. "confidential"
  // fallback to organisation computed (already mapped by getPropertyTable)
  return organisation.value?.accessRightVal || ''
})

/**
 * True when the dataset is openly accessible to everyone (no login needed).
 */
const isPublicDataset = computed(() => {
  const val = accessRightVal.value.toLowerCase()
  return val === 'public' || val.endsWith('/public')
})

/**
 * IDs needed for RPT permission lookup.
 * Adjust the paths below to match your SDK's result shape.
 */
const datasetCatalogId = computed<string>(() => {
  const r = (result as any)?.value ?? result
  return r?.catalog?.id || ''
})

const datasetOrganizationId = computed<string>(() => {
  const r = (result as any)?.value ?? result
  return (
    r?.catalog?.organisation?.id ||
    r?.catalog?.is_part_of ||
    r?.organisation?.id ||
    ''
  )
})

const datasetPermissions = computed(() =>
  getDatasetPermissions(
    toValue(datasetId),
    datasetOrganizationId.value,
    datasetCatalogId.value,
  )
)
</script>

<template>
  <div v-if="error" class="grid place-content-center w-full h-full bg-slate-100">
    <KCard class="w-96 h-96">
      <template #title> Fehler </template>
      <template #content>{{ errorView }}</template>
    </KCard>
  </div>

  <template v-else-if="appConfig.customer.useNewCivoraUi === 'true'">
    <CIVDataDetailHeader
      :metadata="result"
      :datasetId="datasetId"
      :organisation="organisation"
      :distributions="getFormattedDistributions ?? []"
      :isLoading="isLoading" />

    <!--
      Distributions section:
      - Public dataset  → visible to everyone
      - Non-public      → authenticated users with dataset:view_published (or higher) scope only
    -->
    <CIVDatacatalogDistribution
      :distributions="getFormattedDistributions ?? []" />
  </template>

  <DatasetDetailsContainer v-else
    :dataset-type="(result as any)?.public === false ? 'kritis' : 'opendata'"
    :loading="isLoading"
    :title="(isSuccess && getTitle) || ''"
    :description="(isSuccess && getDescription) || ''"
    :property-table="getPropertyTable || []"
    :distributions="getFormattedDistributions || []"
    variant="default">
    <template #preview>
      <div class="flex flex-col gap-6" v-if="authStore.authenticated">
        <div class="flex flex-col gap-4">
          <Typography variant="header-3" :text="$t('datasetDetails.preview')" />
          <Typography variant="paragraph-2" :text="$t('datasetDetails.choose-dataset')" />
        </div>
        <Dropdown v-if="!isLoading" v-model="selectedPreview" :options="availablePreviewOptions"
          optionLabel="title" placeholder="Distribution" class="w-full md:w-[14rem]" />
        <div v-else class="grid place-content-center w-72 rounded-lg h-24 bg-slate-400 animate-pulse" />
        <DataTable v-if="!isLoadingPreviewTable && !isError" size="small" :value="previewTableData"
          tableStyle="min-width: 50rem">
          <Column v-for="(col, i) in previewTableHeader" :key="i" :field="col.field" :header="col.field" />
        </DataTable>
        <div v-if="!isLoadingPreviewTable && isError">
          <span>{{ $t('datasetDetails.previewFailedToLoad') }}</span>
        </div>
        <div v-if="isLoadingPreviewTable"
          class="grid place-content-center w-full rounded-lg h-96 bg-slate-400 animate-pulse" />
      </div>
      <div class="flex flex-col gap-6" v-else>
        <span>{{ $t('kdw.components.DatasetDetailsContainer.data-preview-please-login') }}</span>
      </div>
    </template>
  </DatasetDetailsContainer>
</template>
