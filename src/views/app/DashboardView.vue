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
import { computed, watch, ref, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery } from "@tanstack/vue-query"
import { useI18n } from 'vue-i18n'
import appConfig from '@config/appConfig'
import SupersetService, { type SupersetError } from "@/services/superset"
import COSViewHeaderBackButtonPanel from '@/components/city-os/COSViewHeaderBackButtonPanel.vue'
import CIVButton from '@/components/civora-ui/CIVButton.vue'
import HeaderIconDropdown from '@/components/navigation/header/HeaderIconDropdown.vue'
import CIVMaskedIcon from '@/components/civora-ui/CIVMaskedIcon.vue'

const { t } = useI18n()
const route = useRoute()
const dashboardId = computed(() => {
  if (route.params.dashboardId) {
    if (route.params.dashboardId instanceof Array && route.params.dashboardId.length > 0) {
      return route.params.dashboardId[0]
    }
    return route.params.dashboardId as string
  }
  return ''
})
const overlayOpen = ref(false)
const isFullScreenEnabled = appConfig.customer.modules.dashboards.isFullScreenEnabled === 'true'
const dashboardElement = useTemplateRef('dashboard-element-ref')

const dashboardsQuery = useQuery({
  queryKey: ['DashboardId', dashboardId],
  refetchOnWindowFocus: false,
  enabled: !!dashboardId.value,
  retry: 5,
  queryFn: async () => {
    return await SupersetService.fetchDashboardEmbeddingConfiguration(dashboardId.value)
  }
});

const isError = computed(() => !dashboardsQuery.isLoading.value && dashboardsQuery.isError.value)
const isLoading = computed(() => dashboardsQuery.isLoading.value && !dashboardsQuery.isError.value)

const errorMessage = computed(() => {
  if (isError.value && dashboardsQuery.error.value) {
    const error = dashboardsQuery.error.value as SupersetError
    switch (error?.status) {
      case 400:
        return 'dashboard.embedding-bad-request'
      case 401:
        return 'dashboard.embedding-unauthorized'
      case 403:
        return 'dashboard.embedding-forbidden'
      case 404:
        return 'dashboard.embedding-not-found'
      case 500:
        return 'dashboard.embedding-internal-error'
      default:
        return 'dashboard.embedding-unknown-error'
    }
  }
  return 'dashboard.embedding-unknown-error'
})

const embeddableDashboardId = computed(() => {
  if (dashboardsQuery.isSuccess.value && dashboardsQuery.data.value) {
    return dashboardsQuery.data.value
  }
  return null
})

function embedDashboard() {
  if (!dashboardElement.value) {
    return
  }
  SupersetService.embedDashboardByEmbeddableDashboardId(
    embeddableDashboardId.value,
    dashboardElement.value
  )
}

watch([embeddableDashboardId, dashboardElement], async () => {
  if (embeddableDashboardId.value && dashboardElement.value) {
    embedDashboard()
  }
}, { immediate: true, flush: 'post' })

const isDownloadingImage = ref(false)
const isExportingPdf = ref(false)
const isDownloadMenuOpen = ref(false)

const onEmbed = () => {}
const exportPdf = async () => {
    isExportingPdf.value = true
    try {
        const blob = await SupersetService.downloadDashboardScreenshot(dashboardId.value, 'pdf')
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `dashboard-${dashboardId.value}.pdf`
        a.click()
        URL.revokeObjectURL(url)
    } catch (error) {
        console.error(`Error exporting dashboard ${dashboardId.value} as PDF:`, error)
        // TODO replace with toast notification
        alert(`${t('dashboard.export-failed')}`)
    } finally {
        isExportingPdf.value = false
    }
}
const downloadImage = async () => {
    isDownloadingImage.value = true
    try {
        const blob = await SupersetService.downloadDashboardScreenshot(dashboardId.value)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `dashboard-${dashboardId.value}.png`
        a.click()
        URL.revokeObjectURL(url)
    } catch (error) {
        console.error(`Error downloading dashboard ${dashboardId.value} image:`, error)
        // TODO replace with toast notification
        alert(`${t('dashboard.export-failed')}`)
    } finally {
        isDownloadingImage.value = false
    }
}
const onShare = () => {}

</script>

