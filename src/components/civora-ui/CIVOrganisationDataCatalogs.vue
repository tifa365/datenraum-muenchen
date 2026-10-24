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
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import appConfig from '@config/appConfig'
import { useRouter } from 'vue-router'
import Paginator from 'primevue/paginator'
import CIVDatalistCatalogHeader from './CIVDatalistCatalogHeader.vue'
import { getTranslationFor } from '@/projects/kdw/sdk/utils/helpers'
import CIVSearchInput from './CIVSearchInput.vue'
import CIVButton from './CIVButton.vue'
import CIVActionMenu from './CIVActionMenu.vue'
import CIVTag from './CIVTag.vue'
import CIVTooltip from './CIVTooltip.vue'
import { useCatalogMetricsUrls } from '@/composables/useCatalogMetricsUrls'
import { useCatalogSearch, type CatalogListItem } from '@/composables/useCatalogSearch'
import { usePermissions } from '@/composables/useAccessPermissions'

const router = useRouter()
const { t } = useI18n()
const openDropdownIndex = ref<number | null>(null)
const searchTerm = ref('')
const { metricsEnabled, metricsUrl } = useCatalogMetricsUrls()

const { accessControlEnabled, canManageCatalog } = usePermissions()
const { catalogs, total, page, pageSize, isLoading, setSearchQuery, setPageFromFirstRow } = useCatalogSearch({
  filter: accessControlEnabled ? canManageCatalog : undefined,
})

async function editItem(item: CatalogListItem) {
  if (!item.canEdit) return

  try {
    if (appConfig.civoraDpiUrl) {
      await router.push({
        name: 'CivoraDPI',
        query: {
          type: 'catalogue',
          id: item.id,
        },
      })
    } else {
      await router.push({
        name: 'DataProviderInterface-Edit',
        params: {
          catalog: item.id,
          property: 'catalogues',
          id: item.id,
        },
      })
    }

  } catch (error) {
    console.error(error)
  }
}

function submitSearch() {
  setSearchQuery(searchTerm.value)
}

function clearSearch() {
  searchTerm.value = ''
  setSearchQuery('')
}

function onPageChange(event: { first: number }) {
  setPageFromFirstRow(event.first)
}

function setDropdownOpen(index: number, isOpen: boolean) {
  openDropdownIndex.value = isOpen ? index : openDropdownIndex.value === index ? null : openDropdownIndex.value
}
</script>

<template>
  <div class="row title-sm table-container-header">
    <form class="catalogue-search-form" @submit.prevent="submitSearch">
      <div class="search">
        <CIVSearchInput
          id="search"
          v-model="searchTerm"
          :hasSearchButton="false"
          :placeholder="$t('components.organization-data.OrganizationDataHeader.searchCatalogs')"
          :onClear="clearSearch" />
      </div>
      <CIVButton
        size="large"
        :label="$t('landing-page.hero.search')"
        @click="submitSearch" />
    </form>
    <CIVButton
      v-if="metricsUrl"
      size="large"
      type="secondary"
      iconSuffix="/src/assets/icons/performance.svg"
      :label="$t('components.organization-data.OrganizationDataHeader.performanceDashboard')"
      :href="metricsUrl" />
  </div>

  <div
    v-if="isLoading"
    class="catalogue-loading"
    role="status">
    <span class="quality-loader" aria-hidden="true" />
    {{ $t('organisation.catalogs.loading') }}
  </div>
  <div
    class="row title-sm table-container no-data"
    v-else-if="catalogs.length === 0">
    {{ $t('organisation.datasets.noData') }}
  </div>

  <div
    v-else
    class="table-container">
    <CIVDatalistCatalogHeader />
    <template
      v-for="(item, i) in catalogs"
      :key="item.id">
      <div class="row row-data body-lg">
        <div class="col title">
          <CIVTag
            v-if="item.isOpenDataPresence === true"
            :text="$t('organisation.catalogs.organizationPresence')"
            tone="promote"
            size="small"
            :hasCloseIcon="false"
            :hasDotIcon="false"
            svgIcon="src/assets/icons/Building.svg" />
          {{ getTranslationFor(item.name, $i18n.locale) }}
        </div>
        <div class="body-lg col publisher">
          <span class="mobile-column-label label-md">{{ $t('organisation.catalogs.publisher') }}</span>
          {{ item.publisher }}
        </div>
        <div class="body-lg col description">
          <span class="mobile-column-label label-md">{{ $t('organisation.catalogs.description') }}</span>
          <span class="description-text">{{ getTranslationFor(item.description, $i18n.locale) }}</span>
        </div>
        <div class="col quality">
          <span class="mobile-column-label label-md">{{ $t('organisation.catalogs.quality') }}</span>
          <CIVTooltip
            v-if="!metricsEnabled || (item.quality === null && !item.qualityLoading)"
            :text="$t(`organisation.catalogs.${metricsEnabled ? 'noRatingTooltip' : 'mqaNotActivatedTooltip'}`)"
            position="top"
            portal>
            <template #default="{ tooltipId, visible }">
              <CIVTag
                tabindex="0"
                class="civ-metrics-tooltip"
                :aria-describedby="visible ? tooltipId : undefined"
                :text="$t(`organisation.catalogs.${metricsEnabled ? 'noRating' : 'mqaNotActivated'}`)"
                tone="neutral"
                size="big"
                :hasCloseIcon="false"
                :hasDotIcon="false" />
            </template>
          </CIVTooltip>
          <CIVTag
            v-else-if="item.quality !== null"
            :text="$t(`organisation.catalogs.${item.quality}`)"
            :tone="item.quality === 'good' ? 'positive' : item.quality === 'sufficient' ? 'warning' : 'critical'"
            size="big"
            :hasCloseIcon="false"
            :hasDotIcon="false" />
          <span
            v-else-if="item.qualityLoading"
            class="quality-loader"
            role="status"
            :aria-label="$t('organisation.catalogs.loadingQuality')" />
        </div>
        <div class="col actions">
          <CIVActionMenu
            v-if="item.canEdit"
            :open="openDropdownIndex === i"
            :label="t('organisation.datasets.actions')"
            :items="[{ id: 'edit', label: t('organisation.datasets.edit') }]"
            placement="top"
            @update:open="setDropdownOpen(i, $event)"
            @select="editItem(item)" />
        </div>
      </div>
    </template>
  </div>
  <Paginator
    v-if="!isLoading"
    :first="page * pageSize"
    :rows="pageSize"
    :total-records="total"
    @page="onPageChange"
    class="rounded" />
