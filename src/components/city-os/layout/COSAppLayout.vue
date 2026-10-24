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
  <div class="app-layout">
    <a class="skip-link" href="#app-content" @click.prevent="focusMainContent">
      {{ $t('aria-labels.skip-to-main-content') }}
    </a>
    <COSAppHeader
      @toggle-sidebar="toggleSidebar"
      :is-sidebar-visible="isSidebarVisible" />
    <COSAppSidebar v-if="isDesktop" />
    <div class="content">
      <slot />
    </div>
    <div
      v-if="!isDesktop && isSidebarVisible"
      class="mobile-sidebar-overlay">
      <COSMobileAppSidebar @close="toggleSidebar"></COSMobileAppSidebar>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import COSAppHeader from './COSAppHeader.vue'
import COSAppSidebar from './COSAppSidebar.vue'
import COSMobileAppSidebar from '@/components/city-os/layout/COSMobileAppSidebar.vue'

const isSidebarVisible = ref(false)
const isDesktop = ref(window.matchMedia('(min-width: 1033px)').matches)

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value
  toggleBodyScroll(isSidebarVisible.value)
}
const handleResize = () => {
  isDesktop.value = window.matchMedia('(min-width: 1033px)').matches
  if (isDesktop.value) {
    isSidebarVisible.value = false
    toggleBodyScroll(false)
  }
}
const toggleBodyScroll = (isVisible) => {
  document.body.style.overflow = isVisible ? 'hidden' : ''
}
const focusMainContent = () => {
  window.location.hash = 'app-content'
  document.getElementById('app-content')?.focus()
}

onMounted(() => {
  const mediaQuery = window.matchMedia('(min-width: 1033px)')
  mediaQuery.addEventListener('change', handleResize)
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  const mediaQuery = window.matchMedia('(min-width: 1033px)')
  mediaQuery.removeEventListener('change', handleResize)
  window.removeEventListener('resize', handleResize)
  toggleBodyScroll(false)
})

const route = useRoute()
watch(route, () => {
  isSidebarVisible.value = false
  toggleBodyScroll(false)
})
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: row;
}

.content {
  flex-grow: 1;
  margin-top: 72px;
}

.skip-link {
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: 2000;
  transform: translateY(-150%);
  background: var(--color-bg-white);
  color: var(--color-primary-500);
  padding: 8px 12px;
  border-radius: 4px;
}

.skip-link:focus {
  transform: translateY(0);
}

.mobile-sidebar-overlay {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  position: fixed;
  top: 72px;
  left: 0;
  width: 100%;
  height: calc(100% - 72px);
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 990;
  overflow-y: auto;
}

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  color: black;
  cursor: pointer;
}
</style>
