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
import { useQuery } from '@tanstack/vue-query'
import { getTranslationFor } from '@/projects/kdw/sdk/utils/helpers'
import { truncate } from '@/projects/data-provider-interface/utils/helpers'
import { useAuthStore } from '@/stores/authStore'
import { usePermissions } from '@/composables/useAccessPermissions'
import { useI18n } from 'vue-i18n'
import appConfig from '@config/appConfig'

const searchUrl = appConfig.piveauHubSearchUrl.endsWith('/')
  ? appConfig.piveauHubSearchUrl + 'search?'
  : appConfig.piveauHubSearchUrl + '/search?'

const staleTime = 2 * 60 * 1000

const { t, locale } = useI18n()

const authStore = useAuthStore()
const { accessControlEnabled, permissionMap, hasOrganizationScope, hasCatalogScope } = usePermissions()

const headers = async () => {
  const authenticated = authStore.authenticated
  const authToken = accessControlEnabled
    ? await authStore.getAuthToken() ?? ''
    : ''

  if (!authenticated || !authToken) {
    return undefined
  }

  return {
    Authorization: `Bearer ${authToken}`,
  }
}

const catalogsQuery = useQuery({
  queryKey: ['orgnewswidgetsupercatalogs'],
  staleTime: staleTime,
  enabled: !accessControlEnabled,
  refetchOnWindowFocus: false,
  queryFn: async () => {
    const response = await fetch(
      searchUrl + new URLSearchParams({
        filters: 'dataset',
        limit: '0',
      }).toString(),
      {
        method: 'GET',
        headers: await headers(),
      },
    )
    if (!response.ok) {
      throw new Error(`failed to fetch data from piveau ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    return {
      catalogs: data.result.facets.find((facet: any) => facet.id === 'catalog')?.items ?? [],
      superCatalogs: data.result.facets.find((facet: any) => facet.id === 'superCatalog')?.items ?? [],
    }
  },
})

const enableDatasetsQuery = computed(() => accessControlEnabled || catalogsQuery.isSuccess.value)

const queryKey = computed(() => [
  'orgnewswidgetdatasets',
  accessControlEnabled,
  authStore.authenticated,
  authStore?.user?.username,
  Array.from(permissionMap.value.organizations.keys()).join(','),
  Array.from(permissionMap.value.catalogs.keys()).join(','),
])

const datasetsQuery = useQuery({
  queryKey: queryKey,
  staleTime: staleTime,
  refetchOnWindowFocus: false,
  enabled: enableDatasetsQuery,
  queryFn: async () => {
    let facetsObject = {};
    let facetCatalogGroups: string[] = []
    let facetSuperCatalogGroups: string[] = []

    const isAdmin = authStore.user?.groupMemberships.includes('/Piveau/Civora Piveau Administrator') ||
                      authStore.user?.groupMemberships.includes('/Administrator')

    if (!isAdmin && accessControlEnabled) {
      facetSuperCatalogGroups = Array.from(permissionMap.value.organizations
        .keys())
        .filter((organizationId: string) =>
          hasOrganizationScope(organizationId, 'dataset:view_published')
        )

      facetCatalogGroups = Array.from(permissionMap.value.catalogs
        .keys())
        .filter((catalogId: string) =>
          hasCatalogScope(catalogId, 'dataset:view_published')
        )
        // Search facets use catalog IDs; permission keys may include the organization.
        .map((catalogKey: string) => catalogKey.split('/').pop()!)
    } else if (!isAdmin) {
      facetSuperCatalogGroups = catalogsQuery.data.value?.superCatalogs
        .filter(
          (catalog: any) =>
            authStore.user?.groupMemberships
              .some(group => group.startsWith(`/${catalog.id}`))
        )
        .map((superCatalog: any) => superCatalog.id)

      facetCatalogGroups = catalogsQuery.data.value?.catalogs
        .filter(
          (catalog: any) => authStore.user?.groupMemberships
            .some(group => group.startsWith(`/${catalog.id}`))
        )
        .map((catalog: any) => catalog.id)
    }

    if (!isAdmin && (facetSuperCatalogGroups.length === 0 && facetCatalogGroups.length === 0)) {
      console.log('Organization News: No matching catalogs found for user group memberships, returning empty results')
      return { result: { results: [] } }
    }

    facetsObject = {
      ...(facetSuperCatalogGroups.length > 0 && { superCatalog: facetSuperCatalogGroups }),
      ...(facetCatalogGroups.length > 0 && { catalog: facetCatalogGroups }),
    }

    const facets = JSON.stringify(facetsObject)

    const response = await fetch(
      searchUrl + new URLSearchParams({
        facets,
        filters: 'dataset',
        sort: 'issued+desc',
        facetOperator: 'OR',
        facetGroupOperator: 'OR',
        limit: '4',
      }).toString(),
      {
        method: 'GET',
        headers: await headers(),
      },
    )
    if (!response.ok) {
      throw new Error(`failed to fetch data from piveau ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    return data
  },
})

const isLoading = computed(() => catalogsQuery.isFetching.value || datasetsQuery.isFetching.value)
const isError = computed(() => catalogsQuery.isError.value || datasetsQuery.isError.value)
const items = computed(() => {
  if (datasetsQuery.isSuccess.value && datasetsQuery.data.value?.result?.results) {
    return datasetsQuery.data.value?.result.results.map((dataset: any) => {
      return {
        name: dataset.title,
        status: !accessControlEnabled
          ? 'public'
          : dataset?.catalog_record?.publication_status === 'published'
            ? 'public'
            : 'draft',
        modified: dataset.modified,
        url: `/app/data-catalog/${dataset.id}`,
        distributions: [...new Set(dataset.distributions?.map((distribution: any) => {
          return distribution.format?.label
        }).filter((value: string) => !!value))],
      }
    })
  }
  return []
})

const dateTimeFormat = Intl.DateTimeFormat()

function formatDate(date: string) {
  if (!date) {
    return '-'
  }
  const parsedDate = new Date(date)
  if (parsedDate.toString() === 'Invalid Date') {
    return '-'
  }
  return dateTimeFormat.format(parsedDate)
}
</script>

<template>
  <div class="cos-orgnews-widget-container">
    <div class="cos-orgnews-widget-title-container">
      <span class="cos-orgnews-widget-title">
        {{ t('userdashboard.widgets.orgnews.overview') }}
      </span>
      <img class="cos-orgnews-widget-more-button" src="../../assets/icons/ThreeDotsVertical.svg" alt="More Icon" />
    </div>
    <span v-if="isLoading && !isError">
      {{ t('userdashboard.widgets.news.loading') }}
    </span>
    <span v-if="!isLoading && isError">
      {{ t('userdashboard.widgets.news.error') }}
    </span>
    <div v-if="datasetsQuery.isSuccess" class="cos-orgnews-widget-grid-container">
      <span class="cos-orgnews-widget-grid-header">{{ t('userdashboard.widgets.orgnews.datasetstab') }}</span>
      <span class="cos-orgnews-widget-grid-header">{{ t('userdashboard.widgets.orgnews.statustab') }}</span>
      <span class="cos-orgnews-widget-grid-header">{{ t('userdashboard.widgets.orgnews.formattab') }}</span>
      <span v-if="items.length == 0" class="cos-orgnews-widget-grid-empty">{{ t('userdashboard.widgets.orgnews.nodata')
        }}</span>
      <template v-for="(item, i) in items" :key="i">
        <RouterLink :to="item.url" class="cos-orgnews-widget-grid-item-name">
          {{ truncate(getTranslationFor(item.name, locale), 42, true) }}
        </RouterLink>
        <div class="cos-orgnews-widget-grid-item-status-container">
          <div :class='"cos-orgnews-widget-grid-item-status cos-orgnews-widget-grid-item-status-" + item.status'>
            <span
              :class='"cos-orgnews-widget-grid-item-status-circle cos-orgnews-widget-grid-item-status-circle-" + item.status'></span>
            <span class="cos-orgnews-widget-grid-item-status-text">
              {{ t('userdashboard.widgets.orgnews.status.' + item.status) }}
            </span>
          </div>
          <span class="cos-orgnews-widget-grid-item-status-modified">
            {{ t('userdashboard.widgets.orgnews.lastModified') + ': ' + formatDate(item.modified) }}
          </span>
        </div>
        <div class="cos-orgnews-widget-grid-item-format-container">
          <span v-for="(format, key) in item.distributions" :key="key" class="cos-orgnews-widget-grid-item-format">
            {{ format }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.cos-orgnews-widget-container {
  display: flex;
  flex-direction: column;
  flex: 1 1 512px;
  padding: 24px 32px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  gap: 24px;
  overflow: auto;
}

.cos-orgnews-widget-title-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.cos-orgnews-widget-title {
  font-family: var(--font-family), sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 20px;
  text-align: left;
}

.cos-orgnews-widget-more-button {
  height: 24px;
  width: auto;
}

.cos-orgnews-widget-grid-container {
  display: grid;
  flex: 1 1 100%;

  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 36px;
  gap: 29px 65px;

  overflow: auto;
}

.cos-orgnews-widget-grid-header {
  font-family: var(--font-family), sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  text-align: left;
}

.cos-orgnews-widget-grid-item-name {
  font-family: var(--font-family), sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 26px;
  text-align: left;
  color: #1a2025;
}

.cos-orgnews-widget-grid-item-status-container {

}

.cos-orgnews-widget-grid-item-status {
  display: flex;
  width: fit-content;
  padding: 4px 8px 4px 8px;
  gap: 8px;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  align-items: center;
}

.cos-orgnews-widget-grid-item-status-public {
  background: #A3EED6;
  color: #10805B;
}

.cos-orgnews-widget-grid-item-status-draft {
  color: #A38227;
  background: #FACA4A;
}

.cos-orgnews-widget-grid-item-status-circle {
  width: 7.5px;
  height: 7.5px;
  border-radius: 50%;
}

.cos-orgnews-widget-grid-item-status-circle-public {
  background: #10805B;
}

.cos-orgnews-widget-grid-item-status-circle-draft {
  background: #997515;
}

.cos-orgnews-widget-grid-item-status-text {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.cos-orgnews-widget-grid-item-status-modified {
  font-family: var(--font-family), sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  text-align: left;
  color: #667F93;
}

.cos-orgnews-widget-grid-item-format-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
}

.cos-orgnews-widget-grid-item-format {
  width: fit-content;
  height: fit-content;
  padding: 4px;
  background: var(--color-bg-darker);
  border: 1px solid var(--color-border);
  border-radius: 8px;

  font-family: var(--font-family), sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #33404A;
}

</style>