<template>
  <main>
    <COSViewHeaderBackButtonPanel :context-text="t('navigation.dashboards-context')">
      <div class="header-actions">
        <CIVButton v-if="false" :label="t('dashboards.embed')" size="large" @click="onEmbed" />
        <div class="dropdown-anchor">
        <HeaderIconDropdown icon="ThreeDotsVerticalGrey.svg" :align-to-right="true" :alt="t('dashboards.download')">
          <template #dropdown-content>
            <div class="action-item--has-sub" @click.stop>
              <button
                type="button"
                class="action-item body-lg"
                :class="{ open: isDownloadMenuOpen }"
                aria-haspopup="menu"
                :aria-expanded="isDownloadMenuOpen"
                @click.stop="isDownloadMenuOpen = !isDownloadMenuOpen"
              >
                <span>{{ t('dashboards.download') }}</span>
                <CIVMaskedIcon svgIcon="/src/assets/icons/ChevronRight.svg" class="action-chevron" />
              </button>
              <div
                class="submenu"
                :class="{ open: isDownloadMenuOpen }"
                role="menu"
                :aria-label="t('dashboards.download')"
              >
                <button
                  type="button"
                  role="menuitem"
                  class="submenu-item body-lg"
                  :disabled="isExportingPdf"
                  :aria-busy="isExportingPdf"
                  @click.stop="exportPdf"
                >
                  <span class="submenu-item-icon" :class="{ spinner: isExportingPdf }" aria-hidden="true" />
                  {{ t('dashboards.export-pdf') }}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  class="submenu-item body-lg"
                  :disabled="isDownloadingImage"
                  :aria-busy="isDownloadingImage"
                  @click.stop="downloadImage"
                >
                  <span class="submenu-item-icon" :class="{ spinner: isDownloadingImage }" aria-hidden="true" />
                  {{ t('dashboards.download-image') }}
                </button>
              </div>
            </div>
            <button v-if="false" type="button" class="action-item body-lg" @click="onShare">
              <span>{{ t('dashboards.share') }}</span>
              <CIVMaskedIcon svgIcon="/src/assets/icons/ChevronRight.svg" class="action-chevron" />
            </button>
          </template>
        </HeaderIconDropdown>
        </div>
      </div>
    </COSViewHeaderBackButtonPanel>
    <button v-if="isFullScreenEnabled" class="fs-button" :class="{ 'close-button': overlayOpen }" @click="overlayOpen = !overlayOpen">
      <img v-if="!overlayOpen" class="fullscreen" :src="'/src/assets/icons/Fullscreen.svg'" :alt="t('common.maximize')" />
      <img v-else class="fullscreen" :src="'/src/assets/icons/Close.svg'" :alt="t('common.minimize')" />
    </button>
    <div id="dashboard-view-dashboard-element" ref="dashboard-element-ref"
      :class="{
        'iframe-block-fullscreen': overlayOpen && isFullScreenEnabled,
        'message-container': isLoading || isError
      }"
    >
      <div v-if="isLoading" class="loading-container body-lg">
        <span class="spinner body-lg"></span>
        <span class="body-lg">{{ t('dashboard.loading') }}</span>
      </div>
      <span v-if="isError" class="body-lg">{{ t(errorMessage) }}</span>
    </div>
  </main>
</template>

<style>
#dashboard-view-dashboard-element iframe {
  display: block;
  width: 100%;
  height: 100%;
}
</style>

<style scoped>
main {
  position: relative;
  height: 100%;
}

.message-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  padding: 32px;
  color: var(--color-text-regular);
}

.loading-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem;
}

.header-actions :deep(.button) {
  height: 48px;
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 8px;
  height: 32px;
  width: 100%;
  border: none;
  border-radius: 4px;
  background: none;
  cursor: pointer;
  color: var(--color-text-regular);
  font: inherit;
  text-align: left;
  box-sizing: border-box;
}

.action-item:hover {
  background: var(--color-bg-white-hover);
}

.action-item:focus-visible,
.submenu-item:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: -2px;
}

.action-item.open .action-chevron {
  transform: rotate(90deg);
}

.action-item--has-sub {
  position: relative;
}

.dropdown-anchor {
  position: relative;
}

.dropdown-anchor :deep(.header-icon-container) {
  width: 48px;
  height: 48px;
  cursor: pointer;
}

.dropdown-anchor :deep(.header-icon-dropdown) {
  min-width: 241px;
  padding: 8px;
  gap: 8px;
  margin-top: 12px;
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.06), 0px 24px 60px rgba(0, 0, 0, 0.12);
}

.action-chevron {
  flex-shrink: 0;
  background-color: var(--color-primary-500);
}

.submenu {
  position: absolute;
  right: calc(100% + 16px);
  top: 8px;
  display: none;
  flex-direction: column;
  gap: 8px;
  background: var(--color-bg-white);
  border: 1px solid var(--color-divider);
  border-radius: 8px;
  padding: 8px;
  min-width: 241px;
  z-index: 1200;
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.06), 0px 24px 60px rgba(0, 0, 0, 0.12);
}

.submenu::after {
  content: '';
  position: absolute;
  top: -8px;
  left: 100%;
  width: 16px;
  height: calc(100% + 16px);
}

.submenu.open {
  display: flex;
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  height: 32px;
  width: 100%;
  border: none;
  border-radius: 4px;
  background: none;
  box-sizing: border-box;
  color: var(--color-text-regular);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.submenu-item:hover {
  background: var(--color-bg-white-hover);
}

.submenu-item:disabled {
  opacity: 0.5;
  cursor: wait;
}

.submenu-item-icon {
  display: none;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.submenu-item-icon.spinner {
  display: inline-block;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary-500);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.message-container .spinner {
  width: 36px;
  height: 36px;
  display: inline-block;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary-500);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fs-button {
  position: absolute;
  margin-bottom: 10px;
  align-self: end;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 4px;
  background-color: var(--color-bg-white);
  top: 75px;
  right: 20px;
  z-index: 1000;
}

.fs-button:hover {
  background-color: var(--color-bg-white-hover);
}

.fs-button .fullscreen {
  width: 32px;
  height: 32px;
}

.close-button {
  position: fixed;
  top: 15px;
  right: 30px;
}

#dashboard-view-dashboard-element {
  width: 100%;
  height: calc(100% - 64px);
}

.iframe-block-fullscreen {
  position: fixed;
  inset: 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: var(--color-bg-white);
  margin: 0 !important;
  padding: 0;
  height: 100% !important;
}

@media (max-width: 1033px) {
  .fs-button {
    top: 52px;
  }

  .close-button {
    top: 5px;
  }
}

/* On narrow screens the fly-out submenu would render off-screen,
   so stack it below the download item instead. */
@media (max-width: 768px) {
  .submenu {
    position: static;
    right: auto;
    top: auto;
    margin-top: 8px;
    min-width: 0;
    border: none;
    padding: 0 0 0 8px;
    box-shadow: none;
  }

  .submenu::after {
    content: none;
  }
}
</style>
