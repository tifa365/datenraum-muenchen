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
import CIVIcon from '../CIVIcon.vue';

defineProps({
    title: { type: String, required: true },
    text: { type: String, required: true },
})
</script>

<template>
    <div class="info-banner-container">
        <CIVIcon iconUrl="/src/assets/icons/info-banner.svg" />
        <div class="info-text-content">
            <p class="info-banner-title">{{ title }}</p>
            <p class="info-banner-text">{{ text }}</p>
        </div>
    </div>
</template>

<style scoped>
.info-banner-container {
    width: 100%;
    display: flex;
    align-items: start;
    padding: 8px 12px;
    gap: 8px;
    background-color: var(--color-info-400);
    border-radius: 4px;
    border: 1px solid var(--color-info-500);
}
.info-banner-container .info-text-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.info-banner-container .info-text-content .info-banner-title {
    color: var(--color-neutral-700);
}
.info-banner-container .info-text-content .info-banner-text {
    color: var(--color-primary-800);
}
</style>