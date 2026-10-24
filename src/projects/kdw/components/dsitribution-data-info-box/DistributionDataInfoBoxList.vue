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
import DistributionDataInfoBox from './DistributionDataInfoBox.vue'
import type { DistributionDataInfoBoxListProps } from './shared'

defineProps<DistributionDataInfoBoxListProps>()
</script>

<template>
  <div>
    <template
      v-for="(distribution, i) in distributions"
      :key="i">
      <DistributionDataInfoBox
        :title="distribution.title"
        :description="distribution.description"
        :format="distribution.format"
        :properties="distribution.properties"
        :access-urls="distribution.accessUrls"
        :download-urls="distribution.downloadUrls" />
      <hr class="last-of-type:hidden" />
    </template>
  </div>
</template>

<style scoped></style>
