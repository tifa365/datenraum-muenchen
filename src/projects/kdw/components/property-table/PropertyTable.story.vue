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
import type { PropertyTableEntryNode } from '../../utils/types'
import PropertyTableRow from './PropertyTableRow.vue'

const data = ref([
  {
    type: 'node',
    id: 'formats',
    label: 'Formate',
    data: [
      {
        type: 'value',
        id: 'formatVal',
        data: ['CSV', 'JSON', 'XML'],
      },
    ],
  },
  {
    type: 'node',
    id: 'author',
    label: 'Autor',
    data: [
      {
        type: 'value',
        id: 'authorVal',
        data: 'Verfügbar',
      },
    ],
  },
  {
    type: 'node',
    id: 'createdAt',
    label: 'Erstellt am',
    data: [
      {
        type: 'value',
        id: 'createdAtVal',
        data: '26.11.2023',
      },
    ],
  },
  {
    type: 'node',
    id: 'updatedAt',
    label: 'Letzte Aktualisierung',
    data: [
      {
        type: 'value',
        id: 'updatedAtVal',
        data: '26.11.2023',
      },
    ],
  },
  {
    type: 'node',
    id: 'loremIpsum',
    label: 'Lorem Ipsum',
    data: [
      {
        type: 'value',
        id: 'loremVal',
        data: 'andere',
      },
    ],
  },
  {
    type: 'node',
    id: 'categories',
    label: 'Themen',
    data: [
      {
        type: 'value',
        id: 'categoriesVal',
        data: ['Verkehr', 'Umwelt', 'Energie', 'Bürger'],
      },
    ],
  },
  {
    type: 'node',
    id: 'loremIpsum2',
    label: 'Lorem Ipsum',
    data: [
      {
        type: 'value',
        id: 'lorem2Val',
        data: 'Lorem, ipsum',
      },
    ],
  },
] satisfies PropertyTableEntryNode[])
</script>

<template>
  <Story title="Components/Property Table">
    <div class="p-4 bg-white">
      <PropertyTableRow :data="data" />
    </div>
  </Story>
</template>

<style scoped></style>
