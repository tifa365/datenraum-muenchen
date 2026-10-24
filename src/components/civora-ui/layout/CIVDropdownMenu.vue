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
  <div class="dropdown-container">
    <button
      class="dropdown-header"
      type="button"
      :aria-expanded="hasSlotContent ? isOpen : undefined"
      :aria-controls="hasSlotContent ? menuId : undefined"
      @click="handleClick">
      <div class="dropdown-title">
        <span v-if="icon" class="icon">{{ icon }}</span>
        <span class="title  title-md">{{ title }}</span>
      </div>
      <img v-if="showArrow" class="arrow-icon"
        :src="isOpen ? '/src/assets/icons/ChevronTop.svg' : '/src/assets/icons/ChevronRight.svg'" />
    </button>
    <transition name="fade">
      <div :id="menuId" class="dropdown-menu" v-if="isOpen">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, useId, useSlots } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  icon: { type: String, default: '' },
  title: { type: String, default: '' },
  openByDefault: { type: Boolean, default: false },
  open: { type: Boolean, default: undefined },
  routerLink: { type: String, default: '' },
  showArrow: { type: Boolean, default: true },
})

const emit = defineEmits(['toggle'])
const slots = useSlots()
const menuId = `dropdown-menu-${useId()}`
const internalIsOpen = ref(props.openByDefault)
const isOpen = computed(() => props.open ?? internalIsOpen.value)
const hasSlotContent = computed(() => Boolean(slots.default))
const router = useRouter()

const toggleDropdown = () => {
  const nextIsOpen = !isOpen.value

  if (props.open === undefined) {
    internalIsOpen.value = nextIsOpen
  }

  emit('toggle', nextIsOpen)
}
const handleClick = () => {
  if (!hasSlotContent.value && props.routerLink) {
    router.push(props.routerLink)
  } else {
    toggleDropdown()
  }
}
</script>

<style scoped>
.dropdown-container {
  width: 100%;
}
.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 16px;
  border: 0;
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
  user-select: none;
}
.dropdown-title {
  display: flex;
  align-items: center;
}
.dropdown-title .title {
  color: var(--color-primary-900);
}

.icon {
  margin-right: 8px;
}
.arrow-icon {
  transition: transform 0.3s;
}

.dropdown-menu {
  width: 100%;
  padding: 10px;
  border-top: none;
  background: var(--color-bg-darker);
}
.dropdown-menu .fade-enter-active,
.dropdown-menu .fade-leave-active {
  transition: opacity 0.3s;
}
.dropdown-menu .fade-enter,
.dropdown-menu .fade-leave-to {
  opacity: 0;
}
</style>
