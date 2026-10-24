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
import { useI18n } from 'vue-i18n'
import CIVButton from './CIVButton.vue'
import type { OrganisationDatasetItem } from '@/composables/useOrganisationDatasetItems'
import { getTranslationFor } from '@/projects/kdw/sdk/utils/helpers'

defineProps<{
  error: string | null
  isDeleting: boolean
  target: OrganisationDatasetItem | null
}>()

defineEmits<{
  cancel: []
  confirm: []
}>()

const { locale } = useI18n()
</script>

<template>
  <Teleport to="body">
    <div v-if="target" class="delete-overlay" @click.self="$emit('cancel')">
      <div class="delete-modal" role="dialog" aria-modal="true">
        <div class="delete-modal__header">
          <svg
            class="delete-modal__icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            />
          </svg>
          <h3 class="delete-modal__title">
            {{ $t('organisation.datasets.deleteConfirmTitle') }}
          </h3>
        </div>

        <p class="delete-modal__body">
          <strong>{{ getTranslationFor(target.name, locale) }}</strong>
          {{ $t('organisation.datasets.deleteConfirmBody') }}
        </p>

        <p v-if="error" class="delete-modal__error">{{ error }}</p>

        <div class="delete-modal__actions">
          <CIVButton
            :label="$t('organisation.datasets.cancel')"
            type="secondary"
            size="large"
            :disabled="isDeleting"
            @click="$emit('cancel')"
          />
          <button
            class="delete-confirm-button"
            :disabled="isDeleting"
            @click="$emit('confirm')"
          >
            <span v-if="isDeleting" class="delete-confirm-button__spinner" />
            {{
              isDeleting
                ? $t('organisation.datasets.deleting')
                : $t('organisation.datasets.delete')
            }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.delete-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.delete-modal {
  background: var(--color-bg-darker, #fff);
  border: 1px solid var(--color-neutral-300);
  border-radius: 12px;
  padding: 32px;
  width: min(480px, 90vw);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.delete-modal__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.delete-modal__icon {
  width: 24px;
  color: #c0392b;
  flex-shrink: 0;
}

.delete-modal__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-light, #1a2025);
}

.delete-modal__body {
  margin: 0 0 20px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-text-light, #33404a);
}

.delete-modal__error {
  margin: 0 0 16px;
  padding: 10px 14px;
  background: #fff5f5;
  border: 1px solid #ffc5c5;
  border-radius: 8px;
  color: #c0392b;
  font-size: 14px;
}

.delete-modal__actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.delete-confirm-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #c0392b;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
}

.delete-confirm-button:hover:not(:disabled) {
  background: #a93226;
}

.delete-confirm-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.delete-confirm-button__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .delete-modal__actions {
    flex-direction: column-reverse;
  }
}
</style>
