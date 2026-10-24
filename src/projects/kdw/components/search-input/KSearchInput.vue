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
import InputText from 'primevue/inputtext'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import Dropdown from 'primevue/dropdown'
import type { SelectOptionList } from '../../utils/types'
import PhMagnifyingGlass from '~icons/ph/magnifying-glass'

const props = defineProps<{
  placeholder?: string
  selectPlaceholder?: string
  selectOptions?: SelectOptionList
  disableDropdown?: boolean
}>()

const searchValue = defineModel<string>()
const selectValue = defineModel<string>('select')
</script>

<template>
  <InputGroup>
    <InputGroupAddon>
      <PhMagnifyingGlass />
    </InputGroupAddon>
    <InputText
      v-model="searchValue"
      :placeholder="props.placeholder"
      size="small" />
    <Dropdown
      v-if="!props.disableDropdown"
      v-model="selectValue"
      :options="props.selectOptions"
      option-label="label"
      option-value="value"
      :placeholder="props.selectPlaceholder"
      class="md:w-[14rem] rounded-l-none" />
  </InputGroup>
</template>
