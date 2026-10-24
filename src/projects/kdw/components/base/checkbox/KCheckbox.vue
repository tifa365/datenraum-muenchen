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
import Checkbox, { type CheckboxProps } from 'primevue/checkbox'
import { h, useAttrs } from 'vue'

const myProps = defineProps<CheckboxProps>()
const myEmits = defineEmits<{
  'update:modelValue': [value: any]
  change: [event: Event]
  focus: [event: Event]
  blur: [event: Event]
}>()
defineSlots<{
  default: () => any
}>()
const attrs = useAttrs()

const preset = {
  root: {
    class: ['relative', 'inline-flex', 'align-bottom', 'cursor-pointer', 'select-none'],
  },
  box: ({ props, context }: { props: any; context: any }) => ({
    class: [
      // Alignment
      'flex',
      'items-center',
      'justify-center',
      // Size
      'w-6',
      'h-6',
      // Shape
      'rounded-md',
      'border-[3px]',
      // Colors
      {
        'border-neutral-icon bg-surface-0 dark:border-surface-700 dark:bg-surface-900': !context.checked,
        'border-primary-500 bg-primary-500 dark:border-primary-400 dark:bg-primary-400': context.checked,
      },
      // States
      {
        'peer-hover:border-primary-500 dark:peer-hover:border-primary-400': !props.disabled && !context.checked,
        'peer-hover:bg-primary-600 dark:peer-hover:bg-primary-300 peer-hover:border-primary-700 dark:peer-hover:border-primary-300':
          !props.disabled && context.checked,
        'peer-focus-visible:border-primary-500 dark:peer-focus-visible:border-primary-400 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-400/20 dark:peer-focus-visible:ring-primary-300/20':
          !props.disabled,
        'cursor-default opacity-60': props.disabled,
      },
      // Transitions
      'transition-colors',
      'duration-200',
    ],
  }),
  input: {
    class: [
      'peer',
      'w-full ',
      'h-full',
      'absolute',
      'top-0 left-0',
      'z-10',
      'p-0',
      'm-0',
      'opacity-0',
      'rounded-md',
      'outline-none',
      'border-2 border-surface-200 dark:border-surface-700',
      'appareance-none',
      'cursor-pointer',
    ],
  },
  icon: {
    class: [
      'text-base leading-none',
      'w-4',
      'h-4',
      'text-white dark:text-surface-900',
      'transition-all',
      'duration-200',
    ],
  },
}

function CheckboxFC() {
  return h(Checkbox, {
    ...attrs,
    ...myProps,
    pt: preset,
    ptOptions: { mergeSections: false, mergeProps: false },
    'onUpdate:modelValue': (value: any) => myEmits('update:modelValue', value),
    onChange: (event: Event) => myEmits('change', event),
    onFocus: (event: Event) => myEmits('focus', event),
    onBlur: (event: Event) => myEmits('blur', event),
  })
}
</script>

<template>
  <label
    :for="myProps.inputId"
    class="flex cursor-pointer items-center">
    <CheckboxFC />
    <div class="ml-2 flex-1 w-full min-w-0 cursor-pointer text-neutral">
      <slot />
    </div>
  </label>
</template>
