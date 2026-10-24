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
import { nextTick, useTemplateRef, useId } from 'vue'
import { onClickOutside } from '@vueuse/core'
import CIVButton from './CIVButton.vue'

type ActionMenuItem = {
  id: string
  label: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  label: string
  items: ActionMenuItem[]
  placement?: 'top' | 'bottom'
}>(), {
  placement: 'bottom',
})

const emit = defineEmits<{
  select: [id: string]
}>()

const open = defineModel<boolean>('open', { default: false })
const menuId = `action-menu-${useId()}`
const root = useTemplateRef<HTMLElement>('root')

onClickOutside(root, () => closeMenu())

function getMenuItems() {
  return Array.from(
    root.value?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []
  )
}

function focusMenuItem(position: 'first' | 'last') {
  const menuItems = getMenuItems()
  const index = position === 'first' ? 0 : menuItems.length - 1
  menuItems[index]?.focus()
}

function openMenu(position: 'first' | 'last' = 'first') {
  open.value = true
  nextTick(() => focusMenuItem(position))
}

function closeMenu(restoreFocus = false) {
  open.value = false
  if (restoreFocus) {
    nextTick(() => root.value?.querySelector<HTMLButtonElement>('.action-menu-trigger')?.focus())
  }
}

function toggleMenu() {
  if (open.value) closeMenu()
  else openMenu()
}

function handleTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    openMenu(event.key === 'ArrowDown' ? 'first' : 'last')
  } else if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    closeMenu(true)
  }
}

function handleMenuKeydown(event: KeyboardEvent) {
  const menuItems = getMenuItems()
  const currentIndex = menuItems.indexOf(event.target as HTMLButtonElement)

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      menuItems[(currentIndex + 1) % menuItems.length]?.focus()
      break
    case 'ArrowUp':
      event.preventDefault()
      menuItems[(currentIndex - 1 + menuItems.length) % menuItems.length]?.focus()
      break
    case 'Home':
      event.preventDefault()
      focusMenuItem('first')
      break
    case 'End':
      event.preventDefault()
      focusMenuItem('last')
      break
    case 'Escape':
      event.preventDefault()
      closeMenu(true)
      break
    case 'Tab':
      closeMenu()
      break
  }
}

function selectItem(item: ActionMenuItem) {
  if (item.disabled) return
  closeMenu(true)
  emit('select', item.id)
}
</script>

<template>
  <div
    ref="root"
    class="action-menu"
    :class="`action-menu-${props.placement}`">
    <CIVButton
      class="action-menu-trigger"
      type="icon"
      size="icon-square"
      iconPrefix="/src/assets/icons/ThreeDotsVertical.svg"
      :label="props.label"
      hideLabel
      :aria-haspopup="'menu'"
      :aria-expanded="open"
      :aria-controls="menuId"
      @click="toggleMenu"
      @keydown="handleTriggerKeydown" />
    <div
      v-show="open"
      :id="menuId"
      class="action-menu-content"
      role="menu"
      @keydown="handleMenuKeydown">
      <button
        v-for="item in props.items"
        :key="item.id"
        type="button"
        class="action-menu-item body-lg"
        role="menuitem"
        tabindex="-1"
        :aria-disabled="item.disabled || undefined"
        @click="selectItem(item)">
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.action-menu {
  position: relative;
  display: inline-flex;
  justify-content: flex-end;
}

.action-menu :deep(.action-menu-trigger) {
  min-width: 44px;
  min-height: 44px;
  padding: 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
}

.action-menu :deep(.action-menu-trigger:hover) {
  background-color: var(--color-bg-white-hover);
}

.action-menu-content {
  position: absolute;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  max-width: min(225px, calc(100vw - 32px));
  background-color: var(--color-bg-white);
  border: 1px solid var(--color-neutral-300);
  border-radius: 8px;
  overflow: hidden;
  z-index: 10;
}

.action-menu-bottom .action-menu-content {
  top: calc(100% + 4px);
  right: 0;
}

.action-menu-top .action-menu-content {
  right: 0;
  bottom: calc(100% + 4px);
}

.action-menu-item {
  border: 0;
  padding: 10px;
  color: var(--color-text-muted);
  cursor: pointer;
  text-align: left;
}

.action-menu-item:hover,
.action-menu-item:focus-visible {
  background-color: var(--color-neutral-300);
}

.action-menu-item[aria-disabled='true'] {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>