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
  <main>
    <CIVViewHeader
      :title="$t('views.app.analytics.models.title')"
      :description="$t('views.app.analytics.models.description')"
    />
    <CIVViewTabs
      v-model="currentTab"
      :tabs="tabs"
    />
    <CivoraAnalyticsModelsViewModelsTab
      v-if="currentTab === 'models'"
    />
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouteQuery } from '@vueuse/router'
import CIVViewHeader from '@/components/civora-ui/CIVViewHeader.vue';
import CIVViewTabs from '@/components/civora-ui/CIVViewTabs.vue';
import CivoraAnalyticsModelsViewModelsTab from './CivoraAnalyticsModelsViewModelsTab.vue';

const { t } = useI18n()

const tabs = computed(() => [
  {
    id: 'overview',
    label: t('views.app.analytics.models.tab.overview'),
    disabled: true,
  },
  {
    id: 'models',
    label: t('views.app.analytics.models.tab.models'),
    disabled: false,
  },
  {
    id: 'executions',
    label: t('views.app.analytics.models.tab.executions'),
    disabled: true,
  },
])
const currentTab = useRouteQuery('tab', 'models')

</script>

<style module>
</style>