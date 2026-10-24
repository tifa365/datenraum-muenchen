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
  <div v-if="isVisible" class="info-banner">
    <div v-if="hasStatusIcon" class="info-banner-icon"></div>

    <div v-if="iconLeft" class="icon-left">
      <div class="icon-inside"></div>
    </div>

    <div class="info-banner-main" :class="`${layout}-line`">
      <template v-if="layout === 'multi'">
        <p v-if="badge" class="title-sm badge">{{ badge }}</p>
        <p v-if="title" class="title-md info-banner-title">{{ title }}</p>
        <p v-if="label" class="body-md label">{{ label }}</p>
      </template>

      <p class="info-banner-text" :class="layout === 'single' ? 'body-md' : 'body-lg'">{{ text }}</p>

      <slot v-if="hasActionButtons" name="actionButtons">
        <div class="info-banner-buttons">
          <CIVButton :size="layout === 'single' ? 'small' : 'medium'" :label="buttonText"
            @click="() => { emit('onSubmit') }" />
          <CIVButton v-if="linkPath" class="link-button" type="tertiary"
            :size="layout === 'single' ? 'small' : 'medium'" :label="linkText"
            iconSuffix="/src/assets/icons/ArrowRight.svg" @click="() => { $router.push(linkPath) }">
          </CIVButton>
        </div>
      </slot>
    </div>

    <img v-if="hasCloseButton" class="close-btn" src="../../assets/icons/Xmark.svg" alt="Close" @click="handleClose" />
  </div>
</template>

<script setup>
import CIVButton from './CIVButton.vue'
import { ref } from 'vue'

const bannersList = {
  info: {
    icon: 'src/assets/icons/info-banner.svg',
    iconColor: 'var(--color-info-700)',
    backgroundColor: 'var(--color-info-400)',
    borderColor: 'var(--color-info-500)',
  },
  success: {
    icon: 'src/assets/icons/Success.svg',
    iconColor: 'var(--color-success-700)',
    backgroundColor: 'var(--color-success-400)',
    borderColor: 'var(--color-success-500)',
  },
  warning: {
    icon: 'src/assets/icons/Warning.svg',
    iconColor: 'var(--color-warning-700)',
    backgroundColor: 'var(--color-warning-400)',
    borderColor: 'var(--color-warning-500)',
  },
  error: {
    icon: 'src/assets/icons/Error.svg',
    iconColor: 'var(--color-danger-700)',
    backgroundColor: 'var(--color-danger-400)',
    borderColor: 'var(--color-danger-500)',
  },
};

const emit = defineEmits(['onSubmit', 'onClose']);
const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (v) => ['info', 'success', 'warning', 'error'].includes(v),
  },
  layout: {
    type: String,
    default: 'single', // single | multi
    validator: (v) => ['single', 'multi'].includes(v),
  },
  text: String,
  title: String,
  label: String,
  badge: String,
  hasCloseButton: { type: Boolean, default: true },
  hasStatusIcon: { type: Boolean, default: true },
  iconLeft: { type: String, default: '' },
  hasActionButtons: { type: Boolean, default: false },
  buttonText: { type: String, default: 'Submit' },
  linkPath: String,
  linkText: { type: String, default: 'Link' },
})

const isVisible = ref(true)

const { backgroundColor, icon, iconColor, borderColor } = bannersList[props.type] 
const iconLeftUrl = `url(${props.iconLeft})`
const iconUrl = `url(${icon})`

const handleClose = () => {
  emit('onClose')
  isVisible.value = false
}
</script>

<style scoped lang="css">
.info-banner {
  display: flex;
  width: 100%;
  gap: 8px;
  border-radius: 4px;
  border: 1px solid v-bind(borderColor);
  background-color: v-bind(backgroundColor);
}

.info-banner:has(.single-line) {
  align-items: center;
  padding: 4px 12px;
}

.info-banner:has(.multi-line) {
  align-items: start;
  padding: 18.5px 12px;
}

.info-banner-icon {
  aspect-ratio: 1/1;
  background-color: v-bind(iconColor);
  mask: v-bind(iconUrl) center/cover no-repeat;
  -webkit-mask: v-bind(iconUrl) center/cover no-repeat;
}

.info-banner:has(.single-line) .info-banner-icon {
  min-width: 16px;
  max-width: 16px;
}

.info-banner:has(.multi-line) .info-banner-icon {
  min-width: 18px;
  max-width: 18px;
}

.icon-left {
  min-width: 32px;
  max-width: 32px;
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background-color: v-bind(borderColor);
}

.icon-left .icon-inside {
  min-width: 24px;
  max-width: 24px;
  aspect-ratio: 1/1;
  background-color: v-bind(iconColor);
  mask: v-bind(iconLeftUrl) center/contain no-repeat;
  -webkit-mask: v-bind(iconLeftUrl) center/contain no-repeat;
}

.info-banner-main {
  flex: 1;
  display: flex;
  gap: 4px;
}

.info-banner-main.single-line {
  align-items: center;
  justify-content: space-between;
}

.info-banner-main.multi-line {
  flex-direction: column;
}

.info-banner-buttons {
  display: flex;
  gap: 16px;
  align-items: center;
}

.info-banner-buttons .link-button {
  padding: 0;
}

.info-banner-main.multi-line .info-banner-buttons {
  margin-top: 12px;
}

.info-banner-text {
  color: var(--color-text-light);
}

.badge {
  width: max-content;
  padding: 5px 6px;
  border: 1.5px solid v-bind(borderColor);
  border-radius: 4px;
  color: v-bind(iconColor);
}

.info-banner-title {
  color: var(--color-text-regular);
}

.label {
  color: var(--color-neutral-600);
}

.close-btn {
  min-width: 24px;
  max-width: 24px;
  aspect-ratio: 1/1;
  cursor: pointer;
}
</style>
