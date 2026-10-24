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
import { ref } from 'vue'
import type { SelectOptionList } from '../../../utils/types'
import SearchInfoPanel from './SearchInfoPanel.vue'

const selectOptions = ref([
  { label: 'Name', value: 'name' },
  { label: 'Modified', value: 'modified' },
  { label: 'Created', value: 'created' },
] satisfies SelectOptionList)

const selected = ref('modified')
</script>

<template>
  <Story title="Components/Search Info Panel">
    <SearchInfoPanel
      v-model="selected"
      select-placeholder="Select a city"
      :select-options="selectOptions">
      12/24 Datensets
    </SearchInfoPanel>
  </Story>
</template>
