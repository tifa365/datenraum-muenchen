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
import COSViewHeaderBackButtonPanel from '@/components/city-os/COSViewHeaderBackButtonPanel.vue'
import { computed, ref } from 'vue'
import CIVOrganisationDataDatasets from './CIVOrganisationDataDatasets.vue'
import CIVOrganisationDataCatalogs from './CIVOrganisationDataCatalogs.vue'
import CIVOrganisationDataHeader from './CIVOrganisationDataHeader.vue'
import CIVViewTabs from './CIVViewTabs.vue'
import appConfig from '@config/appConfig'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
type OrganizationDataTab = 'datasets' | 'catalogs'

const activeTab = ref<OrganizationDataTab>('datasets')
const isCatalogueManagementEnabled =
  appConfig.customer?.enableCatalogueManagement === true || appConfig.customer?.enableCatalogueManagement === 'true'
const tabs = computed(() => {
  const availableTabs: Array<{ id: OrganizationDataTab; label: string }> = [
    {
      id: 'datasets',
      label: t('components.organization-data.OrganizationData.datasets'),
    },
  ]

  if (isCatalogueManagementEnabled) {
    availableTabs.push({
      id: 'catalogs',
      label: t('components.organization-data.OrganizationData.catalogs'),
    })
  }

  return availableTabs
})
</script>
<template>
  <COSViewHeaderBackButtonPanel :context-text="$t('navigation.data-catalog')" />
  <CIVOrganisationDataHeader />
  <CIVViewTabs
    v-model="activeTab"
    :tabs="tabs" />
  <KeepAlive>
    <CIVOrganisationDataDatasets v-if="activeTab === 'datasets'" />
    <CIVOrganisationDataCatalogs v-else-if="activeTab === 'catalogs' && isCatalogueManagementEnabled" />
  </KeepAlive>
</template>
