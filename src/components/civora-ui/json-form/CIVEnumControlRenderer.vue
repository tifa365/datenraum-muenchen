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
<template>
  <div v-if="control.visible" class="control">
    <CIVDropdownSelect
      :id="control.id"
      :label="label"
      :items="items"
      :selectedItems="selectedItems"
      :transform="transform"
      :helperText="helperText"
      :isError="hasErrors"
      :disabled="!control.enabled"
      :closeOnSelect="true"
      :isMultiSelect="false"
      @update:selectedItems="onSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsEnumControl } from '@jsonforms/vue'
import CIVDropdownSelect from '@/components/civora-ui/CIVDropdownSelect.vue'

const props = defineProps({ ...rendererProps<ControlElement>() })
const { control, handleChange } = useJsonFormsEnumControl(props)

const items = computed(() => control.value.options?.map((o) => String(o.value)) ?? [])
const selectedItems = computed(() =>
  control.value.data === undefined || control.value.data === null ? [] : [String(control.value.data)],
)
const label = computed(() => control.value.label + (control.value.required ? ' *' : ''))
const hasErrors = computed(() => !!control.value.errors)
const helperText = computed(() => control.value.errors || control.value.description || '')

const transform = (item: string) =>
  control.value.options?.find((o) => String(o.value) === item)?.label ?? item

const onSelect = (selected: string[]) => {
  const option = control.value.options?.find((o) => String(o.value) === selected[0])
  handleChange(control.value.path, selected.length === 0 || !option ? undefined : option.value)
}
</script>
