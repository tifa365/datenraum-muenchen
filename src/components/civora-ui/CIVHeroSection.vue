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
    <div class="CIV-hero-container view-header-background" :style="{ 'background-image': `url(${headerImage})`}">
      <router-link
        v-if="appConfig?.customer?.modules?.dataCatalog?.available === 'true' && appConfig?.customer?.modules?.home?.cosButtonActive !== 'false'"
        to="data-catalog/organisation-data"
      >
        <CIVButton
          type="secondary"
          :label="$t('home.organisation-data')"
          route-to="data-catalog/organisation-data"
        />
      </router-link>
      <div class="CIV-blur-container">
          <p class="title display-sm">{{ title }}</p>
          <p class="subtitle body-xl">{{subtitle}} <br> {{ description }} </p>
          <form v-if="isSearchEnabled" @submit.prevent="doSearch" class="input-container">
            <label for="search-input" class="screen-reader-only">
              {{ $t('civora.layout.searchInput.placeholder') }}
            </label>
              <img src="../../assets/icons/Searchgray.svg" alt="" aria-hidden="true">
              <input id="search-input" v-model="searchPrompt" type="search" :placeholder="$t('civora.layout.searchInput.placeholder')">
              <CIVButton @click="doSearch" :label="$t('landing-page.hero.search')"/>
          </form>
      </div>
    </div>
  </template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import appConfig from '@config/appConfig'

import CIVButton from './CIVButton.vue'

defineProps({
  title: String,
  subtitle: String,
  description: String,
  headerImage: String
})

const router = useRouter();

const isSearchEnabled = computed(() => appConfig?.customer?.modules?.home?.isSearchEnabled !== 'false')

const searchPrompt = defineModel<string>()
const doSearch = () => {
  if(!searchPrompt?.value?.trim()) {
    router.push('/app/data-catalog')
    return
  }
  router.push('/app/data-catalog?q='+ searchPrompt.value)
}
</script>

<style scoped>
  .CIV-hero-container {
    display: flex;
    flex-direction: column;
    align-items: end;
    gap: 32px;
    padding: 32px 48px;
    height: auto;
    width: 100%;
    display: flex;
    /* background-image: url("../../assets/images/CIVORA Hero Header.png") !important; */
    background-repeat: no-repeat;
    background-size: cover;
    object-fit: cover;
  }

  .CIV-blur-container{
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 32px;
    width: 100%;
    height: 100%;
    background: var(--hero-card-background);
    backdrop-filter: var(--hero-card-backdrop-filter);
    border-radius: 8px;
  }

  .CIV-blur-container::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 8px;
    padding: var(--hero-card-before-padding); /* Border width */
    background: var(--hero-card-before-background);
    mask: var(--hero-card-before-mask);
    mask-composite: var(--hero-card-before-mask-composite);
    pointer-events: none;
  }

  .CIV-blur-container .title{
    color: var(--hero-card-header-text-primary-color);
  }

  .CIV-blur-container .subtitle{
    color: var(--hero-card-header-text-secondary-color);
  }

  .input-container{
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    width: 100%;
    max-width: 800px;
    background: #fff;
    border-radius: 4px;
    border: 1.5px;
  }

  .input-container input{
    width: 100%;
    outline: none;
  }

  .input-container img{
    width: 24px;
    height: 24px;
  }

  .screen-reader-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (max-width: 768px) {
    .title {
      font-size: var(--headline-md-font-size) !important;
      line-height: 35px;
    }

    .CIV-blur-container{
      padding: 20px;
      gap: 15px;
    }

    .subtitle{
      font-size: 18px !important;
    }

    .CIV-hero-container{
      gap: 15px;
      padding: 20px 30px;
    }

    .input-container{
      padding: 4px 8px;
    }
  }
</style>