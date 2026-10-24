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
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePiveauDataPreview } from '@/composables/usePiveauDataPreview'
import { useDownload } from '@/composables/useDownload'
import { type DistributionViewModel } from '@/projects/kdw/components/dsitribution-data-info-box/shared'
import CIVDynamicOverlay from '@/components/civora-ui/CIVDynamicOverlay.vue'
import CIVIcon from '../CIVIcon.vue'
import CIVTag from '../CIVTag.vue'
import CIVButton from '../CIVButton.vue'
import CIVViewTabs from '../CIVViewTabs.vue'
import CIVDataPreviewTableView from './CIVDataPreviewTableView.vue'
import CIVDataPreviewNumericalChartsView from './CIVDataPreviewNumericalChartsView.vue'
import CIVDataPreviewCategoricalChartsView from './CIVDataPreviewCategoricalChartsView.vue'
import CIVDropdownSelect from '../CIVDropdownSelect.vue'

const { t, te } = useI18n()

const props = defineProps<{
  distributions?: DistributionViewModel[] | null
}>()

const selectedDistribution = defineModel<DistributionViewModel | null>('selectedDistribution')
const isOpen = defineModel<boolean>('isOpen', { required: true })

const currentTab = ref<'table' | 'numerical' | 'categorical'>('table')

// download link is appended here so its click stays inside the overlay's focus trap
const modalContainerRef = useTemplateRef('modalContainerRef')

const tabs = computed(() =>[
  { id: 'table', label: t('datasetDetails.previewViews.table') },
  { id: 'numerical', label: t('datasetDetails.previewViews.numerical') },
  { id: 'categorical', label: t('datasetDetails.previewViews.categorical') },
])

const selectedDistributionUrl = computed(() =>
  selectedDistribution.value?.downloadUrls?.[0] || selectedDistribution.value?.accessUrls?.[0] || ''
)

const {
  labels,
  defaultViewOptions,
  data,
  categorized,
  isLoading,
  isError,
  error,
} = usePiveauDataPreview(
  selectedDistribution,
)

const {
  handleDownload,
  isDownloading,
  progress: downloadProgress,
  cancel: cancelDownload,
  error: downloadError,
} = useDownload(modalContainerRef)

watch(
  () => downloadError.value,
  (error) => {
    if (error) {
      alert(t('datasetDetails.previewViews.downloadError', { error }))
    }
  }
)

const errorMessage = computed(() => {
  if (!error.value) {
    return ''
  }

  const errorKey = error.value.code
    ? 'datasetDetails.previewViews.errors.' + error.value.code.replace(/\./g, '-')
    : 'datasetDetails.previewFailedToLoad'

  if (te(errorKey)) {
    return t(errorKey)
  }

  return t('datasetDetails.previewFailedToLoad')
})

const onClose = () => {
  isOpen.value = false
}

const selectDistribution = (distribution: DistributionViewModel) => {
  selectedDistribution.value = distribution
  currentTab.value = 'table' // Reset to table tab on distribution change
}

const selectedDistributionId = computed({
  get() {
    return selectedDistribution.value?.id
      ? [selectedDistribution.value.id]
      : []
  },
  set(ids: string[]) {
    const distribution = props.distributions?.find(dist => dist.id === ids[0])
    if (distribution) {
      selectDistribution(distribution)
    }
  }
})

const isEmpty = computed(() => {
  return !isLoading.value && !isError.value && data.value.length === 0
})

const getDistributionDisplayName = (distribution?: DistributionViewModel) => {
  return distribution?.title
    || distribution?.id
    || distribution?.downloadUrls?.[0]
    || distribution?.accessUrls?.[0]
    || t('datasetDetails.previewViews.unnamedDistribution')
}

watch(
  () => defaultViewOptions.value?.default_view,
  (newView: 'table' | 'numerical' | 'categorical' | undefined) => {
    if (newView) {
      currentTab.value = newView
    }
  },
  { immediate: true }
)
</script>

