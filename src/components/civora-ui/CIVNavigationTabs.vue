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
        :class="['tab-item', { 'active-tab': selectedTab === tab.value }]"
        @click="selectTab(tab.value)">
        {{ tab.label }}
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits } from 'vue'
  
  const props = defineProps({
    tabs: {
      type: Array,
      required: true,
      default: () => [],
    },
    defaultTab: {
      type: String,
      default: '',
    },
  })
  
  const emit = defineEmits(['update:tab'])
  
  const selectedTab = ref(
    props.tabs.some(tab => tab.value === props.defaultTab)
      ? props.defaultTab
      : props.tabs[0].value
  )
  emit('update:tab', selectedTab.value)
  
  const selectTab = (tabValue) => {
    selectedTab.value = tabValue
    emit('update:tab', tabValue)
  }
  </script>
  
  <style scoped>
  .tabs-container {
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 1rem 1rem 10px 1rem;
    gap: 2rem;
    background-color: #f9f9f9;
    overflow-x: auto;
  }

  .tabs-container::after{
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: #ddd;

  }
  
  .tab-item {
    padding: 0 30px;
    text-align: center;
    font-family: var(--font-family), serif;
    color: var(--color-neutral-700);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: color 0.3s ease;
  }
  
  .tab-item:hover {
    color: var(--color-text-light);
  }
  
  .active-tab {
    position: relative;
    color: var(--color-primary-900);
    font-weight: var(--font-weight-bold);
  }

  @media (min-width: 501px) {
    .active-tab::after{
    content: '';
    position: absolute;
    left: 0;
    bottom: -10px;
    width: 100%;
    height: 3px;
    background: var(--color-primary-500);
  }
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

  @media (max-width: 768px) {
    .tab-item {
        padding: 0 15px;
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
  </style>
  