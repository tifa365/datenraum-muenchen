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
    <CIVAppSidebar class="desktop-sidebar" />
    <CIVAppHeader
      @toggle-sidebar="toggleSidebar"
      :is-sidebar-visible="isSidebarVisible" />
    <div class="content">
      <slot />
    </div>
    <div
      v-if="isSidebarVisible"
      class="mobile-sidebar-overlay">
      <CIVMobileAppSidebar @close="toggleSidebar"></CIVMobileAppSidebar>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import CIVMobileAppSidebar from './CIVMobileAppSidebar.vue'
import CIVAppHeader from './CIVAppHeader.vue'
import CIVAppSidebar from './CIVAppSidebar.vue'

const isSidebarVisible = ref(false)
const route = useRoute()

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value
  toggleBodyScroll(isSidebarVisible.value)
}
const toggleBodyScroll = (isVisible) => {
  document.body.style.overflow = isVisible ? 'hidden' : ''
}
const focusMainContent = () => {
  window.location.hash = 'app-content'
  document.getElementById('app-content')?.focus()
}
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
  color: var(--color-primary-700);
  padding: 8px 12px;
  border-radius: 4px;
}

.skip-link:focus {
  transform: translateY(0);
}

.mobile-sidebar-overlay {
  display: none;
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

@media (max-width: 1032px) {
  .mobile-sidebar-overlay {
    display: flex;
  }
  .desktop-sidebar {
    display: none;
  }
}
</style>
