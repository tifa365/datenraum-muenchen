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
  <div class="navigation-sidebar" :class="{ expanded: isSidebarExpanded }" @mouseenter="expandSidebar"
    @mouseleave="collapseSidebar">
    <nav class="sidebar" :aria-label="t('aria-labels.main-navigation')" >
      <div class="sidebar-content">
        <CIVSidebarIconButton v-for="module in orderedModules" :key="module.name" :icon="module.icon"
          :route="module.route" :title="module.title" :expanded="isSidebarExpanded" />
      </div>
      <div class="data-content">
        <CIVSidebarIconButton v-if="!authStore.authenticated && appConfig.customer.isDataNoticesDisabled === 'false'" key="data-notices" icon="src/assets/icons/ShieldLock.svg"
        route="/app/data-notices" :title="t('navigation.impressum')" :expanded="isSidebarExpanded" />
        <CIVSidebarIconButton v-if="hasAdminPage" key="admin-cockpit" :icon="adminCockpitIcon" :icon-active="adminCockpitIcon" route="/app/admin-cockpit" :title="t('navigation.adminCockpit')" :expanded="isSidebarExpanded" />
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCssVar } from '@vueuse/core'
import appConfig from '@config/appConfig'
import { useAuthStore } from '@/stores/authStore'
import { useAdminCards } from '@/composables/useAdminCards'
import { useSidebarModules } from '@/composables/useSidebarModules'
import CIVSidebarIconButton from './CIVSidebarIconButton.vue'

const authStore = useAuthStore()
const { t } = useI18n()
const isSidebarExpanded = ref(false)
const { orderedModules } = useSidebarModules(t, 'desktop')
const expandSidebar = () => {
  isSidebarExpanded.value = true
}
const collapseSidebar = () => {
  isSidebarExpanded.value = false
}

const adminCards = useAdminCards()
const hasAdminPage = computed(() =>
  appConfig.customer.modules?.adminCockpit?.available === 'true'
  && authStore.authenticated
  && adminCards.value.length > 0
)

const adminCockpitIcon = computed(() => useCssVar('--civora-admin-cockpit-icon').value || '/src/assets/icons/admin-cockpit.svg');

</script>

<style scoped>
.navigation-sidebar {
  height: 100%;
  position: fixed;
  top: 72px;
  left: 0;
  width: 72px;
  background-color: var(--color-bg-white);
  border-right: 1px solid var(--color-neutral-300);
  z-index: 990;
  transition: width 0.3s;
  overflow: hidden;
}

.navigation-sidebar.expanded {
  width: 280px;
}

.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 100px;
}

.sidebar-content,
.data-content {
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

@media (max-width: 768px) {
  .navigation-sidebar {
    display: none;
  }
}
</style>
