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
import { useQuery } from '@tanstack/vue-query'
import { useI18n } from 'vue-i18n'
import appConfig from '@config/appConfig'
import OrganisationCard from '@/components/organisation-sites/OrganisationCard.vue'
import CIVViewHeader from '@/components/civora-ui/CIVViewHeader.vue'

const { t } = useI18n()

const searchUrl = appConfig.piveauHubSearchUrl.endsWith('/')
  ? appConfig.piveauHubSearchUrl + 'search?'
  : appConfig.piveauHubSearchUrl + '/search?'

const staleTime = 2 * 60 * 1000

const catalogsQuery = useQuery({
  queryKey: ['orgsitecatalogue'],
  staleTime: staleTime,
  refetchOnWindowFocus: false,
  queryFn: async () => {
    const response = await fetch(
      searchUrl +
        new URLSearchParams({
          filter: 'catalogue',limit: '500', facets: '{"is_open_data_presence":["true"]}'
        }).toString(),
      {
        method: 'GET',
      }
    )
    if (!response.ok) {
      throw new Error(`failed to fetch data from piveau ${response.status} ${response.statusText}`)
    }
    return await response.json()
  },
})
const publishersQuery = useQuery({
  queryKey: ['publishers'],
  staleTime,
  refetchOnWindowFocus: false,
  enabled: appConfig?.customer?.modules?.organisationSites?.showPublisherList === 'true',
  queryFn: async () => {
    const response = await fetch(
      searchUrl +
        new URLSearchParams({
          filter: 'dataset',
          limit: '0',
        }).toString(),
      { method: 'GET' }
    )
    
    if (!response.ok) {
      throw new Error(`failed to fetch publishers ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    const publisherFacet = data.result?.facets?.find((f: any) => f.id === 'publisher')

    return publisherFacet?.items ?? []
  },
})

const sortedPublishers = computed(() =>
  publishersQuery?.data?.value.slice().sort((a, b) => a.title.localeCompare(b.title))
);
</script>
<template>
  <CIVViewHeader
    :title="t('organisation.title')"
    :description="t('organisation.subtitle')"
  />
  <div
    class="content"
    v-if="catalogsQuery?.isSuccess">
    <OrganisationCard
      v-for="(organisationItem, index) in catalogsQuery?.data?.value?.result.results"
      :organisation="organisationItem"
      :key="index"></OrganisationCard>
    <div v-if="appConfig?.customer?.modules?.organisationSites?.showPublisherList === 'true'" class="publisher-list-container">
      <h3 class="title title-lg">{{ t('organisation.all-data-providers') }}</h3>
      <ul class="publisher-list body-lg">
        <li v-for="(publisher, index) in sortedPublishers" :key="index" class="publisher">
          {{ publisher?.title }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.content {
  background: var(--color-bg-darker);
  width: 100%;
  padding: 32px;
  display: flex;
  flex-wrap: wrap;
}

.publisher-list-container {
  display: flex;
  background: var(--color-bg-darker);
  width: 100%;
  flex-direction: column;
  margin: 30px 15px;
  overflow: hidden;
}

.title {
  color: var(--color-primary-500);
  padding-bottom: 22px;
}

.publisher-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--color-text-regular);
}

.publisher {
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

@media (max-width: 1200px) {
  .publisher-list-container {
    margin: 30px 3.33%;
  }
}

@media (max-width: 400px) {
  .publisher-list-container {
    margin: 30px 0px;
  }
}
</style>
