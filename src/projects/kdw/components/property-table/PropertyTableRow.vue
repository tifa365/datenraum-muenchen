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
import type { DefineComponent } from 'vue'
import { computed, defineAsyncComponent } from 'vue'
import clsx from 'clsx'
import Typography from '../base/typography/Typography.vue'
import type { PropertyTableEntry } from '../../utils/types'
import PropertyTableValue from './PropertyTableValue.vue'

defineOptions({
  name: 'RecursiveRow',
})

const props = defineProps<
  Props & {
    child?: boolean
  }
>()

interface Props {
  data: PropertyTableEntry[] | PropertyTableEntry
}

const PropertyTableRowRecursive = defineAsyncComponent<DefineComponent<Props>>(
  // eslint-disable-next-line import/no-self-import
  () => import('./PropertyTableRow.vue') as any
)

const computedContainerClasses = computed(() =>
  clsx(['flex flex-col', { 'w-full gap-2': props.child, 'gap-6 md:gap-12': !props.child }])
)

const computedRowClasses = computed(() =>
  clsx([
    {
      'flex flex-row flex-nowrap items-baseline gap-2 w-full': props.child,
      'text-left w-full flex flex-row sm:flex-col flex-nowrap items-baseline': !props.child,
    },
  ])
)

const computedHeadingClasses = computed(() =>
  clsx([
    {
      'flex-none w-1/2 md:w-1/4': props.child,
      'text-left sm:w-full w-1/2 flex-none text-wrap mb-2 md:mb-0': !props.child,
    },
  ])
)
</script>

<template>
  <div :class="computedContainerClasses">
    <div
      v-for="(entry, idx) in Array.isArray(data) ? data : [data]"
      :key="idx"
      :class="computedRowClasses">
      <template v-if="entry?.type === 'node'">
        <slot
          name="data"
          :data="entry"
          :idx="idx"
          :literal="false">
          <Typography
            as="div"
            :variant="child ? 'paragraph-2' : 'paragraph-1'"
            :class="computedHeadingClasses">
            {{ entry.label }}
          </Typography>
        </slot>
        <PropertyTableRowRecursive
          v-if="!!entry.data"
          child
          :data="entry.data">
          <template #data="{ data: recData, idx: recId, literal: recLiteral }">
            <slot
              name="data"
              :data="recData"
              :idx="recId"
              :literal="recLiteral" />
          </template>
        </PropertyTableRowRecursive>
      </template>
      <template v-else-if="!!entry">
        <slot
          name="data"
          :data="entry"
          :idx="idx"
          :literal="true">
          <PropertyTableValue :data="entry" />
        </slot>
      </template>
    </div>
  </div>
</template>
