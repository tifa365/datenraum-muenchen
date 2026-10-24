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
import CIVMarkdown from '../CIVMarkdown.vue';

defineProps({
    title: { type: String, required: true, },
    icon: { type: String, required: false, },
    list: { type: Array, required: false, },
})
</script>

<template>
    <div class="distribution-metadata-card">
        <div class="metadata-card-header">
            <CIVIcon v-if="icon" :iconUrl="icon" />
            <span class="title-md metadata-card-title">{{ title }}</span>
        </div>
        <slot name="content">
            <div class="metadata-card-content">
                <div v-for="({icon, label, text, link, markdown}, i) in list" :key="i" class="metadata-card-item">
                    <CIVIcon v-if="icon" :iconUrl="icon" />
                    <div class="metadata-card-item-content">
                        <span v-if="label" class="metadata-card-item-label">{{ label }}</span>
                        <CIVMarkdown v-if="markdown" :content="markdown" />
                        <a v-else-if="link" :href="link" class="body-lg metadata-card-item-link">{{ text }}</a>
                        <span v-else class="body-lg metadata-card-item-text">{{ text }}</span>
                    </div>
                </div>
            </div>
        </slot>
    </div>
</template>

<style scoped>
.distribution-metadata-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.distribution-metadata-card .metadata-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
}
.distribution-metadata-card .metadata-card-header .metadata-card-title {
    color: var(--color-primary-900);
}
.distribution-metadata-card .metadata-card-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    border-radius: 8px;
    background: var(--Neutrals-divider, #D9E1E7);
    padding: 16px;
}
.metadata-card-content .metadata-card-item {
    display: flex;
    align-items: center;
    gap: 8px;
}
.metadata-card-content .metadata-card-item .metadata-card-item-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}
.metadata-card-content .metadata-card-item .metadata-card-item-label {
    color: var(--color-primary-700);
    font-family: var(--font-family), serif;
    font-size: var(--label-lg-font-size);
    font-style: normal;
    font-weight: 600;
    line-height: 24px;
}
.metadata-card-content .metadata-card-item .metadata-card-item-link {
    color: var(--color-info-700);
    overflow-wrap: anywhere;
}
.metadata-card-content .metadata-card-item .metadata-card-item-text {
    color: var(--color-primary-900);
    overflow-wrap: anywhere;
}
</style>
