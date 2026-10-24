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
import { computed, ref } from 'vue'
import { clsx } from 'clsx'
import ToggleButton from 'primevue/togglebutton'
import InputGroup from 'primevue/inputgroup'
import Dropdown from 'primevue/dropdown'
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const sortDirection = defineModel<string>('direction', { default: 'desc' })
const sortDirectionClass = computed(() =>
  clsx([
    'mr-2',
    {
      'icon-[ph--arrow-up]': sortDirection.value === 'asc',
      'icon-[ph--arrow-down]': sortDirection.value === 'desc',
    },
  ])
)
const checked = computed({
  get() {
    return sortDirection.value === 'asc'
  },
  set(value: boolean) {
    sortDirection.value = value ? 'asc' : 'desc'
  },
})

const sortOptions = computed(() => [
  { name: t('kdw.components.sort-split-button.SortSplitButton.sortOptions.modified'), id: 'modified' },
  { name: t('kdw.components.sort-split-button.SortSplitButton.sortOptions.relevance'), id: 'relevance' },
  { name: t('kdw.components.sort-split-button.SortSplitButton.sortOptions.title'), id: 'title.de' },
  { name: t('kdw.components.sort-split-button.SortSplitButton.sortOptions.issued'), id: 'issued' },
])
const sort = defineModel<string>('sort', { default: 'modified' })
</script>

<template>
  <div class="relative">
    <InputGroup class="w-full">
      <Dropdown
        v-model="sort"
        :options="sortOptions"
        option-label="name"
        option-value="id"
        placeholder="Select a City"
        class="w-full md:w-[14rem] items-center">
        <template #dropdownicon>
          <i class="icon-[ph--caret-down]" />
        </template>
      </Dropdown>
      <ToggleButton
        v-model="checked"
        :off-label="t('kdw.components.sort-split-button.SortSplitButton.toggleButton.descending')"
        :on-label="t('kdw.components.sort-split-button.SortSplitButton.toggleButton.ascending')"
        class="border-r-0 rounded-r-none">
        <template #icon>
          <i :class="sortDirectionClass" />
        </template>
      </ToggleButton>
    </InputGroup>
  </div>
</template>

<style scoped></style>
