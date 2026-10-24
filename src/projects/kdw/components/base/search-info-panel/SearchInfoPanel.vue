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
import Typography from '../typography/Typography.vue'
import SortSplitButton from '../../../components/sort-split-button/SortSplitButton.vue'

const sort = defineModel<string>('sort', { default: 'relevance' })
const direction = defineModel<string>('direction', { default: 'desc' })
</script>

<template>
  <section class="py-2 border-b border-b-bg-divider">
    <div class="flex flex-col gap-2 sm:flex-row sm:flex-nowrap sm:justify-between sm:items-center">
      <Typography
        as="h4"
        variant="header-4"
        class="leading-5">
        <slot />
      </Typography>
      <SortSplitButton
        v-model:direction="direction"
        v-model:sort="sort" />
    </div>
  </section>
</template>
