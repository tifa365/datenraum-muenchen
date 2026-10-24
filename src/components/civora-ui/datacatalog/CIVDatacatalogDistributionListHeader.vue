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
const list = [
    'kdw.components.DatasetDetailsContainer.to-dataset',
    'message.metadata.format',
    'message.metadata.license',
    'message.metadata.updateDate',
    'message.dataupload.menu.actions'
]
</script>

<template>
  <div class="list-header-container">
    <span v-for="(text, i) in list" :key="i" class="title-md list-header-title">{{ $t(text) }}</span>
  </div>
</template>

<style scoped>
.list-header-container {
  display: flex;
  align-items: center;
}
.list-header-container .list-header-title {
  width: 15%;
  text-align: center;
  color: var(--color-primary-500);
}
.list-header-container .list-header-title:first-child {
  width: 20%;
  text-align: start;
}

/* Hide header on mobile */
@media (max-width: 768px) {
  .list-header-container {
    display: none;
  }
}
</style>