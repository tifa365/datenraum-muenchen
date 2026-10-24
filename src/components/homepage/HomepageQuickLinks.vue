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
  <div class="quick-links" v-if="quickLinks.length">
    <HomepageQuickLinkTile
      v-for="quickLink in quickLinks"
      :key="quickLink.title"
      :title="t(quickLink.title)"
      :subtitle="t(quickLink.subtitle)"
      :route="quickLink.route"
      :icon-url="quickLink.icon"
      :target="quickLink.target"
    />
  </div>
</template>

<script setup lang="ts">
import HomepageQuickLinkTile from '@/components/homepage/HomepageQuickLinkTile.vue'
import { useI18n } from 'vue-i18n'
import appConfig from '@config/appConfig'

const { t } = useI18n()

enum QuickLinkTarget {
  self = '_self',
  blank = '_blank'
}

interface HomeQuickLink {
  title: string,
  subtitle: string,
  route: string,
  target: QuickLinkTarget,
  icon: string,
  available: string
}

const quickLinks: HomeQuickLink[] = Object.entries(appConfig.homeQuickLinks)
  .filter(entry => (entry[1] as HomeQuickLink).available === 'true')
  .map(entry => entry[1] as HomeQuickLink)

</script>

<style scoped>
.quick-links {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 32px;
  width: 100%;
  align-items: center;
  margin-top: -1.5rem;
  padding: 0 2rem;
}

@media (max-width: 768px) {
  .quick-links {
    margin-top: -1rem;
  }
}

@media (max-width: 1032px) {
  .quick-links {
    margin-top: -1rem;
  }
}
</style>
