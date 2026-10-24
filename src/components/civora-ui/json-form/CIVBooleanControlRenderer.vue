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
  <div class="control">
    <CIVToggle
      :model-value="control.data === true"
      :label="label"
      :description="control.description"
      :disabled="!control.enabled"
      @update:model-value="onChange"
    />
    <p v-if="control.errors" class="body-sm control-error">{{ control.errors }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue'
import CIVToggle from '@/components/civora-ui/CIVToggle.vue'

const props = defineProps(rendererProps<ControlElement>())
const { control, handleChange } = useJsonFormsControl(props)

const label = computed(() => control.value.label + (control.value.required ? ' *' : ''))

function onChange(value: boolean) {
  handleChange(control.value.path, value)
}
</script>

<style scoped>
.control-error {
  margin: 4px 0 0;
  color: var(--color-danger-700);
}
</style>
