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
import type { DatasetType } from '@/projects/kdw/utils/types';
import CIVDataInfoBox from './CIVDataInfoBox.vue';

defineProps({
  isLoading: Boolean,
  datasets: Object,
  isFetching: Boolean,
  isAppRoute: Boolean,
})
</script>

<template>
  <div class="datasetList">
    <template v-if="!isLoading">
      <CIVDataInfoBox v-for="dataset in datasets" :key="dataset.id"
        :to="`data-catalog/${dataset.id}`"
        :super-title="dataset.publisher" :ghost="isFetching" :title="dataset.title" :formats="dataset.formats"
        :issued="dataset.issued || '—'" :categories="dataset.categories"
        :is-hvd="dataset.is_hvd"
        :dataset-type="dataset.datasetType as DatasetType">
      </CIVDataInfoBox>
    </template>
    <template v-else>
      <CIVDataInfoBox v-for="i in 8" :key="`placeholder--${i}`" title="na" :categories="['na']" to="/" ghost />
    </template>
  </div>
</template>

<style>
.datasetList {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
