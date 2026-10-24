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
  <div v-if="isLoading && !isError">
      {{ $t('views.app.analytics.models.loading') }}
  </div>
  <div v-else-if="isError">
      {{ $t('views.app.analytics.models.failed-to-load') }}
  </div>
  <div v-else
    class="exec-view-container"
  >
    <COSViewHeaderBackButtonPanel
      :contextText="$t('views.app.analytics.models.title')"
    />

    <div class="exec-title-container">
      <div class="exec-title-content">
        <div class="exec-title-content-container">
          <span class="exec-title title-md">
            {{ model.title }}
          </span>
          <CIVTag
            tone="promote"
            :hasDotIcon="true"
            :hasCloseIcon="false"
            :text="$t('views.app.analytics.execution.model-execution')"
          />
        </div>
      </div>
    </div>

    <div class="exec-content">
      <div class="exec-executions-content">
        <div class="exec-config-card">
          <div class="exec-config-card-header">
            <div class="exec-config-card-title">
              <CIVMaskedIcon
                class="exec-config-card-title-icon"
                svgIcon="/src/assets/icons/config.svg" />
              <span class="exec-config-card-title-text title-md">
                {{ $t('views.app.analytics.execution.configuration') }}
              </span>
            </div>
            <span class="exec-config-card-title-subtext body-lg">
              {{ $t('views.app.analytics.execution.config-description') }}
            </span>
          </div>
          <div v-if="processInputSchema" class="exec-dataset-picker-trigger">
            <CIVButton
              class="exec-dataset-picker-trigger-button"
              type="secondary"
              :label="$t('views.app.analytics.execution.datasetPicker.trigger')"
              @click="openDatasetPicker"
            />
          </div>
          <!-- mounted lazily so the dataset search only runs once the picker is first opened -->
          <DatasetPicker
            v-if="datasetPickerMounted"
            v-model:open="datasetPickerOpen"
            @loaded="onScenarioLoaded"
          />

          <div
            v-if="processDescription.isError.value"
            class="exec-config-card-content"
          >
            <div class="exec-config-card-results exec-error" role="alert">
              <CIVMaskedIcon
                class="exec-error-icon"
                svgIcon="/src/assets/icons/Error.svg" />
              <span class="exec-text body-lg">
                {{ $t('views.app.analytics.execution.descriptionLoadFailed') }}
              </span>
            </div>
          </div>

          <div v-if="processInputSchema" class="exec-config-card-content">
            <CIVJsonForm
              :schema="processInputSchema"
              v-model="formData"
              @update:errors="formErrors = $event"
            />
          </div>
          <div class="exec-config-card-buttons">
            <CIVButton
              class="exec-execute-button"
              iconPrefix="/src/assets/icons/play.svg"
              :label="$t('views.app.analytics.execution.execute-model')"
              :disabled="modelExecutor.isPending.value || execIsLoading || formInvalid || descriptionBlocked"
              @click="executeModel"
            />
          </div>
          <div
            v-if="execIsLoading || execIsError || jobResults.data.value"
            class="exec-config-card-results-container"
          >
            <div 
              v-if="execIsLoading && !execIsError"
              class="exec-config-card-results exec-loading">
              <CIVLoading class="exec-loading-icon" />
              <span class="exec-text body-lg">
                {{ $t('views.app.analytics.execution.loading') }}
              </span>
            </div>
            <div 
              v-if="!execIsLoading && execIsError"
              class="exec-config-card-results exec-error">
              <CIVMaskedIcon
                class="exec-error-icon"
                svgIcon="/src/assets/icons/Error.svg" />
              <span class="exec-text body-lg">
                {{ $t('views.app.analytics.execution.error') }}
              </span>
            </div>
            <div 
              v-if="!execIsLoading && !execIsError && jobResults.data.value"
              class="exec-config-card-results exec-success">
              <div class="exec-success-title">
                <CIVMaskedIcon
                  class="exec-success-icon"
                  svgIcon="/src/assets/icons/circle-checkmark.svg" />
                <span class="exec-text title-md">
                  {{ $t('views.app.analytics.execution.success') }}
                </span>
              </div>
              <span class="exec-success-result body-lg">
                {{ $t('views.app.analytics.execution.results') }}:
                {{ jobResults.data?.value?.job_results.result }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRouteParams } from '@vueuse/router'
import { useModels, useModelExecution, useJobStatus, useJobResults, useProcessDescription } from '@/composables/useModelCoordinator'
import COSViewHeaderBackButtonPanel from '@/components/city-os/COSViewHeaderBackButtonPanel.vue'
import CIVTag from '@/components/civora-ui/CIVTag.vue'
import CIVMaskedIcon from '@/components/civora-ui/CIVMaskedIcon.vue'
import CIVButton from '@/components/civora-ui/CIVButton.vue'
import CIVLoading from '@/components/civora-ui/CIVLoading.vue'
import CIVJsonForm from '@/components/civora-ui/CIVJsonForm.vue'
import DatasetPicker from './DatasetPicker.vue'

const modelId = useRouteParams('modelId')
const modelExecutor = useModelExecution()

const { isLoading, isError, models } = useModels()
const model = computed(() => models?.value?.find(model => model.id === modelId.value) ?? '')

const processDescription = useProcessDescription(modelId)

const processInputSchema = computed(() => processDescription.data.value?.inputs ?? null)

const formData = ref({})

const datasetPickerOpen = ref(false)
const datasetPickerMounted = ref(false)

function openDatasetPicker() {
  datasetPickerMounted.value = true
  datasetPickerOpen.value = true
}

function onScenarioLoaded(inputs: Record<string, unknown>) {
  formData.value = inputs
}

