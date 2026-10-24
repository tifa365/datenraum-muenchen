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
import {computed, onMounted, watch} from 'vue'
import {useQuery} from "@tanstack/vue-query";
import SupersetService from "@/services/superset.ts";

const props = defineProps({
  dashboardId: {
    type: String,
    required: true
  }
})

const dashboardsQuery = useQuery({
  queryKey: ['DashboardId', props.dashboardId],
  queryFn: async () => {
    if (props.dashboardId) {
      return SupersetService.fetchDashboardEmbeddingConfiguration(props.dashboardId);
    }
    throw new Error('dashboardId is required');
  }
});

const embeddableDashboardId = computed(() => {
  if (dashboardsQuery.isSuccess.value && dashboardsQuery.data.value) {
    return dashboardsQuery.data.value
  }
  return null
})

function embedDashboard() {
  const dashboardMountPoint = document.getElementById('dashboard-element')
  SupersetService.embedDashboardByEmbeddableDashboardId(
    embeddableDashboardId.value,
    dashboardMountPoint,
    { hideTitle: false, filters: { expanded: false }}
  )
  dashboardMountPoint.children[0].width = '100%';
  dashboardMountPoint.children[0].height = '100%';
}

onMounted(() => {
  if (embeddableDashboardId.value)
    embedDashboard()
  else {
    watch(embeddableDashboardId, () => {
      if (embeddableDashboardId.value) {
        embedDashboard()
      }
    })
  }
})

</script>

<template>
  <main class="dashboard-container">
    <div id="dashboard-element"></div>
  </main>
</template>

<style scoped>
.dashboard-container {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 10px;
  width: 100%;
}

#dashboard-element {
  min-height: 400px;
  height: calc(100%);
}
</style>
