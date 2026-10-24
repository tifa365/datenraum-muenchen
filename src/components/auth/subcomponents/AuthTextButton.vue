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
    class="button-container"
    @click="click">
    <div class="button-content">
      <img
        v-if="prefix"
        :src="prefix"
        alt="" />
      <span :class="{ 'capitalize-text': capitalizeText }">{{ buttonText }}</span>
      <img
        v-if="suffix"
        :src="suffix"
        alt="" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  route: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
    required: true,
  },
  capitalizeText: {
    type: Boolean,
    required: false,
    default: false,
  },
  prefix: {
    type: String,
    required: false,
  },
  suffix: {
    type: String,
    required: false,
  },
  click: {
    type: Function,
    required: true,
  },
})

const togglePressed = () => {
  console.log('button pressed!')
}
</script>

<style scoped>
.capitalize-text {
  text-transform: uppercase;
}

.button-container {
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  width: max-content;
  display: inline-flex;
  height: 40px;
  padding: 0 16px;
  justify-content: center;
  align-items: center;
  font-family: var(--font-family), serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
  color: #164194;
  gap: 8px;
  flex-shrink: 0;
  border-radius: 4px;
}

.button-container:hover {
  cursor: pointer;
}

.button-content {
  display: flex;
  gap: 8px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
