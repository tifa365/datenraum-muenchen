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
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

const { t } = useI18n()

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps<{
  chartData: {
    labels: (string | number)[]
    datasets: Array<{
      label: string
      data: number[]
      borderColor?: string
      backgroundColor?: string
      fill?: boolean
      tension?: number
    }>
  }
  chartOptions?: Record<string, any>
}>()

const ariaLabel = computed(() => {
  return t('datasetDetails.previewViews.chart-type-line-label', {
    distributionName: props.chartOptions?.plugins?.title?.text,
  })
})
</script>

<template>
  <div class="line-chart-container">
    <Line :data="props.chartData" :options="props.chartOptions" :aria-label="ariaLabel" role="img" />
  </div>
</template>

<style scoped>
.line-chart-container {
  position: relative;
  width: 100%;
  height: 400px;
}
</style>
