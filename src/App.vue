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

<script setup lang="ts">
import { onBeforeMount, watch, computed } from "vue";
import { useRouter } from 'vue-router';

import { useAuthStore } from './stores/authStore';
import { useAuthToDpiBridge } from './projects/kdw/composables/useAuthToDpiBridge';
import { DEFAULT_LOCALE, getInitialLocale, setLocale, SUPPORTED_LOCALES } from "@/i18n.js";
import CIVCookieConsentManager from '@/components/civora-ui/CIVCookieConsentManager.vue'

useAuthToDpiBridge();

// Setup i18n locale from localeStorage.
// I do this app wide on the root component so that components like DPI will use the appropriate langauge.
onBeforeMount(async () => {
  const locale = getInitialLocale();
  await setLocale(SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE);
});

// if user logs out using the logout button
// or via backchannel logout from keycloak
// reload the page to prompt navigation guards
const authStore = useAuthStore()
const router = useRouter()

const cookieConsentMode = computed(() => router.currentRoute.value.name === 'DataNotices' ? 'banner' : 'modal')

watch(() => authStore.authenticated, (newVal: boolean | undefined, oldVal: boolean | undefined) => {
  if (!newVal && oldVal && router.currentRoute?.value?.meta?.requiresAuth) {
    router.go(0)
  }
})
</script>

<template>
  <RouterView> </RouterView>
  <CIVCookieConsentManager :mode="cookieConsentMode" />
</template>

<style scoped></style>
