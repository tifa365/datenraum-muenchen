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
  <main class="civ-iframe-view view-header-background"
    :class="{ 'civ-iframe-view--maximized': maximize }"
    :style="computedStyle"
  >
    <CIVTransparentCard 
      ref="iframeContainer"
      class="civ-iframe-view-iframe-container header-container"
      :class="{ 'header-container-fullscreen': overlayOpen }"
    >
      <div class="civ-iframe-view-content-container"
        :class="{ 'iframe-block-fullscreen': overlayOpen }"
      >
        <div v-if="(props.titleKey && te(props.titleKey)) || showFullscreenButton"
          class="civ-iframe-title-container"
        >
          <h1 v-if="props.titleKey && te(props.titleKey)"
            class="civ-iframe-title headline-md">
            {{ t(props.titleKey) }}
          </h1>
          <CIVButton
            v-if="showFullscreenButton"
            class="fs-button"
            type="icon"
            size="icon-square"
            :label="overlayOpen ? t('views.civ-iframe-view.closeFullscreen') : t('views.civ-iframe-view.openFullscreen')"
            :iconPrefix="fullscreenButtonIcon"
            :hide-label="true"
            @click="overlayOpen = !overlayOpen"
          />
        </div>
        <p v-if="props.subtitleKey && te(props.subtitleKey)"
          class="civ-iframe-subtitle body-lg">
          {{ t(props.subtitleKey) }}
        </p>

        <iframe ref="iframeRef"
          class="civ-iframe-view-iframe"
          :src="iframeUrl"
          allow="clipboard-read; clipboard-write; geolocation">
        </iframe>

        <button 
          v-if="overlayOpen"
          class="sr-only"
          :aria-label="overlayOpen ? t('views.civ-iframe-view.closeFullscreen') : t('views.civ-iframe-view.openFullscreen')"
          @click="overlayOpen = !overlayOpen">
          <!-- element required to facilitate focus trap inside the iframe -->
        </button>

        <CIVMarkdown
          v-if="props.footerKey && te(props.footerKey)"
          class="civ-iframe-footer body-lg"
          :content="t(props.footerKey)"
        />
      </div>
    </CIVTransparentCard>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, useTemplateRef, watch, nextTick } from 'vue'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'
import { useI18n } from 'vue-i18n'
import appConfig from '@config/appConfig'
import { useAuthStore } from '@/stores/authStore'
import { usePluginIntegration } from '@/composables/usePluginIntegration'
import CIVMarkdown from '@/components/civora-ui/CIVMarkdown.vue'
import CIVTransparentCard from '@/components/civora-ui/CIVTransparentCard.vue'
import CIVButton from '@/components/civora-ui/CIVButton.vue'

const props = defineProps<{
  /**
   * translation key for the title of the iframe view
   */
  titleKey?: string

  /**
   * translation key for the subtitle of the iframe view
   */
  subtitleKey?: string

  /**
   * translation key for the footer content of the iframe view
   * This content is markdown enabled and will be sanitized before rendering
   */
  footerKey?: string

  /**
   * URL of the iframe to be displayed in the view
   */
  url: string

  /**
   * Optional authenticated URL of the iframe to be displayed in the view
   * This URL will be used if the user is authenticated
   * and the authenticatedUrl prop is provided
   * If the user is not authenticated, the url prop will be used
   */
  authenticatedUrl?: string

  /**
   * If true, the fullscreen button will be displayed
   */
  showFullscreenButton?: boolean

  /**
   * If true, the iframe will be maximized
   */
  maximize?: boolean

  /**
   * If true, enable plugin integration
   */
  isPluginEnabled?: boolean
}>()

const { t, te } = useI18n()
const authStore = useAuthStore()

const iframeContainer = useTemplateRef('iframeContainer')
const { activate, deactivate } = useFocusTrap(iframeContainer)

const iframeRef = useTemplateRef('iframeRef')

const overlayOpen = ref(false)

const backgroundImageUrl = `config/${appConfig.customer.name}/assets/images/${appConfig.components.headerImageFileName}`

const computedStyle = computed(() => ({ 'background-image': `url(${backgroundImageUrl})` }))

const fullscreenButtonIcon = computed(() => overlayOpen.value
  ? '/src/assets/icons/Close.svg'
  : '/src/assets/icons/Fullscreen.svg'
)

const iframeUrl = computed(() => props.authenticatedUrl && authStore.authenticated
  ? props.authenticatedUrl
  : props.url
)

if (props.isPluginEnabled) {
  const { active, allowedOrigin } = usePluginIntegration(iframeRef)
}

watch(overlayOpen, async (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
    await nextTick()
    activate()
  } else {
    document.body.style.overflow = ''
    await nextTick()
    deactivate()
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  deactivate()
})
</script>

<style scoped>
.civ-iframe-view {
  height: 100%;
}

.civ-iframe-view-iframe-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 1.5rem;
}

.civ-iframe-view-iframe {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.civ-iframe-view-content-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  gap: 16px;
}

.civ-iframe-title-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.civ-iframe-title {
  color: var(--hero-card-header-text-primary-color);
}

.civ-iframe-subtitle {
  color: var(--hero-card-header-text-secondary-color);
}

.civ-iframe-footer {
  color: var(--color-text-light)
}

.fs-button {
  margin-left: auto;
  align-self: end;
}

.header-container-fullscreen {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0;
  border-radius: 0;
  z-index: 2147483650;
  background: rgba(0, 45, 61, 0.56);
}

.header-container-fullscreen.civ-iframe-view-iframe-container::before {
  border-radius: 0;
  background: 0;
  padding: 0;
  mask: 0;
}

.header-container-fullscreen .civ-iframe-title,
.header-container-fullscreen .civ-iframe-subtitle {
/* .header-container-fullscreen .civ-iframe-footer { */
  display: none;
}

.iframe-block-fullscreen{
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  overflow: auto;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  background-color: var(--color-neutral-100);
}

.civ-iframe-view--maximized .civ-iframe-view-iframe-container {
  padding: 0;
  border-radius: 0;
}

.civ-iframe-view--maximized .civ-iframe-view-iframe-container::before {
  content: none;
}

.civ-iframe-view--maximized .civ-iframe-view-iframe {
  border-radius: 0;
}

.civ-iframe-view--maximized .civ-iframe-title-container {
  padding-top: 1.5rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.civ-iframe-view--maximized .header-container-fullscreen .civ-iframe-title-container {
  padding-top: 0;
  padding-left: 0;
  padding-right: 0;
}

.civ-iframe-view--maximized .civ-iframe-subtitle {
  padding-left: 1.5rem;
}

.civ-iframe-view--maximized .civ-iframe-footer {
  padding-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.sr-only {
  position:    absolute !important;
  overflow:    hidden   !important;
  white-space: nowrap   !important;
  width:   1px !important;
  height:  1px !important;
  margin: -1px !important;
  padding: 0   !important;
  border:  0   !important;
  clip: rect(1px 1px 1px 1px) !important;
  -webkit-clip-path: inset(50%) !important;
  clip-path: inset(50%) !important;
}

@media (min-width: 1024px) {
  .civ-iframe-view {
    padding: 1.5rem;
  }

  .header-container-fullscreen {
    padding: 1rem;
  }

  .civ-iframe-view--maximized.civ-iframe-view {
    padding: 0;
  }
}
</style>
