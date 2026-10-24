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
import { RouterLink } from 'vue-router'
import { getTranslationFor } from '@/projects/kdw/sdk/utils/helpers'
import { truncate } from '@/projects/data-provider-interface/utils/helpers'
import { useNews } from '@/composables/useNews'
import CIVMaskedIcon from '../civora-ui/CIVMaskedIcon.vue'

const { isLoading, isError, newsItems: allNewsItems } = useNews()
const newsItems = computed(() => allNewsItems.value.slice(0, 3))
</script>

<template>
<div class="cos-news-widget-container">
  <span class="cos-news-widget-title">
    {{ $t('userdashboard.widgets.news.newsfrom') }}
  </span>
  <span v-if="isLoading && !isError">
    {{ $t('userdashboard.widgets.news.loading') }}
  </span>
  <span v-if="isError">
    {{ $t('userdashboard.widgets.news.error') }}
  </span>
  <ul v-if="!isLoading && !isError" class="cos-news-widget-list">
    <li
      class="cos-news-item"
      v-for="(newsItem, i) in newsItems"
      :key="i"
    >
      <CIVMaskedIcon
        class="cos-news-item-icon"
        svgIcon="src/assets/icons/news-new-icon.svg"/>
      <RouterLink class="cos-news-item-info-container" :to="newsItem.url">
        <span class="cos-news-item-caption">
          {{ truncate(newsItem.header, 24, false) }}
        </span>
        <span class="cos-news-item-subject">
          {{  $t(
                `userdashboard.widgets.news.${newsItem.type}`,
                { title: truncate(
                    getTranslationFor(newsItem.subject, $i18n.locale),
                    36,
                    false
                  )
                }
              )
          }}
        </span>
        <span class="cos-news-item-link">
          {{ $t('userdashboard.widgets.news.view') }}
          <CIVMaskedIcon class="arrow-right-icon" svg-icon="src/assets/icons/ArrowRight.svg" />
        </span>
      </RouterLink>
    </li>
  </ul>
</div>
</template>

<style scoped>
  .cos-news-widget-container {
    display: flex;
    flex-direction: column;
    flex: 1 1 256px;
    padding: 24px 32px;
    background: #fff;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    gap: 18px;
  }

  .cos-news-widget-title {
    font-family: var(--font-family), sans-serif;
    font-weight: 600;
    font-size: 18px;
    line-height: 20px;
  }

  .cos-news-widget-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .cos-news-item {
    display: flex;
    width: 100%;
    height: auto;
    gap: 24px;
  }

  .cos-news-item-icon {
    height: 40px;
    width: 40px;
    min-height: 40px;
    min-width: 40px;
    align-self: center;
    background-color: var(--color-primary-500);
  }

  .cos-news-item-icon::after {
    content: '';
    border-left: 1px solid black;
    width: 1px;
    height: 100%;
  }

  .arrow-right-icon {
    background-color: var(--color-primary-500);
  }

  .cos-news-item-info-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .cos-news-item-info-container:hover .cos-news-item-link {
    text-decoration: underline;
  }

  .cos-news-item-caption {
    font-family: var(--font-family), sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    text-align: left;
    color: #667f93;
  }

  .cos-news-item-subject {
    font-family: var(--font-family), sans-serif;
    font-size: 16px;
    font-weight: 600;
    line-height: 26px;
    text-align: left;
    color: #1A2025;
    word-wrap: break-word;
  }

  .cos-news-item-link {
    display: flex;
    gap: 9px;
    font-family: var(--font-family), sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: 26px;
    text-align: left;
    color: var(--color-primary-500);
    align-items: center;
  }

</style>