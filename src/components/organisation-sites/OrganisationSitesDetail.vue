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
import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import appConfig from '@config/appConfig'
import { useRoute } from 'vue-router'
import COSViewHeaderBackButtonPanel from '@/components/city-os/COSViewHeaderBackButtonPanel.vue'
import COSViewHeaderOrganisationSites from '@/components/city-os/COSViewHeaderOrganisationSites.vue'
import OrganisationSitesColleagues from './OrganisationSitesColleagues.vue'
import OrganisationSitesDatensets from '@/components/organisation-sites/OrganisationSitesDatensets.vue'
import { mapCatalogToOrganisation } from '@/components/organisation-sites/catalogToOrganisationMapper.vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

var activeTab = ref('Datensets')
const route = useRoute()
const organisationId = route.params.organisationId || ''
const searchUrl = appConfig.piveauHubSearchUrl.endsWith('/')
  ? appConfig.piveauHubSearchUrl + 'catalogues/'
  : appConfig.piveauHubSearchUrl + '/catalogues/'
const staleTime = 2 * 60 * 1000

const catalogsQuery = useQuery({
  queryKey: ['detailofcatalogs:' + organisationId],
  staleTime: staleTime,
  refetchOnWindowFocus: false,
  queryFn: async () => {
    const response = await fetch(searchUrl + organisationId, {
      method: 'GET',
    })
    if (!response.ok) {
      throw new Error(`failed to fetch data from piveau ${response.status} ${response.statusText}`)
    }
    return await response.json()
  },
})
const organisation = computed(() => {
  if (catalogsQuery.isSuccess.value && catalogsQuery.data.value) {
    const orga = mapCatalogToOrganisation(catalogsQuery.data.value.result, locale.value)
    return orga
  }
  return {}
})
</script>
<template>
  <COSViewHeaderBackButtonPanel :context-text="$t('navigation.organisation-sites')"></COSViewHeaderBackButtonPanel>
  <COSViewHeaderOrganisationSites :organisation="organisation"></COSViewHeaderOrganisationSites>

  <div class="nav tab">
    <a
      :class="activeTab == 'Datensets' ? 'active' : ''"
      @click="activeTab = 'Datensets'"
      >{{ $t('organisation.datasets.label') }}</a
    >
    <!-- hidden until further notice, please refer to ticket https://dksr21.atlassian.net/browse/CIT-626 -->
    <!-- <a
      :class="activeTab == 'Colleagues' ? 'active' : ''"
      @click="activeTab = 'Colleagues'"
      >{{ $t('organisation.colleagues.label') }}</a
    > -->
  </div>

  <OrganisationSitesDatensets v-if="activeTab == 'Datensets'" />
  <!-- hidden until further notice, please refer to ticket https://dksr21.atlassian.net/browse/CIT-626 -->
  <!-- <OrganisationSitesColleagues v-if="activeTab == 'Colleagues'" /> -->
</template>

<style scoped>
.nav {
  font-size: 15px;
  color: var(--button-pressed, var(--color-primary-500));
  display: flex;
  padding: 20px 40px;
  font-weight: 500;
}

.content {
  background: var(--color-bg-dark);
  width: 100%;
  padding: 32px;
  display: flex;
  flex-wrap: wrap;
}

.tab {
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 10px;
  font-size: 17px;
}

.tab a {
  cursor: pointer;
}

.active {
  color: var(--color-primary-500) !important;
  border-bottom: 1px solid var(--color-primary-500);
}

.tab a {
  margin-right: 50px;
  color: #33404a;
}

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

  grid-template-columns: repeat(1, 1fr);
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
  background: #a3eed6;
  color: #10805b;
}

.cos-orgnews-widget-grid-item-status-draft {
  color: #a38227;
  background: #faca4a;
}

.cos-orgnews-widget-grid-item-status-circle {
  width: 7.5px;
  height: 7.5px;
  border-radius: 50%;
}

.cos-orgnews-widget-grid-item-status-circle-public {
  background: #10805b;
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
  color: #667f93;
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
  color: #33404a;
}

@media (max-width: 768px) {
  .nav {
    overflow-x: auto;
  }
}
</style>