</template>

<style scoped>
.table-container {
  --catalog-list-columns:
    minmax(0, 1.4fr)
    minmax(0, 1fr)
    minmax(0, 1.5fr)
    minmax(0, 0.8fr)
    54px;
}

.table-container-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin: 32px 40px 16px 40px;
  gap: 30px;
}

.catalogue-search-form {
  display: flex;
  align-items: center;
  gap: 20px;
  width: min(100%, 882px);
}

.search {
  width: 100%;
}

.row-data {
  display: grid;
  grid-template-columns: var(--catalog-list-columns);
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 16px 16px;
  min-height: 104px;
  margin: 20px 40px;
  column-gap: 24px;
  box-sizing: border-box;
  position: relative;
  text-decoration: none;
  color: inherit;
  transition: background-color 0.3s ease;
  color: var(--color-text-light);
}

.row-data:hover {
  background-color: #f0f0f0;
}

.row-data .col {
  display: flex;
  min-width: 0;
  overflow: visible;
}

.title,
.publisher {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.actions {
  justify-content: center;
  width: 54px;
}

.civ-metrics-tooltip {
  min-width: 150px;
  width: 150px;
  justify-content: center;
}

.description-text {
  display: -webkit-box !important;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden !important;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-word;
}

.quality {
  align-items: center;
  justify-content: center;
}

.mobile-column-label {
  display: none;
}

.quality-loader {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-neutral-300);
  border-top-color: var(--color-primary-500);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.catalogue-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.no-data {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .table-container {
    padding: 0 10px;
  }

  .catalogue-search-form {
    width: 100%;
  }

  .list-header,
  .row-data {
    margin: 10px 0;
    width: auto;
  }

  .row-data {
    grid-template-columns: minmax(0, 1fr) 44px;
    grid-template-areas:
      'title actions'
      'publisher actions'
      'description actions'
      'quality actions';
    min-width: 0;
    padding: 16px;
    column-gap: 16px;
    row-gap: 12px;
    align-items: start;
  }

  .title { grid-area: title; }
  .publisher { grid-area: publisher; }
  .description {
    grid-area: description;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .description-text {
    display: block !important;
    overflow: visible !important;
  }
  .quality {
    grid-area: quality;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .actions {
    grid-area: actions;
    justify-content: flex-end;
    align-self: start;
    width: 44px;
  }
  .mobile-column-label {
    display: block;
    color: var(--color-icons);
  }
}
</style>
