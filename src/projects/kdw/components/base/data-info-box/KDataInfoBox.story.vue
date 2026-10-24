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
import KDataInfoBox from './KDataInfoBox.vue'
import PhGlobeHemisphereWestLight from '~icons/ph/globe-hemisphere-west-light'

const superTitle = ref('Mainzer Verkehrsgesellschaft')
const title = ref('Flächennutzung/ Verkehrsfläche Stadt Ingolstadt')
const formats = ref(['CSV', 'JSON', 'XML', 'XLSX'])
const categories = ref(['Verkehr', 'Umwelt', 'Energie'])
const issued = ref('12.03.2024')
</script>

<template>
  <Story title="Components/DataInfoBox">
    <Variant title="Default">
      <div class="m-1">
        <KDataInfoBox
          :super-title="superTitle"
          :title="title"
          :formats="formats"
          :issued="issued"
          :categories="categories"
          dataset-type="opendata"
          >
        </KDataInfoBox>
      </div>
    </Variant>
    <Variant title="Ghost">
      <div class="m-1">
        <KDataInfoBox
          :super-title="superTitle"
          :title="title"
          :formats="formats"
          :issued="issued"
          :categories="categories"
          ghost>
          <template #icon>
            <PhGlobeHemisphereWestLight class="text-xl" />
          </template>
        </KDataInfoBox>
      </div>
    </Variant>
  </Story>
</template>
