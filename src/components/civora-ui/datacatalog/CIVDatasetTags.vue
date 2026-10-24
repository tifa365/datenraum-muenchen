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

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CIVTag from '@/components/civora-ui/CIVTag.vue'
import CIVTooltip from '@/components/civora-ui/CIVTooltip.vue'

const { t } = useI18n()

const props = defineProps({
  visibilityLabel: { type: String, default: '' },
  visibilityIcon: { type: String, default: '' },
  visibilityTooltipText: { type: String, default: '' },
  isSoftData: { type: Boolean, default: false },
  isHVD: { type: Boolean, default: false },
  accrualPeriodicityVal: { type: String, default: '' },
  publicationStatus: { type: String, default: '' },
})

const hasTags = computed(() =>
  !!props.visibilityLabel ||
  props.publicationStatus === 'draft' ||
  props.accrualPeriodicityVal === 'http://publications.europa.eu/resource/authority/frequency/UPDATE_CONT' ||
  props.isHVD ||
  props.isSoftData
)
</script>

<template>
  <div v-if="hasTags" class="dataset-tags">
    <!-- Visibility tag -->
    <CIVTooltip
      v-if="visibilityLabel && visibilityTooltipText"
      :text="visibilityTooltipText"
      position="top"
      portal
      class="visibility-tooltip">
      <CIVTag
        :svgIcon="visibilityIcon"
        :text="visibilityLabel"
        tone="primary"
        :hasCloseIcon="false"
        :hasDotIcon="false" />
    </CIVTooltip>
    <CIVTag
      v-else-if="visibilityLabel"
      :svgIcon="visibilityIcon"
      :text="visibilityLabel"
      tone="primary"
      :hasCloseIcon="false"
      :hasDotIcon="false" />
    <CIVTag
      v-if="publicationStatus === 'draft'"
      :text="t('datasets.draft', 'Draft')"
      tone="warning"
      :hasCloseIcon="false"
      :hasDotIcon="false" />
    <CIVTag
      v-if="accrualPeriodicityVal === 'http://publications.europa.eu/resource/authority/frequency/UPDATE_CONT'"
      text="Live Data" tone="positive" :hasCloseIcon="false" :hasDotIcon="true" />
    <CIVTag v-if="isHVD" text="HVD" tone="promote" :hasCloseIcon="false"
      :hasDotIcon="false" />
    <CIVTag v-if="isSoftData" :text="t('datasetFacets.facets.is_soft_data')" tone="neutral"
      :hasCloseIcon="false" :hasDotIcon="false" />
  </div>
</template>

<style scoped>
.dataset-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.visibility-tooltip {
  display: inline-flex;
}
</style>
