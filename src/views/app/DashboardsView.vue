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
import { ref, computed, type ComputedRef } from 'vue'
import { refDebounced } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import { useQuery } from '@tanstack/vue-query'
import appConfig from '@config/appConfig'
import SupersetService from '@/services/superset'
import { useAuthStore } from '@/stores/authStore'
import { useRouteQueryArray } from '@/composables/useRouteQueryArray'
import CIVViewHeader from '@/components/civora-ui/CIVViewHeader.vue'
import COSButton from '@/components/city-os/COSButton.vue'
import DashboardWidget from '@/components/dashboards/DashboardWidget.vue'
import CIVButton from '@/components/civora-ui/CIVButton.vue'
import CIVLoading from '@/components/civora-ui/CIVLoading.vue'
import CIVSearchInput from '@/components/civora-ui/CIVSearchInput.vue'
import CIVDropdown from '@/components/civora-ui/CIVDropdown.vue'
import CIVTag from '@/components/civora-ui/CIVTag.vue'

const authStore = useAuthStore()

const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
)

const useNewCivoraUi = computed(() => appConfig.customer.useNewCivoraUi === 'true')

const { isSuccess, data, isError, isLoading: allIsLoading } = useQuery({
  queryKey: ['dashboards'],
  queryFn: async () => {
    return SupersetService.fetchDashboards()
  },
})


const mappedDashboards = computed(() => {
  if (!isSuccess.value || !data.value) return []

  return data.value.result.reduce((acc, dashboard) => {

    // filter by custom tags (tag.type === 1 means custom tags)
    const tags = (dashboard.tags || []).filter(
      tag => tag.type === 1
    )

    const isMobileDashboard = tags.some(tag => tag.name.toLowerCase() === 'mobile')

    const mobileFilterEnabled = appConfig.customer.modules.dashboards.isMobileFilterEnabled !== 'false'

    if (mobileFilterEnabled && ((isMobileDevice && !isMobileDashboard) || (!isMobileDevice && isMobileDashboard))) {
      return acc
    }

    const displayTags = tags.filter(tag => tag.name.toLowerCase() !== 'mobile')

    const themesAndIcons = displayTags
      .map(tag => tag.name)

    const themes = themesAndIcons
      .map(name => name.replace(/ \(.*?\)/g, ''))
      .join(', ')

    const icon = themesAndIcons[0]?.match(/\((.*?)\)/)?.[1]?.toLowerCase() || ''

    acc.push({
      title: dashboard.dashboard_title,
      editor: dashboard.certified_by,
      themes,
      icon,
      tags: displayTags,
      dashboardId: dashboard.id,
    })
    return acc
  }, [])
})
const allDashboards = mappedDashboards

const { items: tagItems, toggle: toggleTagFilter, clear: clearTagFilters } = useRouteQueryArray<string>('tags')
const { items: authorItems, toggle: toggleAuthorFilter, clear: clearAuthorFilters } = useRouteQueryArray<string>('authors')

const selectedTags = computed(() => tagItems?.value
  ?.filter(tag => availableTags.value.has(tag)) || [])
const availableTags: ComputedRef<Set<string>> = computed(() => {
  return new Set(allDashboards?.value
    ?.flatMap((d) => d.tags.map((t) => t.name))
    || [])
})
const selectedAuthors = computed(() => authorItems?.value
  ?.filter(author => availableAuthors.value.has(author)) || [])
const availableAuthors: ComputedRef<Set<string>> = computed(() => {
  return new Set(allDashboards?.value
    ?.filter(d => d.editor)
    ?.map(d => d.editor)
    || [])
})

const rawSearchTerm = useRouteQuery('q', '')
const searchTerm = refDebounced(rawSearchTerm, 500)

const queryIsEnabled = computed(() => !!searchTerm.value)
const chartQuery = useQuery({
  queryKey: ['filter', searchTerm, selectedTags, selectedAuthors],
  enabled: queryIsEnabled,
  refetchOnWindowFocus: false,
  queryFn: async () => {
    if (searchTerm.value) {
      const result = await SupersetService.queryCharts(searchTerm.value)
      return result
    }
    return []
  }
})
const isLoading = computed(() => allIsLoading.value || chartQuery.isLoading.value)

const filteredDashboards = computed(() => {
  if (isLoading.value) {
    return []
  }

  const filteredByTagsAndAuthors = SupersetService.filterDashboards(
    mappedDashboards.value,
    selectedTags.value,
    selectedAuthors.value
  )

  const chartDashboards = chartQuery?.data?.value?.result
    ?.flatMap?.(chartResult => chartResult?.dashboards?.dashboard_title
      || chartResult?.dashboards?.map?.(dashboard => dashboard?.dashboard_title))
    ?.filter?.(value => !!value)
    ?? []

  const term = searchTerm.value.toLowerCase().trim()
  return filteredByTagsAndAuthors.filter((d) => {
    return (
      !term ||
      chartDashboards.includes(d.title) ||
      d.title.toLowerCase().includes(term) ||
      d.themes.toLowerCase().includes(term) ||
      (d.editor || '').toLowerCase().includes(term)
    )
  })
})

const clearFilters = () => {
  clearTagFilters()
  clearAuthorFilters()
  rawSearchTerm.value = ''
}

const hasAnyFilter = computed(() => selectedTags.value.length || selectedAuthors.value.length || rawSearchTerm.value)

const reloadPage = () => window.location.reload()
</script>

