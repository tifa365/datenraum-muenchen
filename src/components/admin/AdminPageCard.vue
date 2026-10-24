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
  <a class="card-box" :href="link" target="_blank">
    <img
      class="card-icon"
      :src="iconUrl"
      :alt="title" />
    <span class="headline-md card-title">{{ $t(title) }}</span>
    <p class="body-lg card-description">{{ $t(description) }}</p>
  </a>
</template>

<script setup lang="ts">
defineProps({
  iconUrl: String,
  title: String,
  description: String,
  link: String,
})
</script>

<style scoped>
.card-box {
  width: 410px;
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 24px;
  padding: 24px;
  background-color: var(--color-neutral-100);
  border: 1px solid var(--color-neutral-300);
  border-radius: 8px;
  cursor: pointer;
}
.card-box .card-icon {
  width: 32px;
  height: 32px;
  max-width: 32px;
  max-height: 32px;
  object-fit: contain;
}
.card-box .card-title {
  color: var(--color-neutral-700);
}
.card-box .card-description {
  color: var(--color-primary-800);
}
</style>
