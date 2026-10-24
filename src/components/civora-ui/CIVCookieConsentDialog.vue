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
  <CIVOverlay v-model:is-open="isOpenModel">
    <div class="cookie-consent-dialog">
      <div class="cookie-consent-dialog-header">
        <p class="cookie-consent-dialog-title title-lg">{{ t('cookieConsent.dialog.title') }}</p>
      </div>
      <p class="cookie-consent-dialog-description body-lg">{{ t('cookieConsent.dialog.description') }}</p>

      <template v-if="currentView === 'main'">
      </template>

      <template v-if="currentView === 'personalize'">
        <div class="cookie-consent-service-container">
          <div class="cookie-consent-service-row">
            <div class="cookie-consent-service-info">
              <p class="cookie-consent-service-name body-lg">
                {{ t('cookieConsent.dialog.necessaryServicesName') }}
              </p>
              <p class="cookie-consent-service-description body-md">
                {{ t('cookieConsent.dialog.necessaryServicesDescription') }}
              </p>
            </div>
            <CIVToggle
              :model-value="true"
              :label="t('cookieConsent.dialog.allow')"
              :aria-label="t('cookieConsent.dialog.necessaryServicesName')"
              disabled
            />
          </div>
          <ul class="cookie-consent-service-list">
            <li v-for="service in services" :key="service.key" class="cookie-consent-service-row">
              <div class="cookie-consent-service-info">
                <p class="cookie-consent-service-name body-lg">
                  {{ t(`cookieConsent.services.${service.key}.name`) }}
                </p>
                <p class="cookie-consent-service-description body-md">
                  {{ t(`cookieConsent.services.${service.key}.description`) }}
                </p>
              </div>
              <CIVToggle
                :model-value="getServiceConsent(service.key, service.allowed)"
                :label="t('cookieConsent.dialog.allow')"
                :aria-label="t(`cookieConsent.services.${service.key}.name`)"
                @update:model-value="onServiceConsentChange(service.key, $event)" />
            </li>
          </ul>
        </div>
      </template>
      <div class="cookie-consent-dialog-actions-main">
        <CIVButton
          type="primary"
          size="large"
          :label="t('cookieConsent.dialog.acceptAll')"
          @click="acceptAllAndClose" />
        <CIVButton
          type="primary"
          size="large"
          :label="t('cookieConsent.dialog.rejectAll')"
          @click="rejectAllAndClose" />
        <CIVButton
          v-if="currentView === 'main'"
          type="tertiary"
          size="large"
          :label="t('cookieConsent.dialog.personalize')"
          @click="currentView = 'personalize'" />
        <CIVButton
          v-else
          type="tertiary"
          size="large"
          :label="t('cookieConsent.dialog.close')"
          @click="saveAllAndClose" />
      </div>
      <CIVButton
        type="tertiary"
        size="large"
        :label="t('cookieConsent.dialog.privacyPolicy')"
        to="/app/data-notices?tab=PrivacyPolicy" />
    </div>
  </CIVOverlay>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import CIVOverlay from '@/components/civora-ui/CIVOverlay.vue'
import CIVButton from './CIVButton.vue'
import CIVToggle from './CIVToggle.vue'
import type { ConsentServiceStatus } from '@/composables/useTarteAuCitron'

const { t } = useI18n()

const isOpenModel = defineModel<boolean>('isOpen', { required: true })
const currentView = defineModel<'main' | 'personalize'>('currentView', { required: true })
const props = defineProps<{
  services: ConsentServiceStatus[]
}>()

const emit = defineEmits<{
  acceptAll: []
  rejectAll: []
  setConsent: [key: string, status: boolean]
}>()

const consentOverrides = reactive<Record<string, boolean | undefined>>({})

function getServiceConsent(key: string, allowed: boolean | undefined) {
  const override = consentOverrides[key]
  return override !== undefined ? override : allowed === true
}

function onServiceConsentChange(key: string, status: boolean) {
  consentOverrides[key] = status
  emit('setConsent', key, status)
}

function close() {
  isOpenModel.value = false
}

function acceptAllAndClose() {
  emit('acceptAll')
  close()
}

function rejectAllAndClose() {
  props.services.forEach((service) => {
    if (service.allowed === true) {
      consentOverrides[service.key] = false
    }
  })
  emit('rejectAll')
  close()
  reloadIfNeeded()
}

function saveAllAndClose() {
  for (const service of props.services) {
    const effectiveConsent = consentOverrides[service.key] ?? service.allowed
    if (effectiveConsent === undefined) {
      emit('setConsent', service.key, false)
    }
  }
  close()
  reloadIfNeeded()
}

function reloadIfNeeded() {
  if (Object.values(consentOverrides).some((status) => status === false)) {
    window.location.reload()
  }
}
</script>

<style scoped>
.cookie-consent-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: min(720px, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  overflow: auto;
  padding: 38px;
}

.cookie-consent-dialog-header {
  display: flex;
  align-items: center;
}

.cookie-consent-dialog-title {
  text-align: center;
}

.cookie-consent-dialog-description {
  color: var(--color-text-regular);
  text-align: center;
}

.cookie-consent-service-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-top: 16px;
  margin-bottom: 16px;
}

.cookie-consent-service-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
}

.cookie-consent-service-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.cookie-consent-service-info {
  flex: 1 1 auto;
}

.cookie-consent-service-name {
  margin: 0;
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-700);
}

.cookie-consent-service-description {
  margin: 0;
  color: var(--color-neutral-600);
}

.cookie-consent-dialog-actions-main {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.cookie-consent-dialog-privacy-link {
  color: var(--color-button-regular);
  text-decoration: underline;
}

@media (max-width: 640px) {
  .cookie-consent-dialog {
    padding: 24px;
  }

  .cookie-consent-service-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
