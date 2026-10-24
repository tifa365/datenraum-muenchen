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
  <router-link
    v-if="routeTo && !props.disabled"
    :to="routeTo"
    :class="['button-container', buttonStyle, buttonSize, { disabled: props.disabled }]">
    <div class="button-content">
      <CIVMaskedIcon
        class="masked-icon"
        v-if="prefix"
        :svgIcon="prefix"
      />
      <span :class="{ 'capitalize-text': capitalizeText }">{{ buttonText }}</span>
      <CIVMaskedIcon
        class="masked-icon"
        v-if="suffix"
        :svgIcon="suffix"
      />
    </div>
  </router-link>
  <a
    v-else-if="linkTo && !props.disabled"
    :class="['button-container', buttonStyle, buttonSize, { disabled: props.disabled }]"
    :href="linkTo"
    >
    <div class="button-content">
      <CIVMaskedIcon
        class="masked-icon"
        v-if="prefix"
        :svgIcon="prefix"
      />
      <span :class="{ 'capitalize-text': capitalizeText }">{{ buttonText }}</span>
      <CIVMaskedIcon
        class="masked-icon"
        v-if="suffix"
        :svgIcon="suffix"
      />
    </div>
  </a>
  <div
    v-else
    :class="['button-container', buttonStyle, buttonSize, { disabled: props.disabled }]"
    @click="handlePress">
    <div class="button-content">
      <CIVMaskedIcon
        class="masked-icon"
        v-if="prefix"
        :svgIcon="prefix"
      />
      <span :class="{ 'capitalize-text': capitalizeText }">{{ buttonText }}</span>
      <CIVMaskedIcon
        class="masked-icon"
        v-if="suffix"
        :svgIcon="suffix"
      />
    </div>
  </div>
</template>

<script setup>
import CIVMaskedIcon from '@/components/civora-ui/CIVMaskedIcon.vue'

const props = defineProps({
  buttonText: {
    type: String,
    required: true,
  },
  capitalizeText: {
    type: Boolean,
    required: false,
    default: false,
  },
  prefix: {
    type: String,
    required: false,
  },
  suffix: {
    type: String,
    required: false,
  },
  buttonStyle: {
    type: String,
    required: false,
    default: 'primary',
  },
  buttonSize: {
    type: String,
    required: false,
    default: 'medium',
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  routeTo: {
    type: [String, Object],
    required: false,
    default: '',
  },
  linkTo: {
    type: String,
    required: false,
    default: ''
  },
  pressed: {
    type: Function,
    required: false,
    default: null,
  },
})

const handlePress = (event) => {
  if (props.disabled) return
  if (props.pressed) {
    props.pressed()
  } else {
    console.log('button pressed!')
  }
}
</script>

<style scoped>
.capitalize-text {
  text-transform: uppercase;
}

.button-container {
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  width: max-content;
  display: inline-flex;
  padding: 0 16px;
  justify-content: center;
  align-items: center;
  font-family: var(--font-family), serif;
  gap: 8px;
  flex-shrink: 0;
  border-radius: 8px;
  transition:
    background 0.3s,
    border-color 0.3s,
    color 0.3s;
}

.primary {
  background: var(--color-primary-500);
  color: white;
}

.primary:active {
  background: #0f3177;
}

.primary.disabled {
  color: white;
  background: #667f93;
  cursor: not-allowed;
  pointer-events: none;
}

.primary .masked-icon {
  background-color: white;
}

.secondary {
  background: var(--color-bg-dark);
  color: var(--color-primary-500);
}

.secondary:active {
  background: #b3bacf;
}

.secondary.disabled {
  background: #b6eafa;
  color: var(--color-primary-500);
  cursor: not-allowed;
  pointer-events: none;
}

.secondary .masked-icon {
  background-color: var(--color-primary-500);
}

.outline {
  background: white;
  color: var(--color-primary-500);
  outline: unset !important;
  border: 1px solid var(--color-primary-500);
}

.outline:active {
  background: #e7eaf3;
}

.outline.disabled {
  background: white;
  color: var(--color-primary-500);
  cursor: not-allowed;
  pointer-events: none;
  outline: unset !important;
}

.outline .masked-icon {
  background-color: var(--color-primary-500);
}

.text {
  background: transparent;
  color: var(--color-primary-500);
  border: none;
}

.text:active {
  background: rgba(22, 65, 148, 0.1);
}

.text .masked-icon {
  background-color: var(--color-primary-500);
}

/* Button sizes */
.small {
  height: 32px;
  padding: 0 12px;
  font-size: 14px;
}

.medium {
  height: 40px;
  padding: 0 16px;
  font-size: 16px;
}

.large {
  height: 48px;
  padding: 0 24px;
  font-size: 18px;
}

.button-content {
  display: flex;
  gap: 8px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
