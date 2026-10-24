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
import { onActivated } from 'vue'
import Paginator from 'primevue/paginator'
import CIVDatalistHeader from './CIVDatalistHeader.vue'
import CIVLoading from './CIVLoading.vue'
import CIVOrganisationDatasetDeleteDialog from './CIVOrganisationDatasetDeleteDialog.vue'
import CIVOrganisationDatasetFilters from './CIVOrganisationDatasetFilters.vue'
import CIVOrganisationDatasetRow from './CIVOrganisationDatasetRow.vue'
import CIVSearchInput from './CIVSearchInput.vue'
import { useOrganisationDatasetActions } from '@/composables/useOrganisationDatasetActions'
import { useOrganisationDatasetItems } from '@/composables/useOrganisationDatasetItems'
import { useOrganisationDatasetSearch } from '@/composables/useOrganisationDatasetSearch'

const {
  clearFilters,
  currentPage,
  datasetsQuery,
  isAccessControlEnabled,
  isLoading,
  pageSize: limit,
  refresh,
  searchInput,
  selectedAccessFilters,
  selectedAdditionalFilters,
  selectedPublicationFilters,
  sortDirection,
  toggleSortDirection,
  totalItemsCount,
  totalRecords,
  availableFacets,
} = useOrganisationDatasetSearch()

const items = useOrganisationDatasetItems(
  () => datasetsQuery.data.value,
  isAccessControlEnabled
)

const {
  cancelDelete,
  confirmDelete,
  deleteError,
  deleteTarget,
  editDataset,
  isDeleting,
  publishDataset,
  requestDelete,
  revertDatasetToDraft,
} = useOrganisationDatasetActions(refresh)

onActivated(refresh)
</script>

<template>
  <div class="table-container-header">
    <div class="search">
      <CIVSearchInput
        v-model="searchInput"
        :has-search-button="false"
        :label="$t('organisation.datasets.search')"
        :placeholder="$t('organisation.datasets.search')"
      />
    </div>
    <CIVOrganisationDatasetFilters
      v-model:access-filters="selectedAccessFilters"
      v-model:publication-filters="selectedPublicationFilters"
      v-model:additional-filters="selectedAdditionalFilters"
      :filtered-count="totalRecords"
      :sort-direction="sortDirection"
      :available-facets="availableFacets"
      :total-count="totalItemsCount"
      @clear="clearFilters"
      @toggle-sort="toggleSortDirection"
    />
  </div>

  <div v-if="isLoading" class="table-loading">
    <CIVLoading />
  </div>

  <div v-else-if="items.length === 0" class="title-sm no-data">
    {{
      totalItemsCount > 0
        ? $t('organisation.datasets.noFilteredResults')
        : $t('organisation.datasets.noData')
    }}
  </div>

  <div v-else class="table-container" role="table">
    <CIVDatalistHeader />
    <CIVOrganisationDatasetRow
      v-for="item in items"
      :key="item.id"
      :access-control-enabled="isAccessControlEnabled"
      :item="item"
      @delete="requestDelete"
      @edit="editDataset"
      @publish="publishDataset"
      @revert-to-draft="revertDatasetToDraft"
    />
  </div>

  <div v-if="!isLoading && totalRecords > 0" class="paginator-container">
    <Paginator
      :first="(currentPage - 1) * limit"
      :rows="limit"
      :total-records="totalRecords"
      class="rounded"
      @page="(event: any) => (currentPage = Math.floor(event.first / limit) + 1)"
    />
  </div>

  <CIVOrganisationDatasetDeleteDialog
    :error="deleteError"
    :is-deleting="isDeleting"
    :target="deleteTarget"
    @cancel="cancelDelete"
    @confirm="confirmDelete"
  />
</template>

<style scoped>
.table-container {
  --dataset-list-min-width: 780px;
  --dataset-list-columns:
    32px
    minmax(180px, 1.4fr)
    minmax(130px, 0.9fr)
    minmax(110px, 0.8fr)
    minmax(120px, 1fr)
    54px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table-container-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin: 32px 40px 16px;
  gap: 30px;
  flex-wrap: wrap;
}

.search {
  flex: 1 1 360px;
  max-width: 716px;
  width: 100%;
}

.table-loading,
.no-data,
.paginator-container {
  display: grid;
  place-content: center;
}

.no-data {
  margin: 24px 40px;
}

@media (max-width: 768px) {
  .table-container {
    padding: 0 10px;
    overflow-x: visible;
  }

  .table-container :deep(.civ-datalist-header) {
    display: none;
  }
}
</style>
