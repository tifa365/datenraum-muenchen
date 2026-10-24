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
    class="content-row" 
    :class="cardClass"
    :style="cardStyle"
  >
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  cardClass: {
    type: String,
    default: ''
  },
  cardStyle: {
    type: Object,
    default: () => ({})
  }
})
</script>

<style scoped>
.content-row {
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  border-radius: 8px;
  padding: 32px;
  background: var(--hero-card-background);
  backdrop-filter: var(--hero-card-backdrop-filter);
}
.content-row::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 8px;
  padding: var(--hero-card-before-padding); /* Border width */
  background: var(--hero-card-before-background);
  mask: var(--hero-card-before-mask);
  mask-composite: var(--hero-card-before-mask-composite);
  pointer-events: none;
}

@media (max-width: 1200px) {
  .content-row {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .content-row {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .content-row {
    padding: 16px;
  }
}
</style>