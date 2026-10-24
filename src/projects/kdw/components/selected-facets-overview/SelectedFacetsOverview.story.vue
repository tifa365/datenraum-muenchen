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
import type { FacetList } from '../../utils/types'
import SelectedFacetsOverview from './SelectedFacetsOverview.vue'

const data = ref({
  categories: ['category1', 'category2'],
  publisher: ['publisher1', 'publisher2'],
  format: ['format1', 'format2'],
  catalog: ['catalog1', 'catalog2'],
  license: ['license1', 'license2'],
})

const facets = [
  {
    id: 'categories',
    label: 'Categories',
    items: [
      { id: 'category1', label: 'Category 1' },
      { id: 'category2', label: 'Category 2' },
    ],
  },
  {
    id: 'publisher',
    label: 'Publisher',
    items: [
      { id: 'publisher1', label: 'Publisher 1' },
      { id: 'publisher2', label: 'Publisher 2' },
    ],
  },
  {
    id: 'format',
    label: 'Format',
    items: [
      { id: 'format1', label: 'Format 1' },
      { id: 'format2', label: 'Format 2' },
    ],
  },
  {
    id: 'catalog',
    label: 'Catalog',
    items: [
      { id: 'catalog1', label: 'Catalog 1' },
      { id: 'catalog2', label: 'Catalog 2' },
    ],
  },
  {
    id: 'license',
    label: 'License',
    items: [
      { id: 'license1', label: 'License 1' },
      { id: 'license2', label: 'License 2' },
    ],
  },
] satisfies FacetList
</script>

<template>
  <Story title="Components/Facets/Selected Facets Overview">
    <SelectedFacetsOverview
      v-model="data"
      :facets="facets" />
  </Story>
</template>
