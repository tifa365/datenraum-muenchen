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

<script lang="ts" setup>
import Panel, { type PanelProps } from 'primevue/panel';
import KCheckbox from '../checkbox/KCheckbox.vue'
import Typography from '../typography/Typography.vue'
import type { Facet } from '../../../utils/types'
import PhCaretDown from '~icons/ph/caret-down'

const props = defineProps<{
  title?: string
  facets: Facet[]
  wrapLabels?: boolean
}>()

defineSlots<{
  header: (props: { title?: string }) => any
}>()

const model = defineModel<any>()

const collapsed = defineModel<boolean>('collapsed')

const panelPreset = {
    header: ({ props }: { props: PanelProps }) => ({
        class: [
          // Flex
          'flex items-center justify-between',
          // Colors
          'text-surface-700 dark:text-surface-0/80',
          'bg-white dark:bg-surface-900',
          // 'border border-surface-200 dark:border-surface-700',
          //Shape
          'rounded-tl-lg rounded-tr-lg',
          // Conditional Spacing
          { 'pl-4 pt-4 py-6': props.toggleable }
        ]
    }),
    title: {
        class: 'leading-none font-bold'
    },
    toggler: {
        class: ['inline-flex items-center justify-center', 'relative', 'w-8 h-8', 'm-0 p-0', 'border-0 rounded-full', 'bg-transparent', 'text-surface-600 dark:text-surface-0/80', 'hover:text-surface-800 dark:hover:text-surface-0/80', 'hover:bg-surface-100 dark:hover:bg-surface-800/80', 'focus:outline-none focus:outline-offset-0 focus-visible:ring focus-visible:ring-primary-400/50 focus-visible:ring-inset dark:focus-visible:ring-primary-300/50', 'transition-all duration-200 ease-in-out', 'overflow-hidden no-underline', 'cursor-pointer']
    },
    togglerIcon: {
        class: 'inline-block'
    },
    content: {
        class: [
          // 'p-5',
          // 'border border-t-0 last:rounded-br-lg last:rounded-bl-lg',
          // 'border-surface-200 dark:border-surface-700',
          'bg-surface-0 dark:bg-surface-900',
          'text-surface-700 dark:text-surface-0/80'
        ]
    },
    footer: {
        class: ['py-3 p-5', 'border border-t-0 rounded-br-lg rounded-bl-lg', 'border-surface-200 dark:border-surface-700', 'bg-surface-0 dark:bg-surface-900', 'text-surface-700 dark:text-surface-0/80']
    },
    transition: {
        enterFromClass: 'max-h-0',
        enterActiveClass: 'overflow-hidden transition-[max-height] duration-1000 ease-[cubic-bezier(0.42,0,0.58,1)]',
        enterToClass: 'max-h-[1000px]',
        leaveFromClass: 'max-h-[1000px]',
        leaveActiveClass: 'overflow-hidden transition-[max-height] duration-[450ms] ease-[cubic-bezier(0,1,0,1)]',
        leaveToClass: 'max-h-0'
    }
}
</script>

<template>
  <Panel
    class="flex flex-col min-w-48 text-neutral"
    :pt="panelPreset"
    :pt-options="{ mergeSections: false, mergeProps: false }"
    toggleable
    v-model:collapsed="collapsed"
  >
    <template #header>
      <div class="flex flex-col justify-center gap-2 w-full">
        <slot
          name="header"
          :title="props.title">
          <Typography
            variant="header-4"
            class="flex flex-row justify-between">
            {{ title }}
            <!-- <PhCaretDown class="text-lg font-semibold" /> -->
          </Typography>
        </slot>
      </div>
    </template>
    <template #togglericon="{ collapsed }">
      <PhCaretDown
        class="text-lg font-semibold transition-transform duration-200 ease-in-out"
        :class="{
          'transform rotate-180': !collapsed
        }"
      />
    </template>
    <div class="flex-1">
      <ul class="flex flex-col">
        <li
          v-for="(facet, i) in facets"
          :key="i">
          <KCheckbox
            v-model="model"
            class="px-2 py-2 hover:bg-bg-darker"
            :input-id="facet.id"
            :name="facet.label"
            :value="facet.value || facet.id">
            <div class="flex min-w-0 flex-1 flex-row items-center justify-between gap-2">
              <div
                :title="facet.title || facet.label"
                class="min-w-0 flex-1"
                :class="props.wrapLabels ? 'whitespace-normal [overflow-wrap:anywhere]' : 'truncate'">
                {{ facet.label }}
              </div>
              <Typography as="div" variant="caption" class="shrink-0">
                {{ facet.count }}
              </Typography>
            </div>
          </KCheckbox>
        </li>
      </ul>
    </div>
  </Panel>
</template>
