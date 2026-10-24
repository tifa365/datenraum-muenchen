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
import { PropType } from 'vue'

const props = defineProps({
  iconUrl: { type: String, required: true },
  size: { type: Number, default: 24 },
  color: { type: String, default: '--color-primary-500' },
  onClick: { type: Function as PropType<() => void> },
})
const maskImage = `url(${props.iconUrl})`
const iconColor = props.color.startsWith('--color-') ? `var(${props.color})` : props.color
const width = `${props.size}px`
const cursor = props.onClick ? 'pointer' : 'default'
</script>

<template>
  <div
    @click="() => (onClick ? onClick() : null)"
    class="icon-container"></div>
</template>

<style scoped>
.icon-container {
  min-width: v-bind(width);
  max-width: v-bind(width);
  aspect-ratio: 1 / 1;
  mask-size: contain;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-image: v-bind(maskImage);
  background-color: v-bind(iconColor);
  cursor: v-bind(cursor);
}
</style>
