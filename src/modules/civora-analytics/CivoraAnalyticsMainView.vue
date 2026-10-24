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
      :title="t('views.app.analytics.title')"
      :description="t('views.app.analytics.subtitle')">
    </CIVViewHeader>
    <div class="tabs">
      <template v-for="tab in availableTabs" :key="tab.id">
        <a v-if="tab.link" :href="tab.link" class="tab-item">
          <div class="tab-item-icon">
            <img :src="tab.icon" alt="tab-icon" />
          </div>
          <div class="tab-item-title-text headline-md">
            {{ tab.title }}
          </div>
          <div class="tab-item-description body-lg">
            {{ tab.description }}
          </div>
        </a>
        <RouterLink v-else class="tab-item" :to="tab.route">
          <div class="tab-item-icon">
            <img :src="tab.icon" alt="tab-icon" />
          </div>
          <div class="tab-item-title-text headline-md">
            {{ tab.title }}
          </div>
          <div class="tab-item-description body-lg">
            {{ tab.description }}
          </div>
        </RouterLink>
      </template>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import appConfig from '@config/appConfig'
import { useAdminCards } from '@/composables/useAdminCards'
import { useSidebarModules } from '@/composables/useSidebarModules'
import CIVViewHeader from '@/components/civora-ui/CIVViewHeader.vue'

const { t } = useI18n()
const { orderedModules } = useSidebarModules(t, 'desktop')
const adminCards = useAdminCards()
const analyticsModule = computed(() => orderedModules?.value?.find(module => module.name === 'analytics'))
const dksrAppsModule = computed(() => orderedModules?.value?.find(module => module.name === 'dksrApps'))
const pipelineCard = computed(() => adminCards.value?.find(card => card.key === '/Airflow'))

const tabs = computed(() => [
  {
    id: 'apps',
    title: t('views.app.analytics.dksrApps.title'),
    description: t('views.app.analytics.dksrApps.description'),
    icon: 'src/assets/icons/Apps.svg',
    route: dksrAppsModule?.value?.route,
    available: dksrAppsModule?.value?.available,
  },
  {
    id: 'pipelines',
    title: t('views.app.analytics.pipelines.title'),
    description: t('views.app.analytics.pipelines.description'),
    icon: 'src/assets/icons/pipelines.svg',
    link: pipelineCard?.value?.link,
    available: !!pipelineCard?.value
  },
  {
    id: 'models',
    title: t('views.app.analytics.models.title'),
    description: t('views.app.analytics.models.description'),
    icon: 'src/assets/icons/models.svg',
    route: analyticsModule?.value?.route + '/models',
    available: appConfig?.modelCoordinatorUrl,
  }
])
const availableTabs = computed(() => tabs?.value?.filter(tab => tab.available) ?? [])
</script>

<style scoped>
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  padding: 2rem;
}

.tab-item {
  max-width: 512px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  border-radius: 0.5rem;
  background-color: var(--color-bg-darker);
  cursor: pointer;
  border-radius: 8px;
  background: var(--Neutrals-bg-white, #FFF);
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.04), 0 4px 10px 0 rgba(0, 0, 0, 0.08);
}

.tab-item-icon {
  width: 2rem;
  height: 2rem;
}

.tab-item-title-text {
  color: var(--color-text-regular);
}

.tab-item-description {
  color: var(--color-text-light)
}
</style>

