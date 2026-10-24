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

<!-- @deprecated Use CIVDropdownSelect instead. -->
<template>
	<div class="dropdown-box" :class="[inputClasses, { 'dropdown-error': isError, 'dropdown-disabled': disabled }]">
		<label class="label-md dropdown-label" @click.stop='toggleDropdown'>
			{{ label }}
		</label>
		<div ref="dropdownRef" class="dropdown-container" :class="{ open: isOpen }">
			<div class="dropdown-header" @click.stop="toggleDropdown">
				<div v-if="iconPrefix" class="prefix-icon icon-style" />
				<span class="body-md dropdown-text">
					{{ placeholder || 'Select' }}
				</span>
				<img class="suffix-arrow" :style="{ transform: `rotate(${isOpen ? 180 : 0}deg)` }"
					:src="'/src/assets/icons/ChevronBottomBlue.svg'" />
			</div>

			<transition name="fade">
				<div v-if="isOpen" class="dropdown-menu" @click="closeOnSelect">
					<slot></slot>
				</div>
			</transition>
		</div>
		<p v-if="helperText" class="label-md helper-text">{{ helperText }}</p>
	</div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * @deprecated Use CIVDropdownSelect instead.
 */

const props = defineProps({
	placeholder: {
		type: String,
		required: false,
	},
	helperText: {
		type: String,
		required: false,
	},
	size: {
		type: String,
		default: 'medium',
		validator: (value) => ['small', 'medium', 'large'].includes(value),
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	isError: {
		type: Boolean,
		default: false,
	},
	iconPrefix: {
		type: String,
		required: false,
	},
	label: {
		type: String,
		required: true,
	},
	closeOnSelect: {
		type: Boolean,
		default: false,		
		required: false,
	}
})

const inputClasses = computed(() => ('dropdown-' + props.size))
const prefixIcon = computed(() => props.iconPrefix ? 'url(' + props.iconPrefix + ')' : '')

const isOpen = ref(false)
const dropdownRef = ref(null)

const toggleDropdown = () => {
	if (props.disabled) return
	isOpen.value = !isOpen.value
}

const handleOutsideClick = (event) => {
	if (!dropdownRef.value || dropdownRef.value.contains(event.target)) return
	isOpen.value = false
}

const closeOnSelect = () => {
	if (props.closeOnSelect) {
		isOpen.value = false
	}
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', handleOutsideClick))
</script>

<style scoped>
.dropdown-box {
	display: flex;
	flex-direction: column;
	cursor: pointer;
	gap: 4px;
}

.dropdown-box .dropdown-label {
	color: var(--color-text-light);
}

.dropdown-box .helper-text,
.dropdown-box {
	color: var(--color-text-muted);
	opacity: 1
}

.dropdown-container {
	width: 100%;
	border: 1.5px solid var(--color-neutral-300);
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	background-color: var(--color-neutral-100);
	padding: 0 12px;
	position: relative;
}

.dropdown-container:hover,
.dropdown-container:focus-within {
	border-color: var(--color-button-regular);
	box-shadow: 0px 0px 0px 2px rgba(0, 104, 122, 0.25);
}

.dropdown-large .dropdown-container {
	height: 48px;
}

.dropdown-medium .dropdown-container {
	height: 40px;
}

.dropdown-small .dropdown-container {
	height: 32px;
}

.icon-style {
	min-width: 24px;
	aspect-ratio: 1/1;
	mask-repeat: no-repeat;
	mask-position: center;
	mask-size: cover;
	-webkit-mask-repeat: no-repeat;
	-webkit-mask-position: center;
	-webkit-mask-size: cover;
	background-color: var(--color-button-regular);
}

.prefix-icon {
	mask-image: v-bind(prefixIcon);
}

.dropdown-error .prefix-icon {
	background-color: var(--color-danger-700);
}

.dropdown-error .dropdown-container {
	border: 1.5px solid var(--color-danger-700);
}

.dropdown-error .helper-text {
	color: var(--color-danger-700);
}

.dropdown-disabled .dropdown-container {
	background-color: var(--color-bg-disabled);
}

.dropdown-disabled .dropdown-container:hover {
	border: 1.5px solid var(--color-divider);
}

.dropdown-disabled .icon-style {
	background-color: var(--color-divider);
}

.dropdown-container.open {
	border-color: var(--color-button-regular);
	box-shadow: 0 0 0 2px rgba(0, 104, 122, 0.25);
}

.dropdown-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	width: 100%;
}

.suffix-arrow {
	width: 16px;
	height: 16px;
	transition: transform 0.2s ease;
}

.dropdown-menu {
	position: absolute;
	top: calc(100% + 4px);
	left: 0;
	right: 0;
	border-radius: 8px;
	border: 1px solid var(--color-divider);
	background: var(--color-bg-white);
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06), 0 24px 60px rgba(0, 0, 0, 0.12);
	padding: 8px;
	display: flex;
	flex-direction: column;
	gap: 8px;
	z-index: 10;
}

.dropdown-container .dropdown-text {
	flex: 1;
	color: var(--color-icons);
}

.dropdown-container.open .dropdown-text,
.dropdown-container .dropdown-text.has-value {
	color: var(--color-text-regular);
}


.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