<template>
  <CIVDynamicOverlay v-model:is-open="isOpen" width="full">
    <div ref="modalContainerRef" class="preview-modal-container">
      <!-- Header -->
      <div class="preview-modal-header">
        <p class="preview-modal-header-title title-md">
          {{ t('datasetDetails.preview') }}
        </p>
        <CIVButton
          type="tertiary"
          size="small"
          :label="t('datasetDetails.previewViews.close')"
          iconSuffix="/src/assets/icons/Close.svg"
          @click="onClose" />
      </div>

      <!-- Distribution selector -->
      <div>
        <CIVDropdownSelect
          class="distribution-dropdown"
          v-model:selected-items="selectedDistributionId"
          :items="props.distributions?.map(dist => dist.id) || []"
          :label="t('datasetDetails.choose-dataset')"
          :placeholder="t('datasetDetails.previewViews.placeholder')"
          :transform="(id) => {
            const dist = props.distributions?.find(dist => dist.id === id)
            return getDistributionDisplayName(dist)
          }"
          :closeOnSelect="true"
        />
      </div>

      <!-- Preview content -->
      <div v-if="!isLoading && selectedDistribution" class="distribution-wrapper">
        <!-- Header with title and download -->
        <div class="distribution-header">
          <div class="distribution-title-content">
            <CIVIcon iconUrl="/src/assets/icons/FileIcon.svg" />
            <p class="distribution-title title-md">
              {{ getDistributionDisplayName(selectedDistribution) }}
            </p>
            <CIVTag
              class="preview-format body-lg"
              :has-close-icon="false"
              :has-dot-icon="false"
              :text="selectedDistribution?.format"
              tone="ghost"
            />
          </div>
          <CIVButton
            v-if="selectedDistributionUrl"
            type="tertiary"
            size="large"
            class="download-button"
            :aria-busy="isDownloading"
            :icon-prefix="isDownloading ? 'src/assets/icons/spinner.svg' : ''"
            :label="isDownloading
              ? t('datasetDetails.previewViews.cancel') + (downloadProgress > -1 ? ` (${downloadProgress}%)` : '')
              : t('datasetDetails.previewViews.download')"
            @click="isDownloading ? cancelDownload() : handleDownload(selectedDistributionUrl)" />
        </div>

        <!-- Tab navigation -->
        <CIVViewTabs
          class="preview-modal-tabs"
          v-model="currentTab"
          :tabs="tabs"
        />

        <!-- Error state -->
        <div v-show="!isEmpty && !isLoading && isError" class="error-banner">
          <p class="error-message">
            {{ errorMessage }}
          </p>
        </div>

        <!-- Empty state -->
        <div v-show="isEmpty && !isError && !isLoading" class="empty-state">
          <p class="text-muted">{{ t('datasetDetails.previewViews.noData') }}</p>
        </div>

        <!-- Table tab -->
        <div v-show="!isEmpty && !isError && !isLoading && currentTab === 'table'" class="tab-content">
          <CIVDataPreviewTableView
            :key="selectedDistribution.id"
            :labels="labels"
            :data="data"
          />
        </div>

        <!-- Numerical tab -->
        <div v-show="!isEmpty && !isError && !isLoading && currentTab === 'numerical'" class="tab-content">
          <CIVDataPreviewNumericalChartsView
            :key="selectedDistribution.id"
            :title="getDistributionDisplayName(selectedDistribution)"
            :labels="labels"
            :data="data"
            :defaultViewOptions="defaultViewOptions"
          />
        </div>

        <!-- Categorical tab -->
        <div v-show="!isEmpty && !isError && !isLoading && currentTab === 'categorical'" class="tab-content">
          <CIVDataPreviewCategoricalChartsView
            :key="selectedDistribution.id"
            :title="getDistributionDisplayName(selectedDistribution)"
            :labels="labels"
            :data="data"
            :categorized="categorized"
            :defaultViewOptions="defaultViewOptions"
          />
        </div>
      </div>

      <!-- Loading state -->
      <div v-show="!isEmpty && !isError && isLoading" class="loading-state">
        <div class="spinner" />
        <p>{{ t('datasetDetails.previewViews.loading') }}</p>
      </div>
    </div>
  </CIVDynamicOverlay>
</template>

<style scoped>
.preview-modal-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.preview-modal-header-title {
  color: var(--color-neutral-700, #374151);
  margin: 0;
}

.caption {
  color: var(--color-neutral-600, #4b5563);
  margin: 0 0 12px 0;
}

.distribution-dropdown {
  max-width: 544px;
}

.dropdown-content {
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  margin: 0;
}

.dropdown-content:hover {
  background-color: var(--color-neutral-200, #e5e7eb);
}

.distribution-wrapper {
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
}

.distribution-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  height: 68px;
  background-color: var(--color-bg-darker, #f9fafb);
  padding: 0 20px;
  gap: 24px;
}

.distribution-title-content {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.distribution-title {
  color: var(--color-neutral-700, #374151);
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-format {
  color: var(--color-neutral-700, #374151);
  padding: 0 4px;
  flex-shrink: 0;
}

.download-button[aria-busy="true"] {
  opacity: 0.6;
}

.download-button[aria-busy="true"] :deep(.prefix-icon) {
  animation: spin 0.8s linear infinite;
}

.tab-content {
  padding: 24px;
  min-height: 400px;
}

.chart-controls {
  margin-bottom: 16px;
}

.label {
  font-weight: 500;
  color: var(--color-neutral-700, #374151);
  margin: 0;
}

.error-banner {
  padding: 16px 24px;
  background-color: var(--color-danger-400);
  border-left: 4px solid var(--color-danger-700);
}

.error-message {
  color: var(--color-danger-700);
  margin: 0;
}

.empty-state,
.no-data-message {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.text-muted {
  color: var(--color-neutral-500, #6b7280);
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border, #e5e7eb);
  border-top-color: var(--color-primary-500, #0066cc);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
