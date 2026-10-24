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
import { type PiveauDataPreviewResponse } from '@/composables/usePiveauDataPreview'
import CIVDropdownSelect from '../CIVDropdownSelect.vue'
import CIVBarChart from './CIVBarChart.vue'
import CIVDoughnutChart from './CIVDoughnutChart.vue'

const { t } = useI18n()

const props = defineProps<{
  title: string
  labels: PiveauDataPreviewResponse['labels']
  data: PiveauDataPreviewResponse['data']
  categorized: PiveauDataPreviewResponse['categorized']
  defaultViewOptions: PiveauDataPreviewResponse['default_view_options'] | null
}>()

const SUPPORTED_CHART_TYPES = [ 'bar', 'doughnut' ]

const chartType = ref<['bar' | 'doughnut']>(
  [props.defaultViewOptions?.default_categorical_chart || 'doughnut'])

// only one value can be selected for x-axis,
// but for interop with CIVDropdownSelect,
// we use an array of length 1
const xLabel = ref<string[]>(
  props.defaultViewOptions?.default_axes?.categorical_chart
  ? [props.defaultViewOptions.default_axes.categorical_chart]
  : props.labels?.categorical_labels?.[0]
    ? [props.labels.categorical_labels[0]]
    : []
)

const xLabelOptions = computed(() => props.labels.categorical_labels)

const categoricalChartData = computed(() => {
  if (!props.categorized.length) {
    return null
  }

  const categoryData = props.categorized.find((c) => c.column === xLabel.value[0])

  if (!categoryData) {
    return null
  }

  const labels = Object.keys(categoryData.categories)
  const dataValues = Object.values(categoryData.categories)

  const colors = labels.map((_, index) => {
    const hue = (index * 90) / labels.length
    return `hsl(${hue}, 70%, 60%)`
  })

  return {
    labels,
    datasets: [
      {
        label: xLabel.value[0],
        data: dataValues,
        backgroundColor: colors,
        borderColor: colors.map((c) => c.replace('60%', '40%')),
        borderWidth: 1,
      },
    ],
  }
})

const categoricalChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
    },
    title: {
      display: true,
      text: props.title || t('datasetDetails.previewViews.categorical'),
    },
  },
}))
</script>

<template>
  <div v-if="!categoricalChartData" class="no-data-message">
    <p class="body-md text-muted">{{ t('datasetDetails.previewViews.noCategoricalData') }}</p>
  </div>
  <div v-else>
    <div class="chart-controls">
      <div class="chart-type-selector-control">
        <CIVDropdownSelect
          class="chart-option-selector"
          v-model:selected-items="chartType"
          :label="t('datasetDetails.previewViews.chart-type')"
          :items="SUPPORTED_CHART_TYPES"
          :transform="(item) => t(`datasetDetails.previewViews.chart-type-${item}`)"
          :close-on-select="true"
        />
      </div>
      <div class="chart-axis-data-controls">
        <CIVDropdownSelect
          class="chart-option-selector"
          v-model:selected-items="xLabel"
          :label="t('datasetDetails.previewViews.parameter')"
          :items="xLabelOptions"
          :close-on-select="true"
        />
      </div>
    </div>
    <CIVBarChart
      v-if="chartType[0] === 'bar'"
      :chart-data="categoricalChartData"
      :chart-options="categoricalChartOptions"
    />
    <CIVDoughnutChart
      v-if="chartType[0] === 'doughnut'"
      :chart-data="categoricalChartData"
      :chart-options="categoricalChartOptions"
    />
  </div>
</template>

<style scoped>
.chart-controls {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.chart-axis-data-controls {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
}

.chart-option-selector {
  width: 300px;
}
</style>
