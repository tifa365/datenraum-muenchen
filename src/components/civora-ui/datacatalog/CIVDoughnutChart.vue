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
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
)

const props = defineProps<{
  chartData: {
    labels: (string | number)[]
    datasets: Array<{
      label: string
      data: number[]
      backgroundColor?: string[]
      borderColor?: string | string[]
      borderWidth?: number
    }>
  }
  chartOptions?: Record<string, any>
}>()

const { t } = useI18n()

const ariaLabel = computed(() => {
  return t('datasetDetails.previewViews.chart-type-doughnut-label', {
    distributionName: props.chartOptions?.plugins?.title?.text,
  })
})
</script>

<template>
  <div class="doughnut-chart-container">
    <Doughnut :data="chartData" :options="chartOptions" :aria-label="ariaLabel" />
  </div>
</template>

<style scoped>
.doughnut-chart-container {
  position: relative;
  width: 100%;
  height: 400px;
}
</style>
