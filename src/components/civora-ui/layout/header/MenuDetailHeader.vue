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
  <div
    class="header view-header-background"
    :style="{ 'background-image': `url(config/${appConfig.customer.name}/assets/images/${appConfig.components.headerImageFileName})` }">
    <div class="header-content">
        <CIVCardBasic
        :image="organisation.logo"
        :title="organisation.title"
        :description="organisation.description"
        :url="organisation.website"/>
    </div>
  </div>
</template>

<script setup>
import appConfig from '/config/appConfig';
import CIVCardBasic from './CIVCardBasic.vue';

defineProps({
  organisation: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.header {
  display: flex;
  background-repeat: no-repeat;
  color: var(--color-text-light);
}
.header-content {
  width: 100%;
  margin: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
