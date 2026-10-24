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

<!-- @deprecated -->
<!-- use CIVIframeView instead -->
<template>
  <main>
    <div
      class="custom-iframe-wrapper view-header-background"
      :class="{ 'custom-iframe-wrapper--maximized': maximize }"
      :style="{ 'background-image': 'url(' + backgroundImageUrl + ')' }">
      <CIVTransparentCard class="iframe-container">
        <div v-if="props.iframeTitle">
          <h1 class="module-title headline-md">{{ $t(props.iframeTitle)}}</h1>
        </div>
        <iframe
          class="custom-iframe"
          :src="customIframeUrl"></iframe>
      </CIVTransparentCard>
    </div>
  </main>
</template>

<script setup>
import appConfig from '@config/appConfig'
import { ref, onMounted, onUnmounted } from 'vue'
import CIVTransparentCard from '@/components/civora-ui/CIVTransparentCard.vue'

const props = defineProps({
  config: String,
  iframeTitle : String
})

const isMobile = ref(window.innerWidth <= 480)
onMounted(() => { 
  const handleResize = () => {
    isMobile.value = window.innerWidth <= 480
  }

  window.addEventListener('resize', handleResize)
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
})


const customIframeUrl = appConfig.customer.modules[props.config || "customIframeModule"].url
const maximize = appConfig.customer.modules[props.config || "customIframeModule"].maximize === 'true'
const backgroundImageUrl = `config/${appConfig.customer.name}/assets/images/${appConfig.components.headerImageFileName}`
</script>

<style scoped>
main {
  height: 100%;
}

.custom-iframe {
  height: 100%;
  width: 100%;
  border-radius: 8px;
}

.custom-iframe-wrapper {
  height: 100%;
  width: 100%;
  padding: 0;
}

.iframe-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 1.5rem;
}

.module-title{
  color: var(--hero-card-header-text-primary-color);
}

.custom-iframe-wrapper--maximized .iframe-container {
  padding: 0;
  border-radius: 0;
}

.custom-iframe-wrapper--maximized .iframe-container::before {
  content: none;
}

.custom-iframe-wrapper--maximized .module-title {
  padding-top: 1.5rem;
  padding-left: 1.5rem;
}

.custom-iframe-wrapper--maximized .custom-iframe {
  border-radius: 0;
}

@media (min-width: 1033px) {
  .custom-iframe-wrapper {
    height: 100%;
    width: calc(100dvw - 73px);
    padding: 1.5rem;
  }

  .custom-iframe-wrapper.custom-iframe-wrapper--maximized {
    padding: 0;
  }
}
</style>