// AJV errors reported by the form (nested included); null until the form has reported.
const formErrors = ref<unknown[] | null>(null)
const formInvalid = computed(
  () => !!processInputSchema.value && (formErrors.value === null || formErrors.value.length > 0),
)

// Block Execute until the process description is known (loading) or when it failed to load.
const descriptionBlocked = computed(
  () => !!processDescription.isLoading.value || !!processDescription.isError.value,
)

function executeModel() {
  if (processInputSchema.value) {
    modelExecutor.mutate({ modelId: modelId.value, parameters: { inputs: formData.value } })
  } else {
    modelExecutor.mutate({ modelId: modelId.value })
  }
}

const jobId = computed(() => {
  if (modelExecutor.data?.value) {
    return modelExecutor.data.value.jobID
  }
  return ''
})

const jobStatus = useJobStatus(jobId)
const jobStatusJobId = computed(() => {
  if (jobStatus.data?.value?.status === 'successful') {
    return jobStatus.data.value.jobID
  }
  return ''
})

const jobResults = useJobResults(jobStatusJobId)

const jobIsRunning = computed(() => {
  const status = jobStatus.data?.value?.status
  return !!status && status !== 'successful' && status !== 'failed' && status !== 'dismissed'
})

// A finished-but-unsuccessful job stops polling and yields no results: surface it as an error.
const jobEndedUnsuccessfully = computed(() => {
  const status = jobStatus.data?.value?.status
  return status === 'failed' || status === 'dismissed'
})

const execIsLoading = computed(() =>
  modelExecutor?.isPending?.value || jobStatus?.isLoading?.value || jobIsRunning.value || jobResults?.isLoading?.value)

const execIsError = computed(() =>
  modelExecutor?.isError?.value || jobStatus?.isError?.value || jobResults?.isError?.value || jobEndedUnsuccessfully.value)

const execError = computed(() =>
  modelExecutor?.error?.value || jobStatus?.error?.value || jobResults?.error?.value ||
  (jobEndedUnsuccessfully.value ? new Error(`job ${jobId.value} ${jobStatus.data?.value?.status}`) : undefined))

watchEffect(() => {
  if (execError?.value) {
    console.error(execError?.value)
  }
  if (processDescription?.error?.value) {
    console.error('[useProcessDescription] failed to load schema:', processDescription.error.value)
  }
})
</script>

<style scoped>
.exec-view-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  background: var(--color-bg-darker);
}

.exec-title-container {
  display: flex;
  padding: 24px 32px;
  flex-direction: column;
  align-items: flex-end;
  gap: 18px;
  align-self: stretch;
  background-color: var(--color-bg-white);
}

.exec-title-content {
  display: flex;
  align-items: center;
  gap: 24px;
  align-self: stretch;
}

.exec-title-content-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.exec-title {
  color: var(--color-text-regular);
}

.exec-content {
  display: flex;
  min-height: 736px;
  padding-bottom: 32px;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  align-self: stretch;
}

.exec-executions-content {
  display: flex;
  padding: 24px 32px;
  align-items: flex-end;
  gap: 29px;
  align-self: stretch;
}

.exec-config-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  border-radius: 8px;
  border: 1px solid var(--color-divider);
  background: var(--color-bg-white);
}

.exec-config-card-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 24px 24px 16px 24px;
}

.exec-config-card-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  align-self: stretch;
  gap: 8px;
}

.exec-config-card-title-icon {
  background-color: var(--color-button-regular);
}

.exec-config-card-title-text {
  color: var(--color-text-regular);
}

.exec-config-card-title-subtext {
  color: var(--color-text-muted);
  word-break: break-word;
}

.exec-config-card-content {
  display: flex;
  padding: 16px 18px 32px 18px;
  flex-direction: column;
  gap: 24px;
  align-items: stretch;
  align-self: stretch;
}

.exec-config-card-buttons {
  display: flex;
  padding: 16px 32px 8px 32px;
  justify-content: center;
  align-items: center;
  gap: 16px;
  align-self: stretch;
  border-top: 1px solid var(--color-divider);
}

.exec-execute-button {
  flex: 1;
  justify-content: center;
}

.exec-config-card-results-container {
  align-self: stretch;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--color-divider);
}

.exec-config-card-results {
  display: flex;
  flex-direction: column;
  align-self: stretch;
  align-items: flex-start;
  gap: 8px;
  padding: 16px 24px 16px 16px;
  border-radius: 8px;
}

.exec-text {
  flex: 1;
  word-break: break-word;
  color: var(--color-text-regular);
}

.exec-loading {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--color-info-700);
  background: var(--color-info-400);
}

.exec-loading-icon {
  height: 24px;
  width: 24px;
  margin: 0;
}

.exec-error {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--color-warning-700);
  background: var(--color-warning-400);
}

.exec-error-icon {
  width: 24px;
  height: 24px;
  background-color: var(--color-danger-700);
}

.exec-success {
  border: 1px solid var(--color-success-700);
  background: var(--color-success-400);
}

.exec-success-title {
  display: flex;
  align-items: center;
  align-self: stretch;
  gap: 8px;
  color: var(--color-text-muted)
}

.exec-success-result {
  color: var(--color-text-regular);
}

.exec-success-icon {
  height: 24px;
  width: 24px;
  background-color: var(--color-success-700)
}

@media screen and (min-width: 1024px) {
  .exec-config-card {
    width: fit-content;
    max-width: 50%;
  }
}

.exec-dataset-picker-trigger {
  display: flex;
  padding: 12px 32px;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  border-top: 1px solid var(--color-divider);
  border-bottom: 1px solid var(--color-divider);
}

.exec-dataset-picker-trigger-button {
  flex: 1;
  justify-content: center;
}
</style>