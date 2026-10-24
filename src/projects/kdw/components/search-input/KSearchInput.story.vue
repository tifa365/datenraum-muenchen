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
import KSearchInput from './KSearchInput.vue'

const cities = ref([
  { label: 'New York', value: 'NY' },
  { label: 'Rome', value: 'RM' },
  { label: 'London', value: 'LDN' },
  { label: 'Istanbul', value: 'IST' },
  { label: 'Paris', value: 'PRS' },
])

const input = ref('')
const select = ref('')

const placeholder = ref('Freetext search')
const selectPlaceholder = ref('Select a city')
</script>

<template>
  <Story title="Components/Search Input">
    <KSearchInput
      v-model="input"
      v-model:select="select"
      :placeholder="placeholder"
      :selectOptions="cities"
      :selectPlaceholder="selectPlaceholder" />
  </Story>
</template>

<style scoped></style>
