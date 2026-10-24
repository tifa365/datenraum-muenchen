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
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import appConfig from '@config/appConfig'
import KButton from '@/projects/kdw/components/base/button/KButton.vue'

const route = useRoute()
const router = useRouter()

const iframeUrl = computed(() => {
  const baseUrl = appConfig.civoraDpiUrl || 'http://localhost:5173'
  const params = new URLSearchParams()

  // Map route query parameters to iframe URL parameters
  if (route.query.type) {
    params.append('type', route.query.type as string)
  }
  if (route.query.id) {
    params.append('id', route.query.id as string)
  }
  if (route.query.catalog) {
    params.append('catalog', route.query.catalog as string)
  }

  if (route.query.fromDraft === 'true') {
    params.append('fromDraft', 'true')
  }

  const queryString = params.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
})

const handleMessage = (event: MessageEvent) => {
  if (event.data?.type === 'close-app') {
    // Navigate back to organization data page
    router.push('/app/data-catalog/organisation-data')
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<template>
  <div class="civora-dpi-wrapper">
    <div class="back-button-container">
      <RouterLink to="/app/data-catalog/organisation-data">
        <KButton class="back-button" severity="contrast" icon="icon-[ph--arrow-left]" :label="$t('dpi.back')">
        </KButton>
      </RouterLink>
    </div>
    <div class="civora-dpi-container">
      <iframe
        :src="iframeUrl"
        frameborder="0"
        class="civora-dpi-iframe"
        allowfullscreen
      ></iframe>
    </div>
  </div>
</template>

<style scoped>
.civora-dpi-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.back-button-container {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--color-bg-white);
}

.back-button {
  text-transform: none;
}

.civora-dpi-container {
  flex: 1;
  width: 100%;
  overflow: hidden;
}

.civora-dpi-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
