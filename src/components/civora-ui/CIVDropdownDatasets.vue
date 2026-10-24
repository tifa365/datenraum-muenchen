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
import { ref, PropType, nextTick } from 'vue'
import { watch, onUnmounted } from 'vue'
import CIVButton from './CIVButton.vue'

interface MenuItem {
  icon?: string
  text: string
  onClick?: () => void
  children?: MenuItem[]
}

const props = defineProps({
  label: { type: String, required: true },
  type: { type: String, required: true },
  list: { type: Array as PropType<MenuItem[]>, required: false },
  disabled: { type: Boolean, default: false },
})

const isOpen = ref(false)
const flippedPositions = ref<Set<number>>(new Set())
const dropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

// Add/remove click listener
const setupClickOutside = () => {
  if (isOpen.value) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
}

// Watch for isOpen changes
watch(isOpen, setupClickOutside)
watch(() => props.disabled, (disabled) => {
  if (disabled) {
    closeDropdown()
  }
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const checkPosition = async (index: number, element: HTMLElement) => {
  flippedPositions.value.delete(index)
  await nextTick()
  
  const submenu = element.querySelector('.dropdown-submenu') as HTMLElement
  if (!submenu) return
  
  submenu.style.visibility = 'hidden'
  submenu.style.display = 'flex'
  await nextTick()
  
  const rect = submenu.getBoundingClientRect()
  const wouldOverflowRight = rect.right > window.innerWidth
  
  submenu.style.visibility = ''
  submenu.style.display = ''
  
  if (wouldOverflowRight) {
    flippedPositions.value.add(index)
  }
}

const handleItemClick = (onClick?: () => void) => {
  if (props.disabled) return
  onClick?.()
  closeDropdown()
}
</script>

<template>
  <div class="dropdown-container" ref="dropdownRef">
    <CIVButton
      :type="type"
      :label="label"
      :disabled="disabled"
      iconSuffix="/src/assets/icons/ChevronBottom.svg"
      @click="toggleDropdown" />
    <div 
      v-if="isOpen && !disabled"
      class="dropdown-menu" 
      tabindex="0">
      <slot>
        <div
          v-for="(item, index) in list"
          :key="index"
          class="dropdown-menu-item-wrapper"
          @mouseenter="checkPosition(index, $event.currentTarget as HTMLElement)">
          <button
            class="dropdown-menu-item"
            @click="handleItemClick(item.onClick)">
            <span class="body-lg dropdown-menu-item-text">{{ item.text }}</span>
            <div
              v-if="item.icon"
              class="dropdown-menu-item-icon"
              :style="{ maskImage: `url(${item.icon})` }"></div>
            <div
              v-if="item.children?.length"
              class="submenu-chevron"></div>
          </button>
          <div
            v-if="item.children?.length"
            class="dropdown-submenu"
            :class="{ 'flip-left': flippedPositions.has(index) }">
            <button
              v-for="(child, childIndex) in item.children"
              :key="childIndex"
              class="dropdown-menu-item"
              @click.stop="handleItemClick(child.onClick)">
              <span class="body-lg dropdown-menu-item-text">{{ child.text }}</span>
              <div
                v-if="child.icon"
                class="dropdown-menu-item-icon"
                :style="{ maskImage: `url(${child.icon})` }"></div>
            </button>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.dropdown-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown-container .dropdown-menu {
  width: fit-content;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  border-radius: 8px;
  padding: 8px;
  gap: 8px;
  white-space: nowrap;
  cursor: pointer;
  background-color: var(--color-neutral-100);
  border: 1px solid var(--color-neutral-300);
  box-shadow:
    0 8px 20px 0 rgba(0, 0, 0, 0.06),
    0 24px 60px 0 rgba(0, 0, 0, 0.12);
}

.dropdown-menu-item-wrapper {
  position: relative;
}

.dropdown-menu-item-wrapper:hover > .dropdown-submenu {
  display: flex;
}

.dropdown-menu-item-wrapper:hover::after {
  content: '';
  position: absolute;
  top: 0;
  left: 100%;
  width: 8px;
  height: 100%;
  z-index: 1000;
}

.dropdown-menu-item-wrapper:has(.dropdown-submenu.flip-left):hover::after {
  left: auto;
  right: 100%;
}

.dropdown-container .dropdown-menu .dropdown-menu-item {
  padding: 4px 8px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background: none;
  border: none;
  font: inherit;
  text-align: left;
}

.dropdown-menu .dropdown-menu-item-text {
  color: var(--color-neutral-700);
  text-align: start;
  flex: 1;
}

.dropdown-menu .dropdown-menu-item-icon {
  min-width: 24px;
  max-width: 24px;
  aspect-ratio: 1 / 1;
  mask-position: center;
  mask-size: contain;
  mask-repeat: no-repeat;
  background-color: var(--color-primary-500);
}

.submenu-chevron {
  min-width: 16px;
  max-width: 16px;
  aspect-ratio: 1 / 1;
  mask-position: center;
  mask-size: contain;
  mask-repeat: no-repeat;
  background-color: var(--color-neutral-500);
  mask-image: url("/src/assets/icons/ChevronRight.svg");
}

.dropdown-container .dropdown-menu .dropdown-menu-item:hover {
  border-radius: 4px;
  background: var(--primitives-gray-200-darker-bg-light-border, #E9F0F4);
}

.dropdown-submenu {
  position: absolute;
  top: 0;
  left: 100%;
  display: none;
  flex-direction: column;
  border-radius: 8px;
  padding: 8px;
  gap: 8px;
  background-color: var(--color-neutral-100);
  border: 1px solid var(--color-neutral-300);
  box-shadow:
    0 8px 20px 0 rgba(0, 0, 0, 0.06),
    0 24px 60px 0 rgba(0, 0, 0, 0.12);
  margin-left: 4px;
  z-index: 1001;
}

.dropdown-submenu.flip-left {
  left: auto;
  right: 100%;
  margin-left: 0;
  margin-right: 4px;
}
</style>
