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
const props = defineProps({
  icon: { type: String, required: true },
  size: { type: String, default: 'large', validator: (value) => ['small', 'medium', 'large'].includes(value) },
})

const emit = defineEmits(['handleClick'])
</script>

<template>
  <button class="icon-wrapper" @click="emit('handleClick')">
    <img :src="icon" alt="icon" class="icon-img" :class="size" />
  </button>
</template>

<style scoped>
.icon-wrapper {
  width: 40px;
  height: 40px;
  background: #D9E1E7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.icon-img .small {
  width: 16px;
  height: 16px;
}

.icon-img .medium {
  width: 20px;
  height: 20px;
}

.icon-img .large {
  width: 24px;
  height: 24px;
}
</style>
