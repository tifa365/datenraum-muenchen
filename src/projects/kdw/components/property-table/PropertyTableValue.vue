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
import { computed } from 'vue';
import Typography from '../base/typography/Typography.vue'
import type { PropertyTableEntryHref, PropertyTableEntryValue } from '../../utils/types'

const props = defineProps<{
  data: PropertyTableEntryHref | PropertyTableEntryValue
}>()

const dataAsArray = computed(() => {
  if (Array.isArray(props.data.data)) {
    return props.data.data
  }
  return [props.data.data]
})
</script>

<template>
  <ul>
    <li v-if="dataAsArray.length <= 0">
      <Typography
        as="span"
        variant="caption">
          -
        </Typography>
    </li>
    <li
      v-for="(entry, i) in dataAsArray"
      :key="i">
      <template v-if="data.type === 'href' && typeof entry !== 'string' && typeof entry !== 'number'">
        <a
          :href="entry.href"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-600 underline">
          <Typography
            as="span"
            variant="caption"
            >{{ entry.label }}</Typography
          >
        </a>
      </template>
      <template v-else-if="data.type === 'value'">
        <Typography
          as="span"
          variant="caption">
          {{ entry ?? '-' }}
        </Typography>
      </template>
      <template v-else>
        <Typography
          as="span"
          variant="caption">
          {{ entry ?? '-' }}
        </Typography>
      </template>
    </li>
  </ul>
</template>

<style scoped></style>
