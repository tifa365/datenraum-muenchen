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

<script setup>
import COSViewHeaderBackButtonPanel from '@/components/city-os/COSViewHeaderBackButtonPanel.vue'
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDataAnalyticsWidgets } from '@/composables/useDataAnalyticsWidgets'

const route = useRoute()
const analyticsAppsLinks = useDataAnalyticsWidgets()

const appLink = computed(() => {
  return analyticsAppsLinks?.value?.find(app => app.appId === route.params.id)?.link ?? ''
})

onMounted(() => {
  const dashboardElement = document.getElementById('dashboard-element')

  const iframe = document.createElement('iframe')
  iframe.src = appLink.value
  iframe.width = '100%'
  iframe.height = '100%'
  iframe.style.border = 'none'

  dashboardElement.appendChild(iframe)
  document.getElementById('dashboard-element').children[0].width = '100%'
  document.getElementById('dashboard-element').children[0].height = '100%'
})
</script>

<template>
  <main>
    <COSViewHeaderBackButtonPanel :context-text="$t('navigation.apps-context')"></COSViewHeaderBackButtonPanel>
    <div id="dashboard-element"></div>
  </main>
</template>

<style scoped>
main {
  height: 100%;
}

#dashboard-element {
  width: 100%;
  height: 100%;
}
</style>
