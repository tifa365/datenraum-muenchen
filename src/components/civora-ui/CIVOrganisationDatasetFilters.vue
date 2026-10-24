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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CIVButton from './CIVButton.vue'
import CIVDropdownSelect from './CIVDropdownSelect.vue'
import CIVToggle from './CIVToggle.vue'
import {
  DATASET_ACCESS_FILTERS,
  DATASET_PUBLICATION_FILTERS,
  type DatasetAccessFilter,
  type AdditionalFilter,
  type DatasetPublicationFilter,
} from '@/composables/useOrganisationDatasetFilters'
import { type FacetItem } from '@/composables/useOrganisationDatasetSearch'

const { t } = useI18n()

const props = defineProps<{
  filteredCount: number
  sortDirection: 'asc' | 'desc'
  availableFacets: FacetItem[]
  totalCount: number
}>()

const targetOpenDataFacetAvailable = computed(
  () =>
    props.availableFacets.some(
      (facet) => facet.id === 'target_open_data'
    )
)

const emit = defineEmits<{
  clear: []
  toggleSort: []
}>()

const accessFilters = defineModel<DatasetAccessFilter[]>('accessFilters', { required: true })
const publicationFilters = defineModel<DatasetPublicationFilter[]>('publicationFilters', { required: true, })
const additionalFilters = defineModel<AdditionalFilter[]>('additionalFilters', { required: true, })
const openDataFilter = computed({
  get: () => additionalFilters.value.some((filter) => filter.id === 'target_open_data'),
  set: (value) => {
    additionalFilters.value = value
      ? [...additionalFilters.value, { id: 'target_open_data', value: 'true' }]
      : additionalFilters.value.filter((filter) => filter.id !== 'target_open_data')
  },
})
const hasActiveFilters = computed(
  () => accessFilters.value.length > 0 || publicationFilters.value.length > 0 || additionalFilters.value.length > 0
)
const sortLabel = computed(() =>
  props.sortDirection === 'asc'
    ? t('organisation.datasets.oldestFirst')
    : t('organisation.datasets.newestFirst')
)

function getAccessFilterLabel(value: string) {
  return t(`organisation.datasets.filterOptions.dlac.${value}`)
}

function getPublicationFilterLabel(value: string) {
  return t(`organisation.datasets.filterOptions.status.${value}`)
}

function handleClear() {
  openDataFilter.value = false
  emit('clear')
}
</script>

<template>
  <div class="dataset-filters">
    <div class="dataset-filters__selects">
      <CIVDropdownSelect
        v-model:selected-items="accessFilters"
        :items="[...DATASET_ACCESS_FILTERS]"
        :label="$t('organisation.datasets.dlacStatus')"
        :placeholder="$t('organisation.datasets.dlacPlaceholder')"
        :transform="getAccessFilterLabel"
        :is-multi-select="true"
        size="large"
      />
      <CIVDropdownSelect
        v-model:selected-items="publicationFilters"
        :items="[...DATASET_PUBLICATION_FILTERS]"
        :label="$t('organisation.datasets.status')"
        :placeholder="$t('organisation.datasets.statusPlaceholder')"
        :transform="getPublicationFilterLabel"
        :is-multi-select="true"
        size="large"
      />
    </div>

    <div v-if="targetOpenDataFacetAvailable" class="dataset-filters__additional-filters">
      <CIVToggle
        :label="t('organisation.datasets.openDataLabel')"
        v-model="openDataFilter"
      />
    </div>

    <div class="dataset-filters__summary">
      <span class="body-md">
        {{ filteredCount }}/{{ totalCount }}
        {{ $t('organisation.datasets.resultsCountLabel') }}
      </span>
      <CIVButton
        v-if="hasActiveFilters"
        type="tertiary"
        size="small"
        :label="$t('organisation.datasets.clearFilters')"
        @click="handleClear"
      />
      <CIVButton
        type="tertiary"
        size="small"
        :label="`${$t('organisation.datasets.sortBy')}: ${sortLabel}`"
        iconSuffix="/src/assets/icons/Sort.svg"
        @click="emit('toggleSort')"
      />
    </div>
  </div>
</template>

<style scoped>
.dataset-filters {
  display: flex;
  flex: 1 1 420px;
  flex-direction: column;
  gap: 12px;
}

.dataset-filters__selects,
.dataset-filters__summary,
.dataset-filters__additional-filters {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 16px;
}

.dataset-filters__selects :deep(.dropdown-box) {
  min-width: 180px;
}

.dataset-filters__summary,
.dataset-filters__additional-filters {
  align-items: center;
  color: var(--color-text-light);
}

@media (max-width: 768px) {
  .dataset-filters__selects,
  .dataset-filters__summary,
  .dataset-filters__additional-filters {
    align-items: stretch;
    flex-direction: column;
  }

  .dataset-filters__selects :deep(.dropdown-box) {
    width: 100%;
  }
}
</style>
