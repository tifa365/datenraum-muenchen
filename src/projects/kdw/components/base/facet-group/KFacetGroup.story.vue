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

<script lang="ts" setup>
import { ref } from 'vue'
import type { Facet } from '../../../utils/types'
import KFacetGroup from './KFacetGroup.vue'

const facets = ref([
  {
    id: 'sci',
    label: 'Wissenschaft und Technologie',
    count: 1280,
  },
  {
    id: 'art',
    label: 'Kunst und Kultur',
    count: 700,
  },
  {
    id: 'pol',
    label: 'Politik und Gesellschaft',
    count: 23,
  },
  {
    id: 'spo',
    label: 'Sport und Freizeit',
    count: 12,
  },
  {
    id: 'wir',
    label: 'Wirtschaft und Recht',
    count: 3,
  },
] satisfies Facet[])
const items = ref([])
</script>

<template>
  <Story title="Components/Facets/Facet Group">
    <div class="flex flex-col gap-4 bg-white max-w-[20rem]">
      <KFacetGroup
        v-model="items"
        title="Kategorien"
        :facets="facets" />
      <div>{{ items }}</div>
    </div>
  </Story>
</template>
