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
      :title="$t('views.app.DKSRAppsView.title')"
      :description="$t('views.app.DKSRAppsView.subtitle')">
    </CIVViewHeader>
    <div class="tiles">
      <DKSRAppTile
        v-for="(app, index) in dksrAnalyticsApps"
        :key="index"
        :imagePath="app.imagePath"
        :title="$t(`views.app.DKSRAppsView.apps.${app.translation}.title`)"
        :content="$t(`views.app.DKSRAppsView.apps.${app.translation}.content`)"
        :provider="app.provider"
        :categories="app.categories.map((cat) => $t(`views.app.DKSRAppsView.categories.${cat}`))"
        :app-link="app.appId" />
    </div>
  </main>
</template>

<script setup lang="ts">
import CIVViewHeader from '@/components/civora-ui/CIVViewHeader.vue'
import DKSRAppTile from '@/components/dksr-apps/DKSRAppTile.vue'
import { useDataAnalyticsWidgets } from '@/composables/useDataAnalyticsWidgets';

const dksrAnalyticsApps = useDataAnalyticsWidgets()
</script>

<style scoped>
.tiles {
  padding: 1.25rem;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: start;
  gap: 1.25rem;
}

@media (max-width: 1032px) {
  .tiles {
    justify-content: center;
  }
}

@media (min-width: 1024px) {
}
</style>
