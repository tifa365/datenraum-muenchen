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
  <CIVOrganizationData v-if="isDatasetLevelAccessControlEnabled"></CIVOrganizationData>
  <OrganizationData v-else></OrganizationData>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OrganizationData from '../../components/organisation-data/OrganizationData.vue'
import CIVOrganizationData from '../../components/civora-ui/CIVOrganizationData.vue'
import appConfig from '@config/appConfig'

const isDatasetLevelAccessControlEnabled = computed(
  () =>
    appConfig.customer?.enableDataSetLevelAccessControl === true ||
    appConfig.customer?.enableDataSetLevelAccessControl === 'true'
)
</script>

<style scoped></style>
