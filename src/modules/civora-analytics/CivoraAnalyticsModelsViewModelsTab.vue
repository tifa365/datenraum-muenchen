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
  <div>
    <div
      v-if="isLoading && !isError"
      class="app-message-container"
    >
      {{ $t('views.app.analytics.models.loading') }}
    </div>
    <div
      v-else-if="isError"
      class="app-message-container"
    >
      {{ $t('views.app.analytics.models.failed-to-load') }}
    </div>
    <div
      v-else-if="!isLoading && !isError"
      class="models-tab-content"
    >
      <div class="models-tab-filter-options-container">
      </div>

      <div class="model-cards-container">
        <CIVModelCard
          v-for="model in models"
          :key="model.id"
          :title="model.title"
          :rightButton="{
            iconPrefix: 'src/assets/icons/play.svg',
            label: $t('views.app.analytics.models.execute')
          }"
          @rightButtonClick="goToExecution(model.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useModels } from '@/composables/useModelCoordinator'
import CIVModelCard from './CIVModelCard.vue'

const router = useRouter()

const { isLoading, isError, error, models } = useModels()

function goToExecution(modelId) {
  router.push('/app/analytics/models/execute/' + modelId)
}
</script>

<style scoped>
.models-tab-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  align-self: stretch;
}

.models-tab-filter-options-container {
  display: flex;
  padding: 32px 0 16px 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
}

.model-cards-container {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  width: 100%;
  padding: 0 32px;
  align-items: center;
  gap: 24px;
}
</style>