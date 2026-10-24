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
import DistributionDataInfoBoxList from './DistributionDataInfoBoxList.vue'
import type { DistributionViewModel } from './shared'

const list = ref<DistributionViewModel[]>([
  {
    id: 'schulstandorte',
    title: 'Schulstandorte in Bayern',
    description:
      'Darstellung der Schulstandorte in Bayern auf Basis der postalischen Adressen mit Sachinformationen zum Schulnamen, zur Schulart sowie zu den Kommunikations- und Verwaltungsdaten',
    format: 'WFS',
    properties: [
      {
        type: 'node',
        id: 'updatedAt',
        label: 'Aktualisiert',
        data: [
          {
            type: 'value',
            id: 'updatedAtVal',
            data: '23.02.2023',
          },
        ],
      },
      {
        type: 'node',
        id: 'license',
        label: 'Lizenz',
        data: [
          {
            type: 'href',
            id: 'licenseVal',
            data: [
              {
                href: 'http://www.opendefinition.org/licenses/cc-by',
                label: 'CC BY (Creative Commons Namensnennung)',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'schulstandorte',
    title: 'Schulstandorte in Bayern',
    description:
      'Darstellung der Schulstandorte in Bayern auf Basis der postalischen Adressen mit Sachinformationen zum Schulnamen, zur Schulart sowie zu den Kommunikations- und Verwaltungsdaten',
    format: 'WFS',
    properties: [
      {
        type: 'node',
        id: 'updatedAt',
        label: 'Aktualisiert',
        data: [
          {
            type: 'value',
            id: 'updatedAtVal',
            data: '23.02.2023',
          },
        ],
      },
      {
        type: 'node',
        id: 'license',
        label: 'Lizenz',
        data: [
          {
            type: 'href',
            id: 'licenseVal',
            data: [
              {
                href: 'http://www.opendefinition.org/licenses/cc-by',
                label: 'CC BY (Creative Commons Namensnennung)',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'schulstandorte',
    title: 'Schulstandorte in Bayern',
    description:
      'Darstellung der Schulstandorte in Bayern auf Basis der postalischen Adressen mit Sachinformationen zum Schulnamen, zur Schulart sowie zu den Kommunikations- und Verwaltungsdaten',
    format: 'WFS',
    properties: [
      {
        type: 'node',
        id: 'updatedAt',
        label: 'Aktualisiert',
        data: [
          {
            type: 'value',
            id: 'updatedAtVal',
            data: '23.02.2023',
          },
        ],
      },
      {
        type: 'node',
        id: 'license',
        label: 'Lizenz',
        data: [
          {
            type: 'href',
            id: 'licenseVal',
            data: [
              {
                href: 'http://www.opendefinition.org/licenses/cc-by',
                label: 'CC BY (Creative Commons Namensnennung)',
              },
            ],
          },
        ],
      },
    ],
  },
])
</script>

<template>
  <Story title="Components/DistributionDatInfoBoxList">
    <DistributionDataInfoBoxList :distributions="list" />
  </Story>
</template>

<style scoped></style>
