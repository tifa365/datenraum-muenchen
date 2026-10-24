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
    <div class="header-info" @click="handleLogoClick">
        <img
          class="customer-logo"
          :src="headerLogo"
          alt="City Logo"/>
      <h1 v-if="showHeaderTitle" class="vertical-divider">|</h1>
      <h1 v-if="showHeaderTitle" class="header-title">{{ headerTitle }}</h1>
    </div>
    <nav class="header-buttons">
      <button
        v-if="!isDesktop"
        class="hamburger-button"
        @click="$emit('toggle-sidebar')">
        <img
          :src="isSidebarVisible ? 'src/assets/icons/Close.svg' : 'src/assets/icons/Hamburger.svg'"
          alt="Toggle Sidebar" />
      </button>
      <div v-if="isDesktop" class="header-external-links">
        <template v-for="headerLinkKey in headerLinkKeys" :key="headerLinkKey">
          <COSTooltip
            class="tooltip"
            position="bottom"
            :text="$t(headerLinks[headerLinkKey].translationKey)"
          >
            <HeaderIconButton
              :icon="headerLinks[headerLinkKey].icon"
              :alt="t(headerLinks[headerLinkKey].translationKey)"
              :route="headerLinks[headerLinkKey].urlTarget"
            />
          </COSTooltip>
        </template>
      </div>
      <COSButton
        v-if="isDesktop && !authStore.authenticated"
        :button-text="$t('city-os.layout.app-header.login')"
        :pressed="authStore.login"
        button-style="text"
        suffix="src/assets/icons/ArrowRight.svg"></COSButton>
      <COSAppHeaderUserMenu v-if="isDesktop && authStore.authenticated"> </COSAppHeaderUserMenu>
      <a
        v-if="isDesktop && te('landing-page.header.info-button') && te('landing-page.header.info-link')"
        class="info-button"
        :href="$t('landing-page.header.info-link')">
        <span>{{ $t('landing-page.header.info-button') }}</span>
        <img
          src="../../../../src/assets/icons/ArrowTopRight.svg"
          alt="Arrow Right"
          class="arrow-icon">
      </a>
      <COSLanguageSwitch />
    </nav>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import appConfig from '@config/appConfig'
import COSButton from '@/components/city-os/COSButton.vue'
import HeaderIconButton from '@/components/navigation/header/HeaderIconButton.vue'
import COSTooltip from '@/components/city-os/COSTooltip.vue'
import { useAuthStore } from '@/stores/authStore'
import COSAppHeaderUserMenu from './COSAppHeaderUserMenu.vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const headerLogo = `config/${appConfig.customer.name}/assets/images/${appConfig.appHeader.logoFileName}`
const showHeaderTitle = appConfig.appHeader?.hideTitle !== 'true'
const headerTitle = appConfig.appHeader.headerTitle
const route = useRoute()
const router = useRouter()
const {te, t} = useI18n()

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

const handleLogoClick = () => {
    if(route.path === '/app/home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push({ path: '/app/home' });
    }
} 

const isDesktop = ref(window.innerWidth >= 1033)

const authStore = useAuthStore()

const props = defineProps({
  isSidebarVisible: {
    type: Boolean,
    required: true,
  },
})

const handleResize = () => {
  isDesktop.value = window.innerWidth >= 1033
}

watch(() => window.innerWidth, handleResize)

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.vertical-divider {
  font-family: var(--font-family), serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  text-align: center;
}

.customer-logo {
  height: 40px;
  object-fit: contain;
}
.header-title {
  font-family: var(--font-family), serif;
  color: #33404a;
  font-weight: 600;
  font-size: 18px;
  font-style: normal;
  line-height: 20px;
}
.header {
  z-index: 999;
  height: 72px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  background-color: white;
  color: black;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #d4dde3;
}

.header-external-links {
  width: fit-content;
  display: flex;
  flex-direction: row-reverse;
  gap: 16px;
}

.header-info {
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
  padding-left: 32px;
  cursor: pointer;
}

.header-buttons {
  display: flex;
  flex-direction: row;
  gap: 16px;
  padding-right: 16px;
}

.hamburger-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  display: none;
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
  font-size: 16px;
  font-family: var(--font-family), serif;
  font-weight: 700;
}

@media (max-width: 480px) {
  .hamburger-button {
    display: block;
  }
  .header-title {
    display: none;
  }
  .vertical-divider {
    display: none;
  }
}

@media (max-width: 1032px) {
  .hamburger-button {
    display: block;
  }
  .header-title {
    display: none;
  }
  .vertical-divider {
    display: none;
  }
}
</style>
