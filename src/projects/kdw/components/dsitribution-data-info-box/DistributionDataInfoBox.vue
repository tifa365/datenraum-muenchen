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
import type { MenuItem } from 'primevue/menuitem'
import Typography from '../base/typography/Typography.vue'
import KButton from '../base/button/KButton.vue'
import KSplitButton from '../base/split-button/KSplitButton.vue'
import PropertyTableRow from '../property-table/PropertyTableRow.vue'
import KTag from '../base/tag/KTag.vue'
import type { DistributionDataInfoBoxProps } from './shared'

const props = defineProps<DistributionDataInfoBoxProps>()

const downloadUrls = computed<MenuItem[]>(() => {
  return (
    props.downloadUrls?.map((url) => ({
      label: url,
      command: () => window.open(url, '_blank'),
    })) ?? []
  )
})

const accessUrls = computed<MenuItem[]>(() => {
  return (
    props.accessUrls?.map((url) => ({
      label: url,
      command: () => window.open(url, '_blank'),
    })) ?? []
  )
})
</script>

<template>
  <div class="relative">
    <div class="flex flex-col gap-12 py-12">
      <section
        name="header"
        class="flex flex-row flex-nowrap justify-between">
        <slot name="title">
          <Typography
            as="h4"
            variant="header-4"
            class="text-primary">
            {{ title ?? id }}
          </Typography>
        </slot>
        <div
          v-if="!!format"
          class="hidden md:block">
          <slot name="format">
            <KTag
              small
              :label="format" />
          </slot>
        </div>
      </section>
      <section
        name="body"
        class="flex flex-col gap-4 md:flex-row md:gap-12">
        <div class="flex w-full flex-col gap-4 md:w-2/3">
          <slot name="description">
            <Typography
              as="div"
              variant="caption"
              class="prose">
              {{ description }}
            </Typography>
          </slot>
          <div
            v-if="!!format"
            class="block md:hidden">
            <slot name="format">
              <KTag
                small
                :label="format" />
            </slot>
          </div>
        </div>
        <div v-if="properties && properties.length > 0">
          <PropertyTableRow :data="properties" />
        </div>
      </section>
      <section
        name="actions"
        class="flex flex-col gap-4 xl:flex-row">
        <div v-if="downloadUrls.length > 0">
          <KSplitButton
            label="Zum Download"
            outlined
            severity="secondary"
            :model="downloadUrls"
            @click="downloadUrls[0].command">
            <template #icon>
              <span class="icon-[ph--download] mr-2" />
            </template>
          </KSplitButton>
        </div>
        <div v-if="accessUrls.length > 0">
          <KSplitButton
            label="Zugang"
            outlined
            severity="secondary"
            :model="accessUrls"
            @click="accessUrls[0].command">
            <template #icon>
              <span class="icon-[ph--arrow-square-out] mr-2" />
            </template>
          </KSplitButton>
        </div>
        <div>
          <KButton
            outlined
            severity="secondary"
            label="Beschreibung speichern" />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped></style>
