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

<template>
  <CIVTransparentCard cardClass="transparent-card">
    <div class="container" :style="cardStyle">
      <img class="image" :src="logo" />
      <div class="information-container">
        <p :id="categoriesLabelId" class="title-md information-title">{{ $t('organisation.categoriesOfData') }}</p>
        <CIVFadeScrollContainer
          v-if="categories && categories.length > 0"
          class="tags"
          :aria-labelledby="categoriesLabelId"
          orientation="vertical">
          <CIVTag v-for="(category, index) in categories"
            :key="index"
            :text="category"
            :hasCloseIcon="false"
            :hasDotIcon="false"
          />
        </CIVFadeScrollContainer>
        <p v-else class="title-md">/</p>
      </div>
      <div v-if="url" class="information-container">
        <p class="title-md information-title">{{ $t('message.metadata.website') }}</p>
        <a class="title-md" :href="url">{{ websiteText || url }}</a>
      </div>
    </div>
  </CIVTransparentCard>
</template>

<script setup>
import { useId } from 'vue'
import CIVTag from '../../CIVTag.vue';
import CIVTransparentCard from '../../CIVTransparentCard.vue';
import CIVFadeScrollContainer from '@/components/civora-ui/CIVFadeScrollContainer.vue';

const categoriesLabelId = useId()

defineProps({
  logo: String,
  categories: Array,
  url: String,
  websiteText: String,
  cardStyle: {
    type: Object,
    default: () => ({})
  }
})
</script>

<style scoped>
.container {
  gap: 24px;
  display: flex;
  align-items: start;
  justify-content: start;
  flex-direction: column;
}

.container .image {
  width: 364px;
  height: 190px;
  background-color: var(--color-neutral-100);
  padding: 1rem;
  border-radius: 8px;
  object-fit: contain;
}

.information-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.information-title {
  color: var(--hero-card-header-text-secondary-color);
}

.container .tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  max-height: 112px;
}

.website-container {
  display: flex;
  gap: 4px;
  color: var(--hero-card-header-text-secondary-color);
}

.transparent-card {
  max-width: 410px !important;
}

@media (max-width: 768px) {
  .transparent-card {
    max-width: 100% !important;
  }
  .container .image {
    width: 100%;
  }
}
</style>