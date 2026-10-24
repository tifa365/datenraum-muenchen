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
import Chip from 'primevue/chip'
import { computed, toRefs, useAttrs } from 'vue'
import PhX from '~icons/ph/x'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  label?: string
  removable?: boolean
  outline?: boolean
  light?: boolean
  small?: boolean
}>()

const { small, light, outline } = toRefs(props)

const attrs = useAttrs()
const combinedAttrs = computed(() => {
  return {
    ...attrs,
    outline: props.outline,
    small: small.value,
  }
})

const preset = {
  root: () => ({
    class: [
      // Flexbox
      'inline-flex items-center',

      // Spacing
      {
        'px-2 py-2': !small.value,
        'px-1 py-1': small.value,
      },

      // Button
      {
        'cursor-pointer': props.removable,
        'focus:ring-primary-400/50': props.removable,
        'hover:bg-content-icon dark:hover:bg-surface-700': props.removable,
      },

      // Shape
      {
        'rounded-2xl': !small.value,
        'rounded-lg': small.value,
      },

      'text-content-lighter dark:text-white/70',
      // Colors
      {
        'bg-bg-divider dark:bg-surface-700': !light.value && !outline.value,
        'bg-bg-darker dark:bg-content-icon': light.value && !outline.value,
      },

      // Border
      {
        'border border-content-icon dark:border-surface-700': !outline.value && !light.value,
        'border border-bg-divider dark:border-surface-700': outline.value || light.value,
      },
    ],
  }),
  label: {
    class: 'leading-6 my-1.5 mx-0',
  },
  icon: {
    class: 'leading-6 mr-2',
  },
  image: {
    class: ['w-9 h-9 -ml-3 mr-2', 'rounded-full'],
  },
  removeIcon: {
    class: [
      // Shape
      'rounded-md leading-6',

      // Spacing
      'ml-2',

      // Size
      'w-4 h-4',

      // Transition
      'transition duration-200 ease-in-out',

      // Misc
      'cursor-pointer',
    ],
  },
}
</script>

<template>
  <Chip
    v-bind="combinedAttrs"
    :pt="preset"
    :pt-options="{ mergeSections: false, mergeProps: false }">
    <div class="flex flex-nowrap gap-1 items-center">
      <PhX v-if="props.removable" />
      <slot>{{ props.label }}</slot>
    </div>
  </Chip>
</template>
