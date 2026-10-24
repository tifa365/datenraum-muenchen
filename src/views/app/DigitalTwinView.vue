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
    <div class="digital-twin view-header-background" :style="{
      'background-image': 'url(' + backgroundImageUrl + ')',
    }">
      <CIVTransparentCard :class="[overlayOpen ? 'header-container-fullscreen' : 'header-container']">
        <Typography v-if="te('digital-twin.title')" variant="header-2" :text="$t('digital-twin.title')"
          class="digital-twin-header-text" />
        <Typography v-if="te('digital-twin.subtitle')" variant="paragraph-2" :text="$t('digital-twin.subtitle')"
          class="digital-twin-header-subtext" />
        <RouterLink v-if="te('digital-twin.seeTutorial')" to="/" class="header-container-action">
          <p class="label-lg"> {{ $t('digital-twin.seeTutorial') }} </p>
          <div class="header-container-action-icon"></div>
        </RouterLink>
        <div :class="[overlayOpen ? 'iframe-block-fullscreen' : 'iframe-block']">
          <button class="fs-button" @click="overlayOpen = !overlayOpen">
            <img  v-if="!overlayOpen" class="fullscreen" src="../../assets/icons/Fullscreen.svg" alt="Fullscreen Icon" />
            <img v-else class="fullscreen" src="../../assets/icons/Close.svg" alt="Fullscreen Icon" />
          </button>
          <iframe ref="digitalTwinIframe" class="digital-twin-iframe" :src="digitalTwinUrl"></iframe>
        </div>
        <div class="digitalTwin-footer" v-if="te('digital-twin.footer')">
          <CIVMarkdown :content="$t('digital-twin.footer')" />
        </div>
      </CIVTransparentCard>
    </div>
  </main>
</template>

<script setup>
import appConfig from '@config/appConfig'
import { useAuthStore } from '@/stores/authStore'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Typography from '@/projects/kdw/components/base/typography/Typography.vue'
import { useI18n } from 'vue-i18n'
import CIVMarkdown from '@/components/civora-ui/CIVMarkdown.vue'
import CIVTransparentCard from '@/components/civora-ui/CIVTransparentCard.vue'

const overlayOpen = ref(false)
const { te } = useI18n()

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
const authStore = useAuthStore()
const digitalTwinUrl = computed(() => {
  if (appConfig.digitalTwinUrlAuthenticated && authStore.authenticated) {
    return appConfig.digitalTwinUrlAuthenticated
  }
  return appConfig.digitalTwinUrl
})
const backgroundImageUrl = `config/${appConfig.customer.name}/assets/images/${appConfig.components.headerImageFileName}`
</script>

<style scoped>
main {
  height: 100%;
}

.fs-button {
  margin-bottom: 10px;
  align-self: end;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 4px;
  background-color: white;
}

.fs-button:hover {
  background-color: #f4f6f9;
}

.fs-button .fullscreen {
  width: 32px;
  height: 32px;
}

.digital-twin-iframe {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.iframe-block {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: column;
  padding: 32px 24px;
  width: 100%;
  height: 100%;
  gap: 32px;
}

.header-container-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2147483650;
  padding: 1rem;
  background: rgba(0, 45, 61, 0.56);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-container-fullscreen .digital-twin-header-text,
.header-container-fullscreen .digital-twin-header-subtext,
.header-container-fullscreen .header-container-action,
.header-container-fullscreen .header-container-action-icon {
  display: none;
}

.iframe-block-fullscreen{
  display: flex;
  flex-direction: column;
  background-color: var(--color-neutral-100);
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 1.5rem;
}

.digital-twin-header-text {
  color: var(--hero-card-header-text-primary-color);
  max-width: 550px;
}

.digital-twin-header-subtext {
  color: var(--hero-card-header-text-secondary-color);
}

.header-container-action {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--hero-card-header-text-secondary-color);
  margin-top: 16px;
}

.header-container-action-icon {
  width: 24px;
  aspect-ratio: 1/1;
  mask: url(../../../../src/assets/icons/ArrowRight.svg);
  mask-size: contain;
  mask-repeat: no-repeat;
  padding-right: 15px;
  background-color: var(--hero-card-header-text-secondary-color);
}

@media (max-width: 1033px) {

  .digital-twin,
  .header-container {
    height: 100%;
  }

  .header-container-fullscreen {
    padding: 0.5rem;
  }

  .iframe-block-fullscreen {
    padding: 0.5rem;
  }
}

@media (min-width: 1033px) {
  .digital-twin {
    width: calc(100dvw - 73px);
    height: 100%;
    padding: 1.5rem;
  }
}
</style>
