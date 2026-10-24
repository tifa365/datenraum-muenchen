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
    :class="{ unfilled: !canProceed }"
    @click="click">
    <div class="button-content">
      <span :class="{ 'capitalize-text': capitalizeText }">{{ buttonText }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  buttonText: {
    type: String,
    required: true,
  },
  canProceed: {
    type: Boolean,
    required: false,
    default: true,
  },
  capitalizeText: {
    type: Boolean,
    required: false,
    default: false,
  },
  click: {
    type: Function,
    required: false,
  },
})
</script>

<style scoped>
.capitalize-text {
  text-transform: uppercase;
}
.button-container:hover {
  cursor: pointer;
}

.button-container {
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  width: max-content;
  display: inline-flex;
  height: 50px;
  padding: 0 32px;
  justify-content: center;
  align-items: center;
  font-family: var(--font-family), serif;
  color: white;
  gap: 8px;
  flex-shrink: 0;
  border: 1px solid #164194;
  border-radius: 4px;
  background: #164194;
}

.button-container:active {
  background: rgba(22, 65, 148, 0.5);
}

.unfilled {
  background: #667f93 !important;
  border: 1px solid #667f93;
}

.button-content {
  display: flex;
  gap: 8px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
