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
  <RouterLink :to="props.route" custom v-slot="{ href, navigate, isActive }">
    <a class="sidebar-icon-container" :class="{ active: isActive, expanded: props.expanded }" :href="href"
      @click="navigate" :title="props.title.length > 20 ? props.title : ''" :aria-label="props.title">
      <img v-if="typeOfIcon === 'other'" class="sidebar-icon" :src="props.icon" aria-hidden="true" />
      <div v-else-if="icon" class="iconSvg" />
      <span v-if="props.expanded" class="icon-title title-md">{{ props.title }}</span>
    </a>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  route: {
    type: [String, Object],
    required: true,
  },
  icon: {
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
const typeOfIcon = props.icon && props.icon.endsWith('.svg') ? 'svg' : 'other'
const iconSvg = computed(() => typeOfIcon === 'svg' && props.icon ? 'url(' + props.icon + ')' : '')
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
  color: var(--color-primary-700);
}

.sidebar-icon-container .expanded {
  justify-content: flex-start;
}

.sidebar-icon-container:hover {
  background-color: var(--color-neutral-200);
}

.active,
.active:hover {
  background-color: var(--color-neutral-300);
}
.active .iconSvg {
  background-color: var(--color-primary-500);
}

.sidebar-icon {
  width: 32px;
  height: 32px;
}

.icon-title {
  max-width: 200px;
  margin-left: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.iconSvg {
  mask: v-bind(iconSvg);
  min-width: 32px;
  height: 32px;
  mask-size: contain;
  mask-repeat: no-repeat;
  background-color: var(--color-neutral-500);
}

@media (max-width: 1033px) {
  .active,
  .active:hover {
    background-color: unset;
  }
}
</style>
