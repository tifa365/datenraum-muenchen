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
  <CIVTooltip position="left" :text="$t('city-os.layout.app-header-dropdown.user-menu')">
    <HeaderIconDropdown icon="User.svg" alt="User Icon" :alignToRight="availableLanguages.length === 1">
      <template #dropdown-content>
        <div class="dropdown-user-header">
          <span class="dropdown-user-header-initials title-md">{{ userInitials }}</span>
          <div class="dropdown-user-header-info">
            <span class="dropdown-user-header-name label-lg">{{ userFullName }}</span>
            <span class="dropdown-user-header-email body-md ">{{ userEmail }}</span>
          </div>
        </div>

        <div class="dropdown-items-container">
          <RouterLink v-for="(navItem, index) in navItems" class="civ-button-onlight-large-tertiary-link"
            :to="navItem.urlTarget" :key="index">
            {{ $t(navItem.translationKey) }}
          </RouterLink>
        </div>

        <button type="button" class="dropdown-logout-button civ-button-onlight-large-tertiary-link" @click="authStore.logout()">
          <span class="body-lg">
            {{ $t('city-os.layout.app-header-dropdown.logout') }}
          </span>
          <img class="dropdown-logout-button-icon" src="../../../assets/icons/Logout.svg" alt="Logout Icon" />
        </button>

        <CIVAppVersion />
      </template>
    </HeaderIconDropdown>
  </CIVTooltip>
</template>

<script setup lang="ts">
import { computed, type ComputedRef, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import HeaderIconDropdown from '@/components/navigation/header/HeaderIconDropdown.vue';
import appConfig from '../../../../config/appConfig';
import { RouterLink } from 'vue-router';
import CIVAppVersion from '../CIVAppVersion.vue';

interface UserMenuItem {
  translationKey: string
  urlTarget: string
  requiresRole?: string[]
}

const authStore = useAuthStore()

const userInitials = computed(() =>
  (authStore.user.parsedToken?.given_name?.[0] + authStore.user.parsedToken?.family_name?.[0]) || "UU")
const userFullName = computed(() =>
  authStore.user.parsedToken?.given_name + " " + authStore.user.parsedToken?.family_name)
const userEmail = computed(() =>
  authStore.user.parsedToken?.email)

const defaultNavItems: UserMenuItem[] = [
  {
    translationKey: 'city-os.layout.app-header-dropdown.user-profile',
    urlTarget: '/app/user-profile',
  },
  {
    translationKey: 'city-os.layout.app-header-dropdown.personal-settings',
    urlTarget: '/app/user-profile',
  },
]
if (appConfig.customer.isDataNoticesDisabled === 'false') {
  defaultNavItems.push({
    translationKey: 'city-os.layout.app-header-dropdown.legal-notices',
    urlTarget: '/app/data-notices',
  })
}

const navItems: ComputedRef<UserMenuItem[]> = computed(() => {
  if (!appConfig.appHeader.userMenu) {
    return defaultNavItems
  }
  return ['first', 'second', 'third', 'fourth', 'fifth', 'sixth']
    .map(key => {
      const navItemConfig = appConfig.appHeader.userMenu?.[key]
      if (!navItemConfig || !navItemConfig.translationKey || navItemConfig.translationKey.trim() === '') {
        return undefined
      }
      return {
        translationKey: navItemConfig.translationKey,
        urlTarget: navItemConfig.urlTarget,
        requiresRole: navItemConfig.requiresRole?.split(',') || []
      }
    })
    .filter(navItem => !!navItem && userMayAccess(navItem, authStore.user))
})

function userMayAccess(navItem: UserMenuItem, user: any) {
  return !navItem.requiresRole ||
    navItem.requiresRole.length == 0 ||
    navItem.requiresRole.some(requiredRole =>
      !requiredRole || user.groupMemberships?.includes(`/${requiredRole}`))
}

const displayOptionsArray = appConfig?.languages?.displayOptions?.split(',').map((code) => code.trim()) || ['de']
const languageNames = {
  de: 'Deutsch',
  en: 'English',
  cs: 'Čeština',
}
const availableLanguages = displayOptionsArray
  .filter((code) => languageNames[code])
  .map((code) => ({ code, name: languageNames[code] }))
</script>

<style scoped>
.dropdown-user-header {
  display: flex;
  gap: 16px;
  align-items: center
}
.dropdown-user-header-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border: 1.41px solid var(--color-neutral-500);
  border-radius: 50%;
  color: var(--color-neutral-600);
}
.dropdown-user-header-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dropdown-user-header-name {
  font-size: 18px;
  color: var(--color-neutral-600);
}
.dropdown-user-header-email {
  color: var(--color-neutral-600);
}
.dropdown-items-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: 16px 0;
}
.civ-button-onlight-large-tertiary-link {
  display: flex;
  gap: 8px;
  padding: 11px 24px;
  color: var(--color-primary-900);
}
.dropdown-logout-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}
.dropdown-logout-button-icon {
  width: 24px;
}
</style>