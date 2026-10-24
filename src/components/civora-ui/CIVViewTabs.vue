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
    :id="id"
    ref="tabsContainer"
    class="tabs-container"
    role="tablist"
    :aria-orientation="ariaOrientation"
  >
    <button
      v-for="(tab, index) in tabs"
      role="tab"
      :key="index"
      :aria-selected="selectedTab === tab.id"
      :tabindex="getTabindex(tab, index)"
      :class="['tab-item', { 'active-tab': selectedTab === tab.id }, {'disabled-tab' : tab.disabled}]"
      @keydown="handleKeydown"
      @click="selectTab(tab.id)">
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, useId, useTemplateRef, type PropType } from 'vue'
import { useMediaQuery } from '@vueuse/core'

const props = defineProps({
  tabs: {
    type: Array as PropType<{ id: string, label: string, disabled?: boolean }[]>,
    required: true,
    default: () => [],
  },
})

const id = useId()
const tabsContainer = useTemplateRef('tabsContainer')

const isVertical = useMediaQuery('(max-width: 500px)')
const ariaOrientation = computed(() => isVertical.value ? 'vertical' : 'horizontal')

const selectedTab = defineModel<string>()

const selectTab = (tabValue: string) => {
  const tab = props.tabs.find(tab => tab.id === tabValue)
  if (!tab || tab.disabled) {
    return
  }
  selectedTab.value = tabValue
}


const handleKeydown = (event: KeyboardEvent) => {
  const activeTab = document.activeElement as HTMLElement
  const focusableTabs: HTMLElement[] = Array.from(tabsContainer.value?.querySelectorAll('[role="tab"]:not(.disabled-tab)') || [])
  const currentIndex = focusableTabs.indexOf(activeTab)
  if (currentIndex === -1) {
    return
  }

  switch (event.key) {
    case 'ArrowRight':
      if (ariaOrientation.value === 'horizontal') {
        event.preventDefault()
        focusableTabs[(currentIndex + 1) % focusableTabs.length].focus()
      }
      break
    case 'ArrowLeft':
      if (ariaOrientation.value === 'horizontal') {
        event.preventDefault()
        focusableTabs[(currentIndex - 1 + focusableTabs.length) % focusableTabs.length].focus()
      }
      break
    case 'ArrowUp':
      if (ariaOrientation.value === 'vertical') {
        event.preventDefault()
        focusableTabs[(currentIndex - 1 + focusableTabs.length) % focusableTabs.length].focus()
      }
      break
    case 'ArrowDown':
      if (ariaOrientation.value === 'vertical') {
        event.preventDefault()
        focusableTabs[(currentIndex + 1) % focusableTabs.length].focus()
      }
      break
  }
}

const getTabindex = (tab: { id: string, disabled?: boolean }, index: number) => {
  if (tab.disabled) {
    return -1
  }
  const selectedId = selectedTab.value
  if (selectedId && selectedId === tab.id) {
    return 0
  }

  const firstEnabledTabIndex = props.tabs.findIndex(t => !t.disabled)
  if (!selectedId && index === firstEnabledTabIndex) {
    return 0
  }

  return -1
}
</script>

<style scoped>
.tabs-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding-top: 16px;
  padding-left:32px;
  border-bottom: 1px solid #ddd;
  background-color: #f9f9f9;
}

.tab-item {
  text-align: center;
  border-bottom: 3px solid transparent;
  font-family: var(--font-family), serif;
  font-size: 16px;
  color: var(--color-primary-900);
  cursor: pointer;
  padding: 0 32px 10px 32px;
  transition: color 0.3s ease;
}

.tab-item:hover {
  color: var(--color-primary-500);
}

.active-tab {
  border-bottom: 3px solid var(--color-primary-500);
  font-weight: bold;
}

@media (max-width: 1032px) {
  .tabs-container {
    width: 100%;
    padding-left:0;
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
</style>