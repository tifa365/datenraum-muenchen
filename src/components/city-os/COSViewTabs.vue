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
  <div class="tabs-container">
    <div
      v-for="(tab, index) in tabs"
      :key="index"
      :class="['tab-item', { 'active-tab': selectedTab === tab.id }, {'disabled-tab': tab.disabled}, {'hidden-tab': tab.isHidden}]"
      @click="selectTab(tab.id)">
      {{ tab.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

interface Tab {
  id: string,
  label: string,
  disabled?: boolean,
  isHidden?: boolean
}

const props = defineProps({
  tabs: {
    type: Array<Tab>,
    required: true,
    default: () => [],
  },
  defaultTab: {
    type: String,
  },
})

const emit = defineEmits(['update:tab'])

const selectTab = (tabValue: string) => {
  selectedTab.value = tabValue
  emit('update:tab', tabValue)
}

const selectedTab = defineModel<string>()
if ((!selectedTab.value || !props.tabs.some(tab => tab.id === selectedTab.value))
    && props.defaultTab) {
  if (props.tabs.some(tab => tab.id === props.defaultTab)) {
    selectTab(props.defaultTab)
  }
}
</script>

<style scoped>
.tabs-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 1rem;
  gap: 2rem;
  border-bottom: 1px solid #ddd;
  background-color: #f9f9f9;
}

.tab-item {
  text-align: center;
  font-family: var(--font-family), serif;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;
}

.tab-item:hover {
  color: #0056b3;
}

.active-tab {
  color: #0056b3;
  font-weight: bold;
}

@media (max-width: 1032px) {
  .tabs-container {
    justify-content: space-around;
    gap: 1rem;
  }

  .tab-item {
    font-size: 1rem;
  }
}

@media (max-width: 500px) {
  .tabs-container {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .tab-item {
    font-size: 0.85rem;
  }
}

.disabled-tab {
  pointer-events: none; 
  opacity: 0.5;         
}

.hidden-tab {
  display: none;
}
</style>
