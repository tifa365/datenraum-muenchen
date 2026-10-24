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
  <select
    v-model="selected"
    class="custom-dropdown">
    <option
      v-if="placeholder"
      :value="null"
      disabled
      hidden>
      {{ placeholder }}
    </option>
    <option
      v-for="(option, index) in items"
      :key="index"
      :value="option"
      class="custom-option">
      {{ option }}
    </option>
  </select>
</template>

<script setup>
import { ref, watchEffect } from 'vue'

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Placeholder',
  },
})

const selected = ref(null)
watchEffect(() => {
  emit('update:modelValue', selected.value)
})
</script>

<style scoped>
.custom-dropdown {
  width: 100%;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background: #fff;
  display: flex;
  height: 50px;
  padding: 6px 16px;
  align-items: center;
  gap: 8px;
  align-self: stretch;
  color: #667f93;
  font-family: var(--font-family), serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 26px;
}

.custom-option {
  color: #667f93;
  font-family: var(--font-family), serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 26px;
}
</style>
