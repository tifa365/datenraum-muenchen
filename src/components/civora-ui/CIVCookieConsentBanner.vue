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
  <div class="cookie-consent-banner" role="region" :aria-label="t('cookieConsent.banner.ariaLabel')">
    <p class="cookie-consent-banner-text body-lg">{{ t('cookieConsent.banner.message') }}</p>
    <div class="cookie-consent-banner-actions">
      <CIVButton
        type="tertiary"
        size="medium"
        :label="t('cookieConsent.banner.managePreferences')"
        @click="emit('managePreferences')" />
      <CIVButton
        type="secondary"
        size="medium"
        :label="t('cookieConsent.banner.rejectAll')"
        @click="emit('rejectAll')" />
      <CIVButton
        type="primary"
        size="medium"
        :label="t('cookieConsent.banner.acceptAll')"
        @click="emit('acceptAll')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import CIVButton from './CIVButton.vue'

const { t } = useI18n()

const emit = defineEmits<{
  acceptAll: []
  rejectAll: []
  managePreferences: []
}>()
</script>

<style scoped>
.cookie-consent-banner {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2147483000;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background-color: var(--color-bg-white);
  border-top: 1px solid var(--color-divider);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.12);
}

.cookie-consent-banner-text {
  color: var(--color-text-regular);
}

.cookie-consent-banner-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  width: 100%;
}

@media (min-width: 1024px) {
  .cookie-consent-banner {
    flex-wrap: nowrap;
  }
  .cookie-consent-banner-text {
    flex: 1 1 320px;
  }
  .cookie-consent-banner-actions {
    width: auto;
  }
}
</style>
