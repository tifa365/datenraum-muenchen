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
  <div class="civ-toggle-container"
    :class="{
      'civ-toggle--small': size === 'small',
      'civ-toggle--large': size === 'large',
    }"
  >
    <button
      type="button"
      class="civ-toggle"
      :class="{ 'civ-toggle--on': modelValue }"
      role="switch"
      :aria-checked="modelValue"
      :aria-labelledby="resolvedAriaLabelledBy"
      :aria-label="resolvedAriaLabel"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="civ-toggle-thumb" />
    </button>
    <div class="civ-toggle-label-container">
      <span v-if="label"
        :id="labelId"
        class="civ-toggle-label body-lg"
        :class="{
          'label-md': size === 'small',
          'body-lg': size === 'large'
        }"
      >
        {{ label }}
      </span>
      <span v-if="description"
        class="civ-toggle-description"
        :class="{
          'label-md': size === 'small',
          'body-md': size === 'large'
        }"
      >
        {{ description }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

const labelId = useId()

const modelValue = defineModel<boolean>({ required: true })

const props = withDefaults(defineProps<{
  ariaLabelledBy?: string
  ariaLabel?: string
  label?: string
  description?: string
  size?: 'small' | 'large'
  disabled?: boolean
}>(), {
  size: 'large',
})

const resolvedAriaLabelledBy = computed(() => {
  if (props.ariaLabelledBy) return props.ariaLabelledBy
  if (props.ariaLabel) return undefined
  return props.label ? labelId : undefined
})

const resolvedAriaLabel = computed(() => (props.ariaLabelledBy ? undefined : props.ariaLabel))

function toggle() {
  modelValue.value = !modelValue.value
}
</script>

<style scoped>
.civ-toggle-container {
  display: inline-flex;
  flex-direction: row;
  gap: 12px;
}

.civ-toggle-container.civ-toggle--small {
  align-items: center;
}

.civ-toggle-container.civ-toggle--large {
  align-items: flex-start;
}

.civ-toggle {
  flex: 0 0 auto;
  width: 32px;
  height: 20px;
  border-radius: 999px;
  border: none;
  background-color: var(--color-icons);
  padding: 2px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.civ-toggle--on {
  background-color: var(--color-primary-500);
}

.civ-toggle:disabled {
  cursor: not-allowed;
  background-color: var(--color-divider);
}

.civ-toggle--large .civ-toggle {
  width: 32px;
  height: 20px;
}

.civ-toggle--small .civ-toggle {
  width: 24px;
  height: 16px;
}

.civ-toggle-thumb {
  display: block;
  border-radius: 50%;
  background-color: var(--color-bg-white);
  transition: transform 0.15s ease;
}

.civ-toggle--large .civ-toggle-thumb {
  width: 16px;
  height: 16px;
}

.civ-toggle--small .civ-toggle-thumb {
  width: 12px;
  height: 12px;
}

.civ-toggle--large .civ-toggle--on .civ-toggle-thumb {
  transform: translateX(12px);
}

.civ-toggle--small .civ-toggle--on .civ-toggle-thumb {
  transform: translateX(8px);
}

.civ-toggle-label-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
}

.civ-toggle-label {
  color: var(--color-text-neutral);
}

.civ-toggle-description {
  color: var(--color-text-muted);
}


</style>
