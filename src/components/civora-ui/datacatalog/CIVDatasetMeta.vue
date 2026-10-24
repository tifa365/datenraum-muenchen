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
const subtractIcon = '/src/assets/icons/Subtract.svg'

const props = defineProps({
  author: { type: String, default: '' },
  categories: { type: Array, default: () => [] },
  distributions: { type: Array, default: () => [] },
})

const infoList = computed(() => [
  { title: 'datasets.theme', value: props.categories },
  { title: 'datasets.formats', value: props.distributions, info: t('datasets.tooltip-text') },
])
</script>

<template>
  <div class="information-container">
    <div v-if="author" class="information-content">
      <h5 class="title-md information-content-title">{{ t('datasets.author') }}</h5>
      <p class="author-container-text">{{ author }}</p>
    </div>

    <template v-for="{ value, title, info } in infoList" :key="title">
      <div v-if="Array.isArray(value) && value.length" class="information-content">
        <div class="info-container-header">
          <h5 class="title-md information-content-title">{{ t(title) }}</h5>
          <CIVTooltip v-if="info" :text="info" portal>
            <img :src="subtractIcon" alt="info" />
          </CIVTooltip>
        </div>
        <div class="information-content-tags">
          <CIVTag v-for="(category, idx) in value" :key="idx" :text="category"
            :hasCloseIcon="false" :hasDotIcon="false" />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.information-container {
  display: flex;
  gap: 24px;
  flex-direction: row;
}

.info-container-header {
  position: relative;
  display: flex;
  gap: 8px;
}

.information-content {
  width: 394px;
  display: flex;
  gap: 8px;
  flex-direction: column;
}

.information-content-title,
.author-container-text {
  color: var(--hero-card-header-text-secondary-color);
}

.information-content-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 870px) {
  .information-container {
    flex-direction: column;
  }

  .information-content {
    width: 100%;
  }
}

@media (max-width: 550px) {
  .information-content {
    width: 100%;
  }

  .information-content-tags {
    flex-wrap: wrap;
  }
}
</style>
