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

<template>
  <CIVOverlay v-model:is-open="open">
    <div
      class="dataset-picker"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dataset-picker-title"
    >
      <span id="dataset-picker-title" class="dataset-picker-title title-md">
        {{ t('views.app.analytics.execution.datasetPicker.title') }}
      </span>
      <p class="dataset-picker-hint body-md">
        {{ t('views.app.analytics.execution.datasetPicker.jsonOnlyNote') }}
      </p>

      <CIVSearchInput
        v-model="searchQuery"
        :label="t('views.app.analytics.execution.datasetPicker.searchLabel')"
        :placeholder="t('views.app.analytics.execution.datasetPicker.searchPlaceholder')"
        :hasSearchButton="false"
        size="small"
      />

      <CIVDropdownSelect
        v-model:selectedItems="selectedDatasetItems"
        :items="datasetItems"
        :label="t('views.app.analytics.execution.datasetPicker.datasetLabel')"
        :placeholder="t('views.app.analytics.execution.datasetPicker.datasetPlaceholder')"
        :transform="datasetTitle"
        :disabled="isSearchLoading"
        :closeOnSelect="true"
        :isMultiSelect="false"
      />
      <p v-if="!isSearchLoading && datasetItems.length === 0" class="dataset-picker-hint body-md">
        {{ t('views.app.analytics.execution.datasetPicker.noData') }}
      </p>

      <CIVDropdownSelect
        v-model:selectedItems="selectedDistributionItems"
        :items="distributionItems"
        :label="t('views.app.analytics.execution.datasetPicker.distributionLabel')"
        :placeholder="t('views.app.analytics.execution.datasetPicker.distributionPlaceholder')"
        :transform="distributionTitle"
        :disabled="!selectedDatasetId"
        :closeOnSelect="true"
        :isMultiSelect="false"
      />

      <div v-if="isFetching" class="dataset-picker-banner dataset-picker-loading">
        <CIVLoading class="dataset-picker-loading-icon" />
        <span class="body-lg">{{ t('views.app.analytics.execution.datasetPicker.loading') }}</span>
      </div>
      <p v-if="isError" class="dataset-picker-error body-md">
        {{ t('views.app.analytics.execution.datasetPicker.errorPrefix') }} {{ error?.message }}
      </p>

      <div class="dataset-picker-footer">
        <CIVButton
          type="secondary"
          :label="t('views.app.analytics.execution.datasetPicker.cancel')"
          @click="open = false"
        />
        <CIVButton
          type="primary"
          :label="t('views.app.analytics.execution.datasetPicker.load')"
          :disabled="!selectedDistributionId || isFetching"
          @click="load"
        />
      </div>
    </div>
  </CIVOverlay>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import appConfig from '@config/appConfig'
import { useAuthStore } from '@/stores/authStore'
import { useDatasetsSearch } from '@/composables/useDatasetsSearch'
import { useScenarioLoader } from '@/composables/useModelCoordinator'
import CIVOverlay from '@/components/civora-ui/CIVOverlay.vue'
import CIVSearchInput from '@/components/civora-ui/CIVSearchInput.vue'
import CIVDropdownSelect from '@/components/civora-ui/CIVDropdownSelect.vue'
import CIVButton from '@/components/civora-ui/CIVButton.vue'
import CIVLoading from '@/components/civora-ui/CIVLoading.vue'

const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ loaded: [inputs: Record<string, unknown>] }>()

const { t } = useI18n()
const authStore = useAuthStore()

const searchQuery = ref('')
const selectedDatasetItems = ref<string[]>([])
const selectedDistributionItems = ref<string[]>([])
// Clicking the selected item deselects it and yields [], hence the `?? ''`.
const selectedDatasetId = computed(() => selectedDatasetItems.value[0] ?? '')
const selectedDistributionId = computed(() => selectedDistributionItems.value[0] ?? '')

// --- dataset search -------------------------------------------------------
const searchBaseUrl = appConfig.rawDataSearchUrl || appConfig.piveauHubSearchUrl
const { useSearch } = useDatasetsSearch(searchBaseUrl)

const searchHeaders = computed<Record<string, string>>(() => {
  const flag = appConfig.customer?.enableDataSetLevelAccessControl
  const enabled = flag === true || flag === 'true'
  return enabled && authStore.authToken ? { Authorization: `Bearer ${authStore.authToken}` } : {}
})

// Only the first 100 JSON datasets are listed; upgrade path is pagination / server-side q.
const { getSearchResults, isLoading: isSearchLoading, toGetters } = useSearch({
  queryParams: { q: '', limit: 100, page: 0 },
  selectedFacets: { format: ['JSON'] },
  headers: searchHeaders,
})

interface PickerDataset {
  id: string
  title: string
  distributions: Array<{ id: string; title: string; format?: string | null }>
}

// Format ids are plain strings ('JSON', 'CSV'); tolerate a vocabulary URI by taking its last segment.
const formatSuffix = (format?: string | null) => {
  const f = (format ?? '').split('/').pop()?.trim().toUpperCase()
  return f ? ` (${f})` : ''
}

const datasets = computed<PickerDataset[]>(() =>
  (getSearchResults.value ?? []).map((dcat) => {
    const { getId, getTitle, getFormattedDistributions } = toGetters(dcat)
    const id = getId.value ?? dcat.id
    return {
      id,
      title: getTitle.value || id,
      distributions: (getFormattedDistributions.value ?? []).map((d) => ({
        id: d.id,
        title: d.title || d.id,
        format: d.format,
      })),
    }
  })
)

const datasetsById = computed(() => new Map(datasets.value.map((d) => [d.id, d])))

const datasetItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return datasets.value
    .filter((d) => !q || `${d.id} ${d.title}`.toLowerCase().includes(q))
    .map((d) => d.id)
})

const distributionItems = computed(() =>
  (datasetsById.value.get(selectedDatasetId.value)?.distributions ?? []).map((d) => d.id)
)

const datasetTitle = (id: string) => datasetsById.value.get(id)?.title ?? id
const distributionTitle = (id: string) => {
  const d = datasetsById.value.get(selectedDatasetId.value)?.distributions.find((x) => x.id === id)
  return d ? `${d.title}${formatSuffix(d.format)}` : id
}

watch(selectedDatasetId, () => { selectedDistributionItems.value = [] })

watch(open, (isOpen) => {
  if (isOpen) return
  searchQuery.value = ''
  selectedDatasetItems.value = []
  selectedDistributionItems.value = []
})

// --- scenario load --------------------------------------------------------
const { isFetching, isError, error, refetch } = useScenarioLoader(selectedDistributionId)

async function load() {
  if (!selectedDistributionId.value) return
  const { data } = await refetch()
  if (data) {
    emit('loaded', data)
    open.value = false
  }
}
</script>

<style scoped>
.dataset-picker {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: min(480px, calc(100vw - 2rem));
  overflow: visible; /* let CIVDropdownSelect menus extend beyond the card */
  padding: 24px;
  border: 1px solid var(--color-divider);
  border-radius: 8px;
  background: var(--color-bg-white);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.dataset-picker-title {
  color: var(--color-text-regular);
}

.dataset-picker-hint {
  margin: 0;
  color: var(--color-text-muted);
}

.dataset-picker-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 8px;
}

.dataset-picker-loading {
  border: 1px solid var(--color-info-700);
  background: var(--color-info-400);
  color: var(--color-text-regular);
}

.dataset-picker-loading-icon {
  height: 24px;
  width: 24px;
  margin: 0;
}

.dataset-picker-error {
  margin: 0;
  color: var(--color-danger-700);
}

.dataset-picker-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
