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
  <RouterLink
    :to="props.route"
    custom
    v-slot="{ href, navigate, isActive }">
    <a
      class="sidebar-icon-container"
      :class="{ active: isActive, expanded: props.expanded }"
      :href="href"
      @click="navigate"
      :title="props.title.length > 20 ? props.title : ''"
      :aria-label="props.title">
      <img
        class="sidebar-icon"
        :src="isActive ? props.iconActive : props.icon"
        aria-hidden="true" />
      <span
        v-if="props.expanded"
        class="icon-title"
        >{{ props.title }}</span
      >
    </a>
  </RouterLink>
</template>

<script setup>
const props = defineProps({
  route: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  iconActive: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: 'Icon',
  },
  title: {
    type: String,
    required: true,
  },
  expanded: {
    type: Boolean,
    required: true,
  },
})
</script>

<style scoped>
.sidebar-icon-container {
  padding: 8px;
  height: 52px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  transition:
    background-color 0.3s,
    width 0.3s,
    padding 0.3s;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.sidebar-icon-container.expanded {
  justify-content: flex-start;
}

.active {
  background-color: #f4f6f9;
}

.sidebar-icon-container:hover {
  background-color: #f4f6f9;
}

.sidebar-icon {
  width: 32px;
  height: 32px;
}

.icon-title {
  margin-left: 16px;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  color: #33404a;
  font-family: var(--font-family), serif;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
}
</style>
