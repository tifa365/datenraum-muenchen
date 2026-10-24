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
import CIVLineChart from './CIVLineChart.vue'
import CIVBarChart from './CIVBarChart.vue'

const { t } = useI18n()

const props = defineProps<{
  title: string
  labels: PiveauDataPreviewResponse['labels']
  data: PiveauDataPreviewResponse['data']
  defaultViewOptions: PiveauDataPreviewResponse['default_view_options'] | null
}>()

const SUPPORTED_CHART_TYPES = [ 'bar', 'line' ]

const chartType = ref<['bar' | 'line']>(
  [props.defaultViewOptions?.default_numerical_chart || 'line'])

// only one value can be selected for x-axis,
// but for interop with CIVDropdownSelect,
// we use an array of length 1
const xLabel = ref<string[]>(
  props.defaultViewOptions?.default_axes?.numerical_chart?.x
    ? [props.defaultViewOptions.default_axes.numerical_chart.x]
    : props?.labels.categorical_labels?.[0]
      ? [props.labels.categorical_labels[0]]
      : []
)


const yLabels = ref<string[]>(
  props.defaultViewOptions?.default_axes.numerical_chart.y
  || props.labels.numerical_labels.slice(0, 1)
  || []
)

const xLabelOptions = computed(() => props.labels.categorical_labels)
const yLabelOptions = computed(() => props.labels.numerical_labels)

const numericalChartData = computed(() => {
  if (!props.data || !props.data.length || !props.labels.numerical_labels.length) {
    return null
  }

  const xData = props.data.map((row) => row[xLabel.value?.[0]])

  const styles = getComputedStyle(document.documentElement)

  const datasets = yLabels.value.map((yLabel, index) => {
    const colors = [
      styles.getPropertyValue('--color-primary-500'),
      styles.getPropertyValue('--color-secondary-500'),
      styles.getPropertyValue('--color-success-500'),
      styles.getPropertyValue('--color-info-500'),
      styles.getPropertyValue('--color-promote-500'),
      styles.getPropertyValue('--color-primary-700'),
      styles.getPropertyValue('--color-secondary-700'),
    ]
    const color = colors[index % colors.length]

    return {
      label: yLabel,
      data: props.data.map((row) => row[yLabel]),
      borderColor: chartType.value[0] === 'line' ? color : color + "33",
      backgroundColor: chartType.value[0] === 'line' ? color + "33" : color,
      tension: 0.1,
    }
  })

  return {
    labels: xData,
    datasets,
  }
})

const numericalChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
    },
    title: {
      display: true,
      text: props.title || t('datasetDetails.previewViews.numerical'),
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: xLabel.value?.[0],
      },
    },
    y: {
      title: {
        display: true,
        text: yLabels.value
      },
    },
  },
}))
</script>

<template>
  <div v-if="!numericalChartData" class="no-data-message">
    <p class="body-md text-muted">{{ t('datasetDetails.previewViews.noNumericalData') }}</p>
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
          :label="t('datasetDetails.previewViews.xAxis')"
          :items="xLabelOptions"
          :close-on-select="true"
        />
        <CIVDropdownSelect
          class="chart-option-selector"
          v-model:selected-items="yLabels"
          :label="t('datasetDetails.previewViews.yAxis')"
          :items="yLabelOptions"
          :is-multi-select="true"
          :close-on-select="false"
        />
      </div>
    </div>
    <CIVLineChart v-if="chartType[0] === 'line'"
      :chart-data="numericalChartData"
      :chart-options="numericalChartOptions" />
    <CIVBarChart v-if="chartType[0] === 'bar'"
      :chart-data="numericalChartData"
      :chart-options="numericalChartOptions" />
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