<template>
  <main>
    <CIVViewHeader
     class="dashboards-header"
     :title="$t('dashboards.title')"
     :description="$t('dashboards.subtitle')"
     >
      <template #bottomLeft v-if="authStore.authenticated">
        <CIVButton v-if="useNewCivoraUi"
          :label="$t('dashboard.new-dashboard')"
          iconPrefix="src/assets/icons/PlusDarkBlue.svg"
          :href="appConfig.supersetUrl"
          type="hero-primary"
          target="_blank"
        />
        <COSButton v-else
          target="_blank" button-style="outline" prefix="src/assets/icons/PlusDarkBlue.svg"
          :button-text="$t('dashboard.new-dashboard')" :link-to="appConfig.supersetUrl" :capitalize-text="false">
        </COSButton>
      </template>
    </CIVViewHeader>

    <div class="dashboard-search-content" v-if="appConfig.customer.isDashboardSearchEnabled === 'true'">
      <div class="dashboard-search-container">
        <div class="dashboard-search-item search">
          <CIVSearchInput
          v-model="rawSearchTerm"
          :placeholder="$t('dashboard.search-dashboards')"
          label="Dashboard"
          size="small"
          :hasSearchButton="false"
        />
      </div>
      <div class="dashboard-search-item dropdown">
        <CIVDropdown :label="$t('dashboard.topics')" :placeholder="$t('dashboard.select-topics')">
          <div class='tag-list'>
            <p class="dropdown-content"
              v-for="tag in availableTags" :key="tag"
              :class="{ selectedTag: selectedTags.includes(tag) }" @click="toggleTagFilter(tag)">
              {{ tag }}
            </p>
          </div>
        </CIVDropdown>
      </div>
      <div class="dashboard-search-item dropdown">
        <CIVDropdown :label="$t('dashboard.publisher')" :placeholder="$t('dashboard.select-publishers')">
          <div class="tag-list">
            <p
              class="dropdown-content"
                v-for="author in availableAuthors" :key="author"
                :class="{ selectedAuthor: selectedAuthors.includes(author) }"
                @click="toggleAuthorFilter(author)"
                >
                {{ author }}
              </p>
            </div>
          </CIVDropdown>
        </div>
      </div>

      <div class='dashboard-search-filters'>
        <CIVTag v-if='rawSearchTerm' tone='primary' :hasDotIcon="false" @onClose="rawSearchTerm = ''"
          :text="rawSearchTerm" />
        <CIVTag v-if="selectedTags.length" :hasDotIcon="false" tone='primary' @onClose="clearTagFilters">
          <p>{{ $t('dashboard.topics') }}: <strong>{{ selectedTags.join(', ') }}</strong></p>
        </CIVTag>
        <CIVTag v-if="selectedAuthors.length" :hasDotIcon="false" tone='primary' @onClose="clearAuthorFilters">
          <p>{{ $t('dashboard.selected-authors') }}: <strong>{{ selectedAuthors.join(', ') }}</strong></p>
        </CIVTag>
        <CIVButton v-if="hasAnyFilter" iconPrefix='src/assets/icons/Close.svg' :label="$t('dashboard.clear-filters')" @click="clearFilters"
          type='tertiary' class='clear-button' />
      </div>
    </div>

    <template v-if="isLoading">
      <CIVLoading />
    </template>
    <div v-else-if="isError" class="error">
      <p class="error-message title-md">
        {{ $t('dashboards.error.message') }}
      </p>
      <CIVButton :label="$t('dashboards.error.reload')" @click="reloadPage" />
    </div>
    <template v-else-if="filteredDashboards.length === 0">
      <div class="empty-state">
        <p class="empty-message title-md">
          {{ $t('dashboards.empty.message') }}
        </p>
      </div>
    </template>

    <div v-else>
      <div class="dashboard-widgets">
        <DashboardWidget v-for="dashboard in filteredDashboards" :key="dashboard.dashboardId" :title="dashboard.title"
          :publisher="dashboard.editor" :topics="dashboard.themes" :icon="dashboard.icon"
          :dashboard-id="dashboard.dashboardId" />
      </div>
    </div>
  </main>
</template>

<style scoped>
.dashboards-header {
}

.error {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 20px;
  margin-top: 30px;
  padding: 0 20px;
}

.error-message {
  text-align: center;
  word-wrap: break-word;
  max-width: 600px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 40px;
  padding: 0 20px;
}

.empty-message {
  text-align: center;
  color: var(--color-text-secondary);
  max-width: 600px;
}

main {
  min-height: 100%;
  background-color: var(--color-bg-darker)
}

.dashboard-widgets {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
}

.dashboard-search-container {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-end;
  width: 100%;
  padding: 32px 32px 16px 32px;
}

.dashboard-search-item {
  flex: 1 1 min(280px, 100%);
  min-width: 0;
}

.dashboard-search-item input,
.dashboard-search-item select {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  font-size: 1rem;
}

.dropdown-content {
  cursor: pointer;
  padding: 4px;
  padding-left: 12px;
  border-radius: 4px;
  text-transform: capitalize;
}

.tag-list {
  max-height: 260px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dropdown-content:hover {
  background-color: var(--color-neutral-300);
}

.selectedAuthor,
.selectedTag {
  background-color: var(--color-button-pressed);
  color: var(--color-neutral-100);
}

.selectedAuthor:hover,
.selectedTag:hover {
  background-color: var(--color-button-pressed);
}

.dashboard-search-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  margin-left: 32px;
  text-transform: capitalize;
}

.clear-button {
  color: var(--color-danger-600);
  padding-left: 0;
}
.clear-button:hover {
  color: var(--color-danger-600);
}

@media (max-width: 1239px) {
  .dashboard-widgets {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-widgets {
    grid-template-columns: 1fr;
  }
}
</style>
