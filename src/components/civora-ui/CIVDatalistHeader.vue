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
<script setup>
const titlesList = [
  'organisation.datasets.datasetName',
  'organisation.datasets.status',
  'organisation.datasets.license',
  'organisation.datasets.format',
]
</script>

<template>
  <div class="civ-datalist-header">
    <div
      class="list-header"
      role="row">
      <div aria-hidden="true"></div>
      <div
        v-for="title in titlesList"
        :key="title"
        class="list-header-title"
        role="columnheader">
        <p class="title-sm">{{ $t(title) }}</p>
      </div>
      <div aria-hidden="true"></div>
    </div>
  </div>
</template>

<style scoped>
.civ-datalist-header .list-header {
  width: calc(100% - 80px);
  min-width: var(--dataset-list-min-width, 780px);
  margin: 0 40px;
  padding: 0 17px;
  display: grid;
  grid-template-columns: var(
    --dataset-list-columns,
    32px minmax(180px, 1.4fr) minmax(130px, 0.9fr) minmax(110px, 0.8fr)
      minmax(120px, 1fr) 54px
  );
  column-gap: 24px;
  grid-auto-rows: minmax(50px, auto);
  align-items: center;
  background-color: var(--color-bg-darker);
  border-bottom: 2px solid var(--color-border);
  color: var(--color-text-light);
  box-sizing: border-box;
  min-height: 50px;
}

.civ-datalist-header .list-header .list-header-title {
  width: auto !important;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
}

.civ-datalist-header .list-header .list-header-title p {
  width: 100%;
  margin: 0;
  overflow-wrap: anywhere;
  padding: 5px 0;
}

@media (max-width: 768px) {
  .civ-datalist-header .list-header {
    width: auto;
    margin: 0 10px;
  }
}
</style>
