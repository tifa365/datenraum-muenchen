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
    <COSDropdownMenu
      title="Plattform"
      :open="activeDropdown === 'platform'"
      @toggle="handleDropdownToggle('platform', $event)">
     <template v-for="module in orderedModules">
       <COSDropdownMenuItem
        v-if="!module.requiresLogin || authStore.authenticated"
        :key="module.name"
        :title="module.title"
        :route="module.route"
        :icon-active="module.iconActive"
        :icon-inactive="module.iconInactive" />
      </template>
    </COSDropdownMenu>
    <COSDropdownMenu
      v-if="infoPages.length === 1"
      :title="$t('info.title')"
      :router-link="getInfoPageLink(infoPages[0])"
      :show-arrow="false" />
    <COSDropdownMenu
      v-else-if="infoPages.length > 1"
      :title="$t('info.title')"
      :open="activeDropdown === 'information'"
      @toggle="handleDropdownToggle('information', $event)">
      <COSDropdownMenuItem
        v-for="infoPage in infoPages"
        :key="infoPage.id"
        :title="$t(infoPage.translationKey)"
        :route="getInfoPageLink(infoPage)" />
    </COSDropdownMenu>
    <COSDropdownMenu
      v-if="
        appConfig.customer.isDataNoticesDisabled !== 'true'
        && dataNoticePages.length
      "
      :title="$t('navigation.impressum')"
      :open="activeDropdown === 'legal-notice'"
      @toggle="handleDropdownToggle('legal-notice', $event)">
      <COSDropdownMenuItem
        v-for="page in dataNoticePages"
        :key="page.id"
        :title="$t(page.translationKey)"
        :route="getDataNoticeRoute(page.id)" />
    </COSDropdownMenu>
    <COSDropdownMenu
      v-if="authStore.authenticated"
      :title="$t('navigation.user-profile')"
      router-link="/app/user-profile">
    </COSDropdownMenu>
    <COSDropdownMenu
      v-if="hasAdminPage"
      :title="$t('navigation.adminCockpit')"
      router-link="/app/admin-cockpit">
    </COSDropdownMenu>
    <div class="mobile-sidebar-additional-content">
      <COSButton
        v-if="!authStore.authenticated"
        :button-text="$t('navigation.log-in')"
        :pressed="authStore.login"
        suffix="src/assets/icons/ArrowRightWhite.svg"
        button-size="large"
        ></COSButton>
      <!-- <p
        v-if="!authStore.authenticated"
        @click="authStore.register()"
        class="register-now-text">
          {{ $t('navigation.register-text') }}
      </p> -->
      <COSButton
        v-if="authStore.authenticated"
        class="cos-logout-button"
        :button-text="$t('navigation.log-out')"
        :pressed="authStore.logout"
        suffix="src/assets/icons/ArrowRightWhite.svg"
        button-size="large"
      ></COSButton>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import appConfig from '@config/appConfig'
import { useAuthStore } from '@/stores/authStore'
import { useSidebarModules } from '@/composables/useSidebarModules'
import { useAdminCards } from '@/composables/useAdminCards'
import { useInfoPages } from '@/composables/useInfoPages'
import { useDataNoticePages } from '@/composables/useDataNoticePages'
import { getDataNoticeRoute } from '@/utils/dataNoticePages'

import COSButton from '@/components/city-os/COSButton.vue'
import COSDropdownMenu from '@/components/city-os/layout/COSDropdownMenu.vue'
import COSDropdownMenuItem from '@/components/city-os/layout/COSDropdownMenuItem.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const { orderedModules } = useSidebarModules(t, 'mobile')
const infoPages = useInfoPages()

const getInfoPageLink = (infoPage) => infoPage.link || `/app/info?tab=${infoPage.id}`
const dataNoticePages = useDataNoticePages()
const activeDropdown = ref('platform')

const handleDropdownToggle = (dropdown, isOpen) => {
  activeDropdown.value = isOpen ? dropdown : null
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
  background-color: white;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow-y: auto;
}

.mobile-sidebar-additional-content {
  padding-top: 84px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.register-now-text {
  padding-top: 28px;
  padding-bottom:28px;
  color: #1a2025;
  text-align: center;
  font-family: var(--font-family), serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 26px;
}

.cos-logout-button {
  margin-bottom: 28px;
}
</style>
