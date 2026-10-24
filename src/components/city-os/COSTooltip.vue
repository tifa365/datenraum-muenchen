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
    class="tooltip"
    :class="positionClass">
    <slot></slot>
    <span class="tooltip-text">{{ text }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    default: 'right',
    validator: (value) => ['left', 'right', 'top', 'bottom'].includes(value),
  },
})

const positionClass = `tooltip-${props.position}`
</script>

<style scoped>
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltip-text {
  margin: 2px;
  visibility: hidden;
  background-color: #2d3841;
  width: max-content;
  min-width: 80px;
  max-width: 300px;
  color: #fff;
  text-align: center;
  font-family: var(--font-family), serif;
  font-size: 14px;
  border-radius: 12px;
  padding: 8px 12px;
  position: absolute;
  z-index: 1;
  white-space: normal;
  word-wrap: break-word;
}

.tooltip-left .tooltip-text {
  top: 0;
  right: 105%;
}

.tooltip-right .tooltip-text {
  top: 0;
  left: 105%;
}

.tooltip-top .tooltip-text {
  bottom: 105%;
  left: 50%;
  transform: translateX(-50%);
}

.tooltip-bottom .tooltip-text {
  top: 105%;
  left: 50%;
  transform: translateX(-50%);
}

.tooltip:hover .tooltip-text {
  visibility: visible;
}

@media (max-width: 768px) {
  .tooltip-text {
    display: none;
  }
}
</style>
