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
    <CIVInput
      input-type="text"
      :label="label"
      :default-value="control.data ?? ''"
      :placeholder="appliedOptions.placeholder"
      :helper-text="helper"
      :is-error="hasError"
      :disabled="!control.enabled"
      @input-value="onInput"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue'
// @ts-expect-error CIVInput is a JS-flavoured SFC without type declarations.
import CIVInput from '@/components/civora-ui/CIVInput.vue'

const props = defineProps(rendererProps<ControlElement>())
const { control, handleChange } = useJsonFormsControl(props)

const appliedOptions = computed(() => (control.value.uischema.options ?? {}) as Record<string, string>)
const label = computed(() => (control.value.label ? control.value.label + (control.value.required ? ' *' : '') : ''))
const hasError = computed(() => !!control.value.errors)
const helper = computed(() => (hasError.value ? control.value.errors : control.value.description) || undefined)

const onInput = (value: string) => {
  handleChange(control.value.path, value === '' ? undefined : value)
}
</script>
