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
import KButton from '@/projects/kdw/components/base/button/KButton.vue'
import Typography from '@/projects/kdw/components/base/typography/Typography.vue'
import Card from '@/components/civora-ui/CIVTransparentCard.vue'
import appConfig from "../../../../../config/appConfig"
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ref, computed } from 'vue'
import { usePermissions } from '@/composables/useAccessPermissions'
import CIVButton from '@/components/civora-ui/CIVButton.vue'

const { t } = useI18n()
const router = useRouter()
const { canCreateInAnyCatalog } = usePermissions()

const headlineImageSource = `config/${appConfig.customer.name}/assets/images/${appConfig.components.headerImageFileName}`

const useNewCivoraUi = computed(() => appConfig.customer.useNewCivoraUi === 'true')

defineProps<{
  authenticated?: boolean
}>()

const dpiRoute = computed(() => {
  return appConfig.civoraDpiUrl ? '/civora-dpi' : '/dpi/datasets'
})

const contentRowStyle = {
  padding: '32px 24px',
  margin: '42px 62px'
}
</script>

<template>
  <div class="header-container relative flex flex-col flex-nowrap overflow-hidden view-header-background" :style="{
    'background-image': 'url(' + headlineImageSource + ')',
  }">
    <Card :cardClass="'custom-content-row'" :cardStyle="contentRowStyle">
      <div name="desc" class="z-10 flex max-w-full flex-1 flex-col gap-8">
        <h1 class="title display-sm">
          {{ t('kdw.components.headline.KHeadline.datacatalog') }}
        </h1>
        <h6 class="subtitle body-lg">
          {{ t('kdw.components.headline.KHeadline.datacatalog-text') }}
        </h6>
      </div>
      <div v-if="useNewCivoraUi && authenticated" name="buttons" class="button-container">
        <CIVButton
          size="medium"
          type="hero-secondary"
          icon-prefix="/src/assets/icons/ArrowRight.svg"
          @click="router.push('data-catalog/organisation-data')"
          :label="t('kdw.components.headline.KHeadline.organizationData')"
        />
        <CIVButton
          size="medium"
          type="hero-primary"
          :disabled="!canCreateInAnyCatalog()"
          icon-prefix="/src/assets/icons/ArrowRight.svg"
          @click="router.push(dpiRoute)"
          :label="t('kdw.components.headline.KHeadline.newData')"
        />
      </div>
      <div v-else name="buttons" class="z-10 mt-10 flex flex-wrap flex-none cos-k-button-container"
        :class="{ 'invisible': !authenticated }">
        <KButton class="cos-k-button cos-k-button-large cos-k-button-secondary" severity="secondary"
          :label="t('kdw.components.headline.KHeadline.organizationData')"
          @click="router.push('data-catalog/organisation-data')">
          <template v-slot:icon>
            <div class="masked-icon-secondary"></div>
          </template>
        </KButton>
        <KButton class="cos-k-button cos-k-button-large cos-k-button-primary" to="/datasets"
          :disabled="!canCreateInAnyCatalog()"
          :label="t('kdw.components.headline.KHeadline.newData')" @click="router.push(dpiRoute)">
          <template v-slot:icon>
            <div class="masked-icon-primary"></div>
          </template>
        </KButton>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.custom-content-row {
  flex-direction: column !important;
  justify-content: space-between !important;
  align-items: flex-start !important;
  width: calc(100% - 64px) !important;
  margin: 42px 32px !important;
}

.title {
  color: var(--hero-card-header-text-primary-color);
}

.subtitle {
  color: var(--hero-card-header-text-secondary-color);
  text-align: justify;
}

.button-container {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  z-index: 10;
  margin-top: 2.5rem;
  gap: 32px;
}

.cos-k-button-container {
  gap: 32px;
}

.cos-k-button {
  display: flex;
  gap: 8px;
}
.cos-k-button-primary {
  background-color: var(--color-button-regular);
  color: var(--color-button-text);
  border: 2px solid var(--color-button-regular);
}
.cos-k-button-primary:hover {
  background-color: var(--color-button-hover);
  border-color: var(--color-button-hover);
}
.cos-k-button-primary:active {
  background-color: var(--color-button-pressed);
  border-color: var(--color-button-pressed);
}
.cos-k-button-secondary {
  background-color: var(--color-button-text);
  color: var(--color-button-regular);
  border: 2px solid var(--color-button-regular);
}
.cos-k-button-secondary:hover {
  background-color: var(--color-button-text);
  border-color: var(--color-button-hover);
  box-shadow: -1px 1px 8px 0 rgba(0, 0, 0, 0.31) inset;
}
.cos-k-button-secondary:active {
  background-color: var(--color-button-text);
  border-color: var(--color-button-pressed);
  box-shadow: none;
}
.cos-k-button-large {
  padding: 14px 16px;
}

.masked-icon-primary {
  mask: url(@/assets/icons/ArrowRight.svg);
  mask-size: contain;
  mask-repeat: no-repeat;
  background-color: var(--color-button-text);
  width: 24px;
  height: 24px;
}

.masked-icon-secondary {
  mask: url(@/assets/icons/ArrowRight.svg);
  mask-size: contain;
  mask-repeat: no-repeat;
  background-color: var(--color-button-regular);
  width: 24px;
  height: 24px;
}

@media (max-width: 768px) {
  .custom-content-row {
    margin: 20px auto !important;
    padding: 24px !important;
  }

  .title {
    text-align: center;
  }

  .subtitle {
    text-align: center;
    max-width: 100%;
  }

  .cos-k-button-container {
    gap: 16px;
    margin-top: 20px;
    justify-content: center;
    align-self: center;
  }
}

@media (max-width: 480px) {
  .custom-content-row {
    margin: 10px auto !important;
    padding: 16px !important;
  }

  .title {
    font-size: 28px;
    line-height: 36px;
  }

  .cos-k-button-container {
    flex-direction: column;
    width: 100%;
  }

  .cos-k-button {
    width: 100%;
  }
}
</style>
