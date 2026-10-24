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
	<div class="dropdown-box" :class="[inputClasses, { 'dropdown-error': isError, 'dropdown-disabled': disabled }]">
		<label class="label-md dropdown-label">
			{{ label }}
		</label>
		<div ref="dropdownRef" class="dropdown-container" :class="{ open: isOpen }">
			<button
				type="button"
				aria-haspopup="listbox"
				:aria-expanded="isOpen"
				:aria-controls="listBoxId"
				class="dropdown-header"
				@click="toggleDropdown"
				@keydown="handleKeydownButton"
			>
				<CIVMaskedIcon v-if="iconPrefix"
					class="prefix-icon icon-style"
					:svgIcon="iconPrefix"
				/>
        <span v-if="selectedItems.length === 0"
          class="body-md dropdown-placeholder-text">
          {{ placeholder || t('component.dropdown-select.placeholder') }}
        </span>
				<span v-else class="body-lg dropdown-text has-value">
          {{ selectedItems.map(item => 
              props.transform ? props.transform(item) : item).join(', ') }}
				</span>
				<CIVMaskedIcon
					class="suffix-icon"
					:size="size"
					svgIcon="/src/assets/icons/ChevronBottom.svg"
					:style="{ transform: `rotate(${isOpen ? 180 : 0}deg)` }"
				/>
			</button>

			<transition name="fade">
				<ul v-if="isOpen"
					:id="listBoxId"
					class="dropdown-menu"
					aria-orientation="vertical"
					tabindex="-1"
					@click="closeOnSelect"
					@keydown="handleKeydownListBox"
				>
					<li class="body-lg dropdown-item"
            v-for="(item, index) in items"
            :key="index"
						:aria-selected="isSelected(item)"
            :class="{ 'dropdown-item-selected': isSelected(item) }"
						tabindex="-1"
						role="option"
            @click="selectItem(item)"
          >
            {{ props.transform ? props.transform(item) : item }}
          </li>
				</ul>
			</transition>
		</div>
		<p v-if="helperText" class="label-md helper-text">{{ helperText }}</p>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, useId, type PropType } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useListBoxKeyboardNavigation } from '@/composables/useKeyboardNavigation'
import CIVMaskedIcon from './CIVMaskedIcon.vue'

const { t } = useI18n()
const listBoxId = useId()

const props = defineProps({
  items: {
    type: Array as PropType<string[]>,
    required: true,
  },
	label: {
		type: String,
		required: true,
	},
	placeholder: {
		type: String,
		required: false,
	},
	helperText: {
		type: String,
		required: false,
	},
	size: {
    type: String as PropType<'small' | 'medium' | 'large'>,
		default: 'medium',
		validator: (value: string) => ['small', 'medium', 'large'].includes(value),
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
	closeOnSelect: {
		type: Boolean,
		default: false,		
		required: false,
	},
  isMultiSelect: {
    type: Boolean,
    default: false,
    required: false,
  },
  transform: {
    type: Function as PropType<(item: string) => string>,
    required: false,
  },
})

const dropdownRef = useTemplateRef<HTMLElement>('dropdownRef')
const selectedItems = defineModel<string[]>('selectedItems', { default: () => [] })

const inputClasses = computed(() => ('dropdown-' + props.size))

const isOpen = ref(false)

const { handleKeydownButton, handleKeydownListBox } = useListBoxKeyboardNavigation(
  isOpen,
  () => Array.from(dropdownRef.value
		?.querySelectorAll('[role="option"]') || []) as HTMLElement[],
  () => { isOpen.value = true },
  () => { isOpen.value = false }
)

const toggleDropdown = () => {
	if (props.disabled) {
    return
  }
	isOpen.value = !isOpen.value
}

const closeOnSelect = () => {
	if (props.closeOnSelect) {
		isOpen.value = false
	}
}

const selectItem = (item: string) => {
  const hasValue = selectedItems.value.includes(item)
  selectedItems.value = hasValue
    ? selectedItems.value.filter(i => i !== item)
    : props.isMultiSelect
      ? [...selectedItems.value, item]
      : [item]
  closeOnSelect()
}

const isSelected = (item: string) => {
  return selectedItems.value.includes(item)
}

onClickOutside(dropdownRef, () => {
  isOpen.value = false
})
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

.prefix-icon {
	background-color: var(--color-button-regular);
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

.dropdown-disabled .prefix-icon,
.dropdown-disabled .suffix-icon {
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

.suffix-icon {
	transition: transform 0.2s ease;
	background-color: var(--color-button-regular);
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
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-container .dropdown-text {
	flex: 1;
	color: var(--color-icons);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
	text-align: left;
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

.dropdown-item {
  padding: 4px 4px 4px 12px;
  border-radius: 4px;
}

.dropdown-item:hover {
  background-color: var(--color-neutral-300);
  color: var(--color-text-muted);
}

.dropdown-item-selected {
  background-color: var(--color-button-pressed);
  color: var(--color-neutral-100);
}
</style>

