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
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import PhClock from '~icons/ph/clock'
import Typography from '@/projects/kdw/components/base/typography/Typography.vue'
import KTag from '@/projects/kdw/components/base/tag/KTag.vue'
import type { DatasetType } from '@/projects/kdw/utils/types'

const props = defineProps<{
  superTitle?: string
  title?: string
  text?: string
  formats?: string[]
  categories?: string[]
  issued?: string
  to?: RouteLocationRaw
  href?: string
  ghost?: boolean
  datasetType?: DatasetType
}>()

const computedWrapperComponent = computed(() => {
  return props.ghost ? 'div' : props.href ? 'a' : 'router-link'
})

const computedIconClass = computed(() => ({
  'icon-[ph--globe-hemisphere-west]': !props.datasetType || props.datasetType !== 'kritis',
  'icon-[ph--warning]': props.datasetType === 'kritis',
}))
</script>

<template>
  <component
    :is="computedWrapperComponent"
    :to="props.to || '/'"
    class="group relative flex flex-col md:flex-row justify-between cursor-pointer gap-4 lg:gap-8 overflow-clip rounded-lg border border-bg-divider bg-white p-4 transition-colors hover:bg-bg-hover focus:outline-none focus:outline-offset-0 focus:ring focus:ring-primary-400/50">
    <div class="flex gap-4">
      <div class="grid place-content-center text-content-icon">
        <slot name="icon">
          <i class="text-xl" :class="computedIconClass"></i>
        </slot>
      </div>
      <div class="flex-1">
        <slot>
          <div class="flex flex-col gap-6 text-content">
            <div class="w-full flex-1">
              <Typography
                as="p"
                variant="caption"
                class="text-neutral-lighter">
                {{ props.superTitle }}
              </Typography>
              <Typography
                as="p"
                variant="paragraph-1"
                class="group-hover:underline">
                {{ props.title }}
              </Typography>
            </div>
            <div class="flex flex-wrap gap-2">
              <KTag
                v-for="category in props.categories"
                :key="category"
                outline>
                {{ category }}
              </KTag>
            </div>
          </div>
        </slot>
      </div>
    </div>
    <div class="flex w-[130px] flex-none flex-col items-start gap-4 px-4 mt-2 md:mt-0">
      <div class="flex flex-nowrap items-center gap-2 text-content-icon">
        <PhClock />
        {{ props.issued }}
      </div>
      <div class="grid flex-1 flex-wrap place-content-center">
        <div class="flex flex-wrap gap-2 hidden md:flex">
          <KTag
            v-for="format in props.formats?.filter((format) => !!format)"
            :key="format"
            light
            small>
            {{ format }}
          </KTag>
        </div>
      </div>
    </div>
    <div
      v-if="props.ghost"
      class="absolute left-0 top-0 size-full bg-white">
      <div class="size-full animate-pulse bg-slate-200" />
    </div>
  </component>
</template>
