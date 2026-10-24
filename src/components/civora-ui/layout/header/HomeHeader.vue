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
  <div
    class="header view-header-background"
    :style="{ 'background-image': `url(${homepageHeaderImage})` }">
    <div class="header-content">
        <CIVButton
        v-if="appConfig.customer.modules.home.cosButtonActive === 'true'"
        @click="handleClick"
        type="secondary"
        :label="$t('home.organisation-data')"/>
        <CIVCardBasic
        :image="logo"
        :title="title"
        :description="description">
        <template #tags>
          <div v-if="tagText" class="tag-section">
            <CIVTag :text="tagText" tone="primary" :hasCloseIcon="false" :hasDotIcon="false" />
          </div>
        </template>
        <template #search>
          <form class="input-container" @submit.prevent="onSearch">
            <img src="../../../../assets/icons/Searchgray.svg">
            <input class="body-md search-input" type="text" v-model="form.search"
              :placeholder="$t('landing-page.hero.search-placeholder')" />
            <CIVButton :label="$t('landing-page.hero.search')" />
          </form>
        </template>
      </CIVCardBasic>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import CIVButton from '../../CIVButton.vue'
import CIVCardBasic from './CIVCardBasic.vue'
import CIVTag from '../../CIVTag.vue'
import appConfig from '/config/appConfig'

const router = useRouter()
const form = reactive({ search: '' })

defineProps({
  logo: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  homepageHeaderImage: {
    type: String,
    required: true
  },
  tagText: {
    type: String,
    required: false
  }
})

const handleClick = () => {
    router.push('data-catalog/organisation-data')
}

const onSearch = () => {
    const searchQuery = form.search.trim()
    if (!searchQuery) return
    router.push({ path: '/app/data-catalog', query: { q: searchQuery } })
}
</script>

<style scoped>
.header {
  width: 100%;
  display: flex;
  background-repeat: no-repeat;
  color: var(--color-text-light);
}
.header-content {
  width: 100%;
  margin: 40px;
  gap: 32px;
  display: flex;
  flex-direction: column;
  align-items: end;
  justify-content: start;
}
.input-container {
    max-width: 796px;
    padding: 8px 12px;
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: start;
    border-radius: 4px;
    background-color: var(--color-bg-white);
    border: 1.5px solid var(--color-border);
}

.input-container .search-input {
    width: 100%;
    background-color: unset;
    border: none;
    outline: none;
    color: var(--color-neutral-500);
}

@media (max-width: 550px) {
  .input-container {
    max-width: 100%;
    padding: 8px;
    flex-wrap: wrap;
  }

  .input-container .search-input {
    min-width: 0;
  }
}

@media (max-width: 400px) {
  .input-container {
    padding: 6px;
    gap: 8px;
  }
}
</style>
