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
import appConfig from '@config/appConfig'
import NewsWidget from '@/components/widgets/NewsWidget.vue'
import OrganizationDatasetNewsWidget from '@/components/widgets/OrganizationDatasetNewsWidget.vue'
import SupersetDashboardWidget from '../widgets/SupersetDashboardWidget.vue'
import IframeWidget from '../widgets/IframeWidget.vue'
const props = defineProps({
  widgets: {
    type: String,
    default: '',
  },
})

const elements = computed(() => {
  return props.widgets?.split(',').map((widget) => widget?.split(' '))
})
</script>

<template>
  <div class="cos-widgets-container">
    <div v-if="elements" class="widgets">
      <template v-for="(item, index) in elements" :key="index">
        <NewsWidget v-if="item[0] === 'news'" />
        <OrganizationDatasetNewsWidget v-if="item[0] === 'orgnews' && appConfig?.customer?.modules?.dataCatalog?.available === 'true'" />
        <SupersetDashboardWidget v-if="item[0] === 'dashboard'" :dashboardId="item[1]" />
        <IframeWidget v-if="item[0] === 'iframe'" :iframeUrl="item[1]" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.cos-widgets-container {
  width: 100%;
  height: 100%;
  gap: 32px;
  padding: 24px 32px;
  background-color: var(--color-bg-darker);
}

.widgets {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  flex-wrap: wrap;
  height: 100%;
  gap: 25px;
}

@media (max-width: 987px) {
  .cos-widgets-container {
    display: flex;
    flex-direction: column;
  }
}
</style>
