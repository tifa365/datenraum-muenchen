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
    class="header-icon-container"
    :class="{ active: isDropdownOpen }">
    <button
      ref="triggerButton"
      type="button"
      class="header-icon-button"
      :aria-label="alt"
      aria-haspopup="menu"
      :aria-expanded="isDropdownOpen"
      :aria-controls="menuId"
      @click="toggle()"
      @keydown.esc="closeDropdown()"
      @keydown.arrow-down.prevent="openAndFocusFirst()">
      <img
        class="header-icon"
        :src="iconUrl"
        :alt="alt" />
    </button>
    <div
      :id="menuId"
      ref="dropdownMenu"
      class="header-icon-dropdown"
      :class="{ open: isDropdownOpen, 'right-align': alignToRight }"
      role="menu"
      :aria-label="alt"
      @keydown="handleMenuKeydown"
    >
      <slot name="dropdown-content"></slot>
    </div>
  </div>
  <div
    v-if="isDropdownOpen"
    class="dropdown-backdrop"
    @click="closeDropdown"></div>
</template>

<script setup>
import { computed, ref, nextTick, useId } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: 'Icon',
  },
  alignToRight: {
    type: Boolean,
    default: false,
  },
})

const iconUrl = computed(() =>
  new URL('/src/assets/icons/' + props.icon, import.meta.url).href)

const menuId = useId()
const isDropdownOpen = ref(false)
const triggerButton = ref(null)
const dropdownMenu = ref(null)

const getFocusableItems = () => {
  if (!dropdownMenu.value) return []
  return Array.from(
    dropdownMenu.value.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  )
}

const openAndFocusFirst = async () => {
  isDropdownOpen.value = true
  await nextTick()
  getFocusableItems()[0]?.focus()
}

const toggle = async () => {
  if (!isDropdownOpen.value) {
    await openAndFocusFirst()
  } else {
    closeDropdown()
  }
}

const closeDropdown = (returnFocus = true) => {
  if (!isDropdownOpen.value) return
  isDropdownOpen.value = false
  if (returnFocus) {
    triggerButton.value?.focus()
  }
}

const handleMenuKeydown = (event) => {
  const items = getFocusableItems()
  if (!items.length) return

  const currentIndex = items.indexOf(document.activeElement)

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      items[(currentIndex + 1) % items.length].focus()
      break
    case 'ArrowUp':
      event.preventDefault()
      items[(currentIndex - 1 + items.length) % items.length].focus()
      break
    case 'Home':
      event.preventDefault()
      items[0].focus()
      break
    case 'End':
      event.preventDefault()
      items[items.length - 1].focus()
      break
    case 'Tab':
      closeDropdown(false)
      break
    case 'Escape':
      closeDropdown(true)
      break
  }
}
</script>

<style scoped>
.header-icon-container {
  width: 40px;
  height: 40px;
  border: 1px solid #d4dde3;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.active {
  background-color: #f4f6f9;
}

.header-icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: none;
  border-radius: inherit;
  cursor: pointer;
}

.header-icon-button:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.header-icon {
  width: 24px;
  height: 24px;
}

.header-icon-container:hover {
  background-color: #f4f6f9;
}

.header-icon-dropdown {
    position: absolute;
    min-width: 323px;
    top: 100%;
    z-index: 1100;
    display: none;
    flex-direction: column;
    padding: 32px 24px;
    gap: 16px;
    background-color:  #fff;
    border: 1px solid #DDE1E6;
    border-radius: 8px;
    visibility: collapse;
}

.open {
  display: flex;
  visibility: visible;
}

.right-align {
  right: 0;
}

.dropdown-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 1000; /* Behind dropdown */
}
</style>
