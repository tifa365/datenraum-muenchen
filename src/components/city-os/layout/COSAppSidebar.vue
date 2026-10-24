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
  <div
    class="navigation-sidebar"
    :class="{ expanded: isSidebarExpanded }"
    @mouseenter="expandSidebar"
    @mouseleave="collapseSidebar">
    <nav class="sidebar" :aria-label="t('aria-labels.main-navigation')">
      <div class="sidebar-content">
        <template v-for="module in orderedModules" :key="module.name">
          <SidebarIconButton
          v-if="!module.requiresLogin || authStore.authenticated"
          :key="module.name"
          :icon="module.icon"
          :icon-active="module.iconActive"
          :route="module.route"
          :title="module.title"
          :expanded="isSidebarExpanded" />
        </template>
      </div>
      <div class="data-content">
        <SidebarIconButton
          v-if="hasAdminPage"
          key="admin-cockpit"
          icon="src/assets/icons/admin-cockpit.svg"
          icon-active="src/assets/icons/admin-cockpit.svg"
          route="/app/admin-cockpit"
          :title="t('navigation.adminCockpit')"
          :expanded="isSidebarExpanded" />
        <SidebarIconButton
          v-if="!authStore.authenticated && appConfig.customer.isDataNoticesDisabled !== 'true'"
          key="data-notices"
          icon="src/assets/icons/ShieldLock.svg"
          icon-active="src/assets/icons/ShieldLockActive.svg"
          route="/app/data-notices"
          :title="t('navigation.impressum')"
          :expanded="isSidebarExpanded" />
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import SidebarIconButton from '@/components/navigation/sidebar/SidebarIconButton.vue'
import { useSidebarModules } from '@/composables/useSidebarModules'
import { useAdminCards } from '@/composables/useAdminCards'
import appConfig from '@config/appConfig'

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
</script>

<style scoped>
.navigation-sidebar {
  height: 100%;
  position: fixed;
  top: 72px;
  left: 0;
  width: 72px;
  background-color: white;
  border-right: 1px solid #d4dde3;
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
