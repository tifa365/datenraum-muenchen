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
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { AG_GRID_LOCALE_EN, AG_GRID_LOCALE_DE, AG_GRID_LOCALE_CZ } from '@ag-grid-community/locale'
import { themeQuartz } from 'ag-grid-community'
import { AgGridVue } from 'ag-grid-vue3'
import appConfig from '@config/appConfig'
import type { PiveauDataPreviewResponse } from '@/composables/usePiveauDataPreview'
import {
    ModuleRegistry,
    ColumnAutoSizeModule,
    ColumnHoverModule,
    PinnedRowModule,
    RowAutoHeightModule,
    RowStyleModule,
    PaginationModule,
    RowDragModule,
    CellSpanModule,
    CellStyleModule,
    HighlightChangesModule,
    TooltipModule,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    BigIntFilterModule,
    CustomFilterModule,
    LocaleModule,
    ClientSideRowModelModule,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
    ColumnAutoSizeModule,
    ColumnHoverModule,
    PinnedRowModule,
    RowAutoHeightModule,
    RowStyleModule,
    PaginationModule,
    RowDragModule,
    CellSpanModule,
    CellStyleModule,
    HighlightChangesModule,
    TooltipModule,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    BigIntFilterModule,
    CustomFilterModule,
    LocaleModule,
    ClientSideRowModelModule,
]);

const props = defineProps<{
  labels: PiveauDataPreviewResponse['labels']
  data: PiveauDataPreviewResponse['data']
}>()

const SUPPORTED_LOCALE_TEXTS: Record<string, any> = {
  'en': AG_GRID_LOCALE_EN,
  'de': AG_GRID_LOCALE_DE,
  'cz': AG_GRID_LOCALE_CZ,
}

const { t, locale } = useI18n()

const FALLBACK_LOCALE_TEXT = computed(() => {
  if (appConfig?.languages?.fallbackLanguage) {
    const fallbackLang: string = appConfig.languages.fallbackLanguage.toLowerCase()
    return SUPPORTED_LOCALE_TEXTS[fallbackLang] || AG_GRID_LOCALE_EN
  }
  return AG_GRID_LOCALE_EN
})

const localeText = computed(() => {
  return SUPPORTED_LOCALE_TEXTS[locale.value] || FALLBACK_LOCALE_TEXT.value
})

const civoraTheme = computed(() => themeQuartz
  .withParams({
    headerFontFamily: 'var(--font-family)',
    headerFontSize: 'var(--title-md-font-size)',
    headerFontWeight: '500',
    headerTextColor: 'var(--color-text-regular)',
    cellFontFamily: 'var(--font-family-secondary)',
    cellFontSize: 'var(--body-md-font-size)',
    cellFontWeight: '400',
    cellTextColor: 'var(--color-text-regular)',
    backgroundColor: 'var(--color-bg-white)',
    borderColor: 'var(--color-border)',
    accentColor: 'var(--color-primary-500)',
    textColor: 'var(--color-text-regular)',
  })
)

const paginationPageSize = ref(10)
const paginationPageSizeSelector = [10, 25, 50, 100]

const columnDefs = computed(() => {
  return props.labels.all_labels.map((field) => ({
    field,
    filter: 'agTextColumnFilter',
    resizable: true,
  }))
})

const rowData = computed(() => props.data)
</script>

<template>
  <div class="piveau-table-view">
    <div v-if="rowData.length === 0" class="empty-state">
      <p class="title-md no-data-text">{{ t('datasetDetails.previewViews.noData') }}</p>
    </div>
    <!--
    Use :key to force a rerender when locale changes
    This is required because ag-grid does not reactively update
    the locale text when the locale changes
    -->
    <AgGridVue
      v-else
      class="piveau-data-table"
      :key="locale"
      :theme="civoraTheme"
      :locale-text="localeText"
      :row-data="rowData"
      :column-defs="columnDefs"
      :pagination="true"
      :pagination-page-size="paginationPageSize"
      :pagination-page-size-selector="paginationPageSizeSelector"
    />
  </div>
</template>

<style scoped>
.piveau-table-view {
  width: 100%;
  overflow: auto;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.no-data-text {
  color: var(--color-text-muted);
}

.piveau-data-table {
  --ag-header-background-color: var(--color-bg-darker, #f5f5f5);
  --ag-header-foreground-color: var(--color-neutral-700, #1f2937);
  --ag-odd-row-background-color: transparent;
  --ag-row-border-color: var(--color-border, #e5e7eb);
  height: 480px;
}
</style>
