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
  <header class="header">
    <div
      class="header-info"
      @click="handleLogoClick"
    >
      <img
        class="customer-logo"
        :src="headerLogo"
        :alt="`${headerTitle} Logo`"
      />
      <span v-if="showHeaderTitle" class="vertical-divider headline-sm" aria-hidden="true">|</span>
      <h1 v-if="showHeaderTitle" class="header-title headline-sm">{{ headerTitle }}</h1>
    </div>
    <nav class="header-buttons">
      <button class="hamburger-button" @click="$emit('toggle-sidebar')">
        <img :src="isSidebarVisible ? 'src/assets/icons/Close.svg' : 'src/assets/icons/Hamburger.svg'"
          alt="Toggle Sidebar" />
      </button>
      <div class="header-external-links">
        <template v-for="headerLinkKey in headerLinkKeys" :key="headerLinkKey">
          <CIVTooltip
            class="tooltip"
            position="bottom"
            :text="$t(headerLinks[headerLinkKey].translationKey)"
          >
            <HeaderIconButton
              :icon="headerLinks[headerLinkKey].icon"
              :alt="t(headerLinks[headerLinkKey].translationKey)"
              :route="headerLinks[headerLinkKey].urlTarget"
            />
          </CIVTooltip>
        </template>
      </div>
      <CIVAppHeaderUserMenu class="user-menu" v-if="authStore.authenticated"> </CIVAppHeaderUserMenu>
      <a v-if="te('landing-page.header.info-button') && te('landing-page.header.info-link')" class="info-button" target="_blank"
        :href="$t('landing-page.header.info-link')">
        <span class="label-lg">{{ $t('landing-page.header.info-button') }}</span>
        <img src="../../../../src/assets/icons/ArrowTopRight.svg" alt="Arrow Right" class="arrow-icon">
      </a>
      <div class="header-actions">
        <form v-if="canSearch" @submit.prevent="handleSearch">
          <CIVInput :defaultValue="input" class="header-input" @inputValue="search" @iconPrefixClick="handleSearch" @iconSuffixClick="handleClear" iconPrefix="src/assets/icons/Search.svg" size="medium"
          :iconSuffix="input.length ? 'src/assets/icons/Close.svg' : ''"
          :placeholder="$t('civora.layout.searchInput.placeholder')" />
        </form>
        <CIVLanguageSwitch />
      </div>
      <CIVButton v-if="!authStore.authenticated && !hasLeadingIconHeaderActions" class="auth-button" @click="authStore.login"
        :label="$t('civora.layout.app-header.login')" iconSuffix="src/assets/icons/ArrowRightAlt.svg" />
      <CIVButton v-if="!authStore.authenticated && hasLeadingIconHeaderActions" class="auth-button auth-button--outlined"
        @click="authStore.login" :label="$t('civora.layout.app-header.login')"
        iconPrefix="src/assets/icons/User.svg" type="secondary" />
      <CIVButton
        v-if="hasLeadingIconHeaderActions"
        :label="$t(leadingIconInfoButtonKey)"
        :href="$t(leadingIconInfoLinkKey)"
        iconPrefix="src/assets/icons/ArrowTopRight.svg"
      />
    </nav>
  </header>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { useRouteQuery } from '@vueuse/router'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import appConfig from '@config/appConfig'
import { useAuthStore } from '@/stores/authStore'
import CIVButton from '../CIVButton.vue'
import CIVTooltip from '../CIVTooltip.vue'
import CIVAppHeaderUserMenu from './CIVAppHeaderUserMenu.vue'
import CIVInput from '@/components/civora-ui/CIVInput.vue'
import CIVLanguageSwitch from '../CIVLanguageSwitch.vue'
import HeaderIconButton from '@/components/navigation/header/HeaderIconButton.vue'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter();
const {te, t} = useI18n()

const headerLogo = `config/${appConfig.customer.name}/assets/images/${appConfig.appHeader.logoFileName}`
const showHeaderTitle = appConfig.appHeader?.hideTitle !== 'true'
const headerTitle = appConfig.appHeader.headerTitle

const leadingIconInfoButtonKey = 'civora.layout.app-header.info-button-leading-icon'
const leadingIconInfoLinkKey = 'civora.layout.app-header.info-link-leading-icon'
const hasLeadingIconHeaderActions = computed(() =>
  te(leadingIconInfoButtonKey) && te(leadingIconInfoLinkKey)
)

const canSearch = computed(() => {
  return appConfig?.customer?.modules?.dataCatalog?.available === 'true'
    && (appConfig?.customer?.modules?.dataCatalog?.requiresLogin === 'false'
      || authStore.authenticated)
})

defineProps({
  isSidebarVisible: {
    type: Boolean,
    required: true,
  },
})

const handleLogoClick = () => {
    if(route.path === '/app/home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push({ path: '/app/home' });
    }
}

const input = ref('')
const search = (value) => {
  input.value = value;
}

const searchTerm = useRouteQuery('q')

watch(
  searchTerm,
  (newValue) => {
    input.value = newValue || ''
  },
  {
    immediate: true,
  }
)

const handleSearch = () => {
  if (searchTerm.value === input.value && route.path === '/app/data-catalog' ) return

  router.push({
    path: '/app/data-catalog',
    query: input.value ? { q: input.value } : {}
  })
}

const handleClear = () => {
  input.value = '';
  handleSearch();
}

const headerLinks = computed(() => {
  return Object.fromEntries(Object.entries(appConfig?.appHeader?.headerLinks ?? {})
    .filter(([key, headerLink]) => !!headerLink?.translationKey && !!headerLink?.icon && !!headerLink?.urlTarget))
})

// order of keys when iterating over an object can be arbitrary
// sort for consistent ordering
// reverse for predictable placement (left to right)
const headerLinkKeys = computed(() => {
  return Object.keys(headerLinks.value)
    .sort()
    .reverse()
})
</script>

<style scoped>
.header-input {
  gap: 0;
  width: 348px;
}

.customer-logo {
  height: 40px;
  object-fit: contain;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  width: 100%;
  height: 72px;
  background-color: var(--color-neutral-100);
  color: black;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-primary-300);
}

.header-info {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
  padding-left: 32px;
  cursor: pointer;
}

.header-title {
  color: var(--color-neutral-700);
  transform: var(--header-title-transform);
}

.vertical-divider {
  color: var(--color-neutral-700);
  font-weight: 600;
  font-size: 18px;
  transform: var(--header-title-transform);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-buttons {
  display: flex;
  gap: 16px;
  padding-right: 16px;
}

.header-buttons > :deep(.button),
.header-buttons > .info-button,
.header-actions :deep(.language-button),
.hamburger-button {
  height: 40px;
}

.hamburger-button {
  background: unset;
  border: none;
  cursor: pointer;
  display: none;
}

.header-external-links {
  width: fit-content;
  display: flex;
  flex-direction: row-reverse;
  gap: 16px;
}

.info-button {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 8px;
  background: var(--color-button-regular);
  color: var(--color-text-regular);
}

.auth-button--outlined.button-secondary {
  background: var(--color-bg-white);
  color: var(--color-text-regular);
  border-color: var(--color-neutral-500);
}

.auth-button--outlined.button-secondary:hover {
  border-color: var(--color-text-regular);
}

@media (max-width: 1032px) {
  .tooltip,
  .auth-button,
  .header-title,
  .user-menu,
  .header-external-links,
  .vertical-divider,.header-actions {
    display: none;
  }
  .hamburger-button {
    display: block;
  }
}
</style>
