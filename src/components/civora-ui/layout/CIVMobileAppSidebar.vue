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
  <div class="mobile-sidebar">
     <div class="mobile-sidebar-actions">
      <form class="input-form" @submit="handleSearch">
        <CIVInput class="header-input" @inputValue="search" iconPrefix="src/assets/icons/Search.svg" size="medium"
          :placeholder="$t('civora.layout.searchInput.placeholder')" />
      </form>
      <CIVLanguageSwitch />
    </div>
    <CIVDropdownMenu
      title="Plattform"
      :open="activeDropdown === 'platform'"
      @toggle="handleDropdownToggle('platform', $event)">
      <CIVSidebarIconButton
        v-for="module in orderedModules"
        :v-if="module.available"
        :key="module.name"
        :title="module.title"
        :route="module.route"
        :icon="module.iconInactive"
        expanded />
    </CIVDropdownMenu>
    <CIVDropdownMenu
      v-if="infoPages.length === 1"
      :title="$t('info.title')"
      :router-link="getInfoPageLink(infoPages[0])"
      :show-arrow="false" />
    <CIVDropdownMenu
      v-else-if="infoPages.length > 1"
      :title="$t('info.title')"
      :open="activeDropdown === 'information'"
      @toggle="handleDropdownToggle('information', $event)">
      <CIVSidebarIconButton
        v-for="infoPage in infoPages"
        :key="infoPage.id"
        :title="$t(infoPage.translationKey)"
        :route="getInfoPageLink(infoPage)"
        icon="src/assets/icons/Info.svg"
        expanded />
    </CIVDropdownMenu>
    <CIVDropdownMenu
      v-if="
        appConfig.customer.isDataNoticesDisabled !== 'true'
        && dataNoticePages.length
      "
      :title="$t('navigation.impressum')"
      :open="activeDropdown === 'legal-notice'"
      @toggle="handleDropdownToggle('legal-notice', $event)">
      <CIVSidebarIconButton
        v-for="page in dataNoticePages"
        :key="page.id"
        :title="$t(page.translationKey)"
        :route="getDataNoticeRoute(page.id)"
        icon="src/assets/icons/ShieldLock.svg"
        expanded />
    </CIVDropdownMenu>
    <CIVDropdownMenu
      v-if="authStore.authenticated"
      :title="$t('navigation.user-profile')"
      router-link="/app/user-profile">
    </CIVDropdownMenu>
    <CIVDropdownMenu
      v-if="hasAdminPage"
      :title="$t('navigation.adminCockpit')"
      router-link="/app/admin-cockpit">
    </CIVDropdownMenu>
    <div class="mobile-sidebar-additional-content">
      <CIVButton
        v-if="!authStore.authenticated"
        :label="$t('navigation.log-in')"
        @click="authStore.login"
        iconSuffix="src/assets/icons/ArrowRightWhite.svg"
        ></CIVButton>
      <!-- <p
        v-if="!authStore.authenticated"
        @click="authStore.register()"
        class="register-now-text body-md">
          {{ $t('navigation.register-text') }}
      </p> -->
      <CIVButton
        v-if="authStore.authenticated"
        :label="$t('navigation.log-out')"
        @click="authStore.logout"
        suffix="src/assets/icons/ArrowRightWhite.svg"
      ></CIVButton>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import appConfig from '@config/appConfig'
import { useAuthStore } from '@/stores/authStore'
import { useSidebarModules } from '@/composables/useSidebarModules'
import { useAdminCards } from '@/composables/useAdminCards'
import { useInfoPages } from '@/composables/useInfoPages'
import { useDataNoticePages } from '@/composables/useDataNoticePages'
import { getDataNoticeRoute } from '@/utils/dataNoticePages'
import CIVButton from '../CIVButton.vue'
import CIVSidebarIconButton from './CIVSidebarIconButton.vue'
import CIVDropdownMenu from './CIVDropdownMenu.vue'
import CIVLanguageSwitch from '../CIVLanguageSwitch.vue'
import CIVInput from '../CIVInput.vue'

const authStore = useAuthStore()
const { t } = useI18n()
const { orderedModules } = useSidebarModules(t, 'mobile')
const infoPages = useInfoPages()
const dataNoticePages = useDataNoticePages()
const router = useRouter()
const activeDropdown = ref('platform')

const handleDropdownToggle = (dropdown, isOpen) => {
  activeDropdown.value = isOpen ? dropdown : null
}

const getInfoPageLink = (infoPage) => infoPage.link || `/app/info?tab=${infoPage.id}`

let input;
const search = (value) => {
  input = value;
}

const handleSearch = (e) => {
  e.preventDefault();
  router.push({ path: '/app/data-catalog', query: { q: input } });
}

const adminCards = useAdminCards()
const hasAdminPage = computed(() =>
  appConfig.customer.modules?.adminCockpit?.available === 'true'
  && authStore.authenticated
  && adminCards.value.length > 0
)
</script>

<style scoped>
.mobile-sidebar {
  width: 100%;
  min-height: 100%;
  background-color: var(--color-neutral-100);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow-y: auto;
}

.mobile-sidebar-additional-content {
  padding: 84px 0 28px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
}

.register-now-text {
  color: var(--color-primary-900);
}

.mobile-sidebar-actions {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px;
  gap: 16px;
}

.input-form {
  width: 100%;
  margin-top: -7px;
}
</style>
