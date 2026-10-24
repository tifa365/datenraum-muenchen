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
  <div class="main-container">
    <div class="start-wrapper">
      <h1 class="headline-md">{{ $t('home.organisation-data') }}</h1>
      <CIVTag :hasCloseIcon="false" :number="150" />
    </div>
    <div ref="newDataMenu" class="end-wrapper" @keydown.esc="closeMenu">
      <CIVButton
        class="new-data-button"
        size="large"
        iconPrefix="/src/assets/icons/Add.svg"
        :iconSuffix="isCatalogueManagementEnabled ? '/src/assets/icons/ChevronBottom.svg' : undefined"
        :disabled="!canCreateData"
        :aria-expanded="isCatalogueManagementEnabled ? isMenuOpen : undefined"
        :aria-haspopup="isCatalogueManagementEnabled ? 'menu' : undefined"
        :label="$t('components.organization-data.OrganizationDataHeader.new-data')"
        @click="handleNewDataClick" />
      <div v-if="isCatalogueManagementEnabled && isMenuOpen" class="moreBtnMenu" role="menu">
        <button class="new-dataset-action" type="button" role="menuitem" :disabled="!canCreateDataset" @click="createDataset">
          {{ $t('components.organization-data.OrganizationDataHeader.newDataSet') }}
        </button>
        <button class="new-catalogue-action" type="button" role="menuitem" :disabled="!canCreateCatalogue" @click="createCatalogue">
          {{ $t('components.organization-data.OrganizationDataHeader.newDataCatalog') }}
        </button>
      </div>
    </div>
  </div>
  <div class="info-container">
    <CIVInfoBanner layout="multi" :title="$t('home.organisation-data')" :text="$t('components.organization-data.OrganizationDataHeader.information')" :hasCloseButton="false"/>
  </div>
</template>

<script setup lang="ts">
import CIVTag from "./CIVTag.vue";
import CIVButton from "./CIVButton.vue";
import { useRouter } from "vue-router";
import CIVInfoBanner from "./CIVInfoBanner.vue";
import { computed, onMounted, onUnmounted, ref } from 'vue'
import appConfig from "@/../config/appConfig"
import { usePermissions } from '@/composables/useAccessPermissions'


const router = useRouter();
const { canCreateInAnyCatalog, canCreateCatalog } = usePermissions()
const isMenuOpen = ref(false)
const newDataMenu = ref<HTMLElement | null>(null)

const isCatalogueManagementEnabled = computed(
  () =>
    appConfig.customer?.enableCatalogueManagement === true ||
    appConfig.customer?.enableCatalogueManagement === 'true'
)

const canCreateDataset = computed(() => canCreateInAnyCatalog())
const canCreateCatalogue = computed(() => isCatalogueManagementEnabled.value && canCreateCatalog())
const canCreateData = computed(() => canCreateDataset.value || canCreateCatalogue.value)

const routeToDatasets = computed(() => {
  return appConfig.civoraDpiUrl ? '/civora-dpi' : '/dpi/datasets'
})

const routeToCatalogues = computed(() => {
  return appConfig.civoraDpiUrl
    ? { name: 'CivoraDPI', query: { type: 'catalogue' } }
    : '/dpi/catalogues'
})

function closeMenu() {
  isMenuOpen.value = false
}

function handleNewDataClick() {
  if (!canCreateData.value) return
  if (!isCatalogueManagementEnabled.value) {
    router.push(routeToDatasets.value)
    return
  }

  isMenuOpen.value = !isMenuOpen.value
}

function createDataset() {
  if (!canCreateDataset.value) return
  closeMenu()
  router.push(routeToDatasets.value)
}

function createCatalogue() {
  if (!canCreateCatalogue.value) return
  closeMenu()
  router.push(routeToCatalogues.value)
}

function handleOutsideClick(event: MouseEvent) {
  if (!newDataMenu.value?.contains(event.target as Node)) closeMenu()
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>

<style scoped>
.main-container {
  margin: 40px 32px 18px 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
}

.info-container {
  margin: 0 32px 18px 32px;
}

.start-wrapper,
.end-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.end-wrapper {
  position: relative;
  display: inline-block;
}

.moreBtnMenu {
  position: absolute;
  top: 60px;
  right: 0;
  display: flex;
  flex-direction: column;
  width: 228px;
  padding: 8px 0px;
  background-color: var(--color-neutral-100);
  border-radius: 8px;
  border: 1px solid var(--color-neutral-300);
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.06), 0px 24px 60px rgba(0, 0, 0, 0.12);
  z-index: 10;
}

.moreBtnMenu button {
  padding: 8px 24px;
  display: flex;
  align-items: center;
  justify-content: start;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.moreBtnMenu button:hover:not(:disabled) {
  background-color: var(--color-neutral-300);
}

.moreBtnMenu button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.note h2 {
  color: var(--color-neutral-700);
}

.note p {
  color: var(--color-primary-800);
}
</style>
