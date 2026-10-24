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
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import appConfig from '@config/appConfig'
import OrganisationSitesColleagues from './../OrganisationSitesColleagues.vue'
import OrganisationSitesDatensets from '@/components/organisation-sites/OrganisationSitesDatensets.vue'
import ImageDetailHeader from '@/components/civora-ui/layout/header/ImageDetailHeader.vue'
import COSViewHeaderBackButtonPanel from '@/components/city-os/COSViewHeaderBackButtonPanel.vue'
import { mapCatalogToOrganisation } from '../catalogToOrganisationMapper.vue'

const { t, locale } = useI18n()
const route = useRoute()

var activeTab = ref('Datensets')
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
  <ImageDetailHeader
    :backgroundImage="organisation.backgroundImage"
    :logoImage="organisation.logo"
    :categories="organisation.categories"
    :website="organisation.website"
    :title="organisation.title"
    :description="organisation.description"
    :contact="organisation.contact"
  />

  <div class="nav tab">
    <a :class="activeTab == 'Datensets' ? 'active' : ''" @click="activeTab = 'Datensets'">{{
      $t('organisation.datasets.label') }}</a>
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
  color: var(--color-button-regular);
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
  margin-right: 50px;
  color: #33404a;
}

.active {
  color: var(--color-button-regular) !important;
  border-bottom: 1px solid var(--color-button-regular);
}

@media (max-width: 768px) {
  .nav {
    overflow-x: auto;
  }
}
</style>
