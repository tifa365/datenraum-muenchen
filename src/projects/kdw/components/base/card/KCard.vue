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
import Card, { type CardProps, type CardSlots } from 'primevue/card'
import { computed, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const myProps = defineProps<
  CardProps & {
    borderless?: boolean
  }
>()
const mySlots = defineSlots<CardSlots>()

const resolvedAttrs = computed(() => ({ ...useAttrs(), ...myProps }))

/**
 * @see https://tailwind.primevue.org/card/#presets.lara
 */
const pt = {
  root: {
    class: [
      'rounded-lg leading-7',
      {
        'border border-bg-divider': !myProps.borderless,
      },
      'bg-surface-0 dark:bg-surface-900',
      'text-content dark:text-surface-0',
    ],
  },
  body: {
    class: 'p-6',
  },
  title: {
    class: 'text-2xl font-medium mb-2',
  },
  subtitle: {
    class: ['font-normal', 'mb-2', 'text-surface-600 dark:text-surface-0/60'],
  },
  content: {
    class: 'py-5',
  },
  footer: {
    class: 'pt-5',
  },
}
</script>

<template>
  <Card
    v-bind="resolvedAttrs"
    :pt="pt"
    :pt-options="{ mergeSections: false, mergeProps: false }">
    <template
      v-for="(_, slot) of mySlots"
      #[slot]>
      <slot :name="slot" />
    </template>
  </Card>
</template>

<style scoped></style>
