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
  <template v-if="hasServices">
    <CIVCookieConsentBanner
      v-if="showBanner"
      @accept-all="acceptAll"
      @reject-all="rejectAll"
      @manage-preferences="openDialog('personalize')" />

    <button
      v-else-if="isReady"
      type="button"
      class="cookie-consent-reopen"
      :aria-label="t('cookieConsent.reopen')"
      @click="openDialog('personalize')">
      <CIVIcon iconUrl="/src/assets/icons/ShieldLock.svg" :size="20" />
    </button>

    <CIVCookieConsentDialog
      v-model:is-open="isDialogOpen"
      v-model:current-view="dialogView"
      :services="serviceStatuses"
      @accept-all="acceptAll"
      @reject-all="rejectAll"
      @set-consent="setConsent" />
  </template>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTarteAuCitron } from '@/composables/useTarteAuCitron'
import CIVCookieConsentBanner from './CIVCookieConsentBanner.vue'
import CIVCookieConsentDialog from './CIVCookieConsentDialog.vue'
import CIVIcon from './CIVIcon.vue'

const {
  mode = 'modal'
} = defineProps<{
  mode?: 'banner' | 'modal'
}>()

const { t } = useI18n()
const {
  hasServices,
  isReady,
  services,
  consent,
  needsConsent,
  acceptAll,
  rejectAll,
  setConsent
} = useTarteAuCitron()

const showModal = computed(() => mode === 'modal' && isReady.value && needsConsent.value)
const showBanner = computed(() => mode === 'banner' && isReady.value && needsConsent.value && !isDialogOpen.value)

const isDialogOpen = ref(mode === 'modal' && showModal.value)
const dialogView = ref<'main' | 'personalize'>('main')

const serviceStatuses = computed(() =>
  services.map((key) => ({ key, allowed: consent[key] }))
)

function openDialog(view: 'main' | 'personalize') {
  dialogView.value = view
  isDialogOpen.value = true
}

watch(
  () => [mode, showModal.value] as const,
  ([nextMode, nextShowModal], [previousMode]) => {
    if (nextShowModal) {
      openDialog('main')
      return
    }

    // Route-driven mode changes (e.g. to DataNotices) should dismiss the modal.
    if (previousMode === 'modal' && nextMode === 'banner') {
      isDialogOpen.value = false
      dialogView.value = 'main'
    }
  }
)
</script>

<style scoped>
.cookie-consent-reopen {
  position: fixed;
  right: 40px;
  bottom: 40px;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--color-neutral-300);
  background-color: var(--color-neutral-100);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
  cursor: pointer;
}
</style>
