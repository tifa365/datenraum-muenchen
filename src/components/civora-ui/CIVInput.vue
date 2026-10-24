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
    <div class="input-box" :class="[inputClasses, { 'input-error': isError, 'input-disabled': disabled }]">
        <label v-if="label" :class="size === 'medium' ? 'label-md' : 'body-sm'" class="input-label" :for="inputId">
            {{ label }}
        </label>
        <div class="input-container">
            <div v-if="iconPrefix" class="prefix-icon icon-style"  @click="emit('iconPrefixClick')"/>
            <input :id="inputId" :type="inputType" :placeholder="placeholder" :value="defaultValue"
            :disabled="disabled" :tabindex="disabled ? -1 : 0" :aria-disabled="disabled" class="civ-input body-md"
            @input="onInput" />
            <div v-if="iconSuffix" class="suffix-icon icon-style" @click="emit('iconSuffixClick')"/>
        </div>
        <p v-if="helperText" class="label-md helper-text">{{ helperText }}</p>
    </div>
</template>

<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
    inputType: {
        type: String,
        default: 'text',
        validator: (value) => ['text', 'password', 'number', 'email'].includes(value),
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
    iconSuffix: {
        type: String,
        required: false,
    },
    label: {
        type: String,
        required: false,
    },
    defaultValue: {
        type: String,
        required: false,
    }
})

const inputId = useId()

const emit = defineEmits(['inputValue', 'iconPrefixClick', 'iconSuffixClick'])
const onInput = (event) => {
    emit('inputValue', event.target.value)
}

const inputClasses = computed(() => {
    return [
        'input-' + props.size,
    ]
})

const suffixIcon = computed(() => props.iconSuffix ? 'url(' + props.iconSuffix + ')' : '')
const prefixIcon = computed(() => props.iconPrefix ? 'url(' + props.iconPrefix + ')' : '')
</script>

<style scoped>
.input-box {
    display: flex;
    flex-direction: column;
    cursor: pointer;
    gap: 4px;
}

.input-box .input-label {
    color: var(--color-text-light);
}

.input-box .helper-text,
.input-box {
    color: var(--color-text-regular);
    opacity: 1
}

.input-container input::placeholder {
    color: var(--color-text-muted);
}

.input-box .input-container input {
    background: none;
    border: none;
    outline: none;
    width: 100%;
    color: var(--color-text-regular);
}

.input-container {
    border: 1.5px solid var(--color-divider);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background-color: var(--color-bg-white);
    padding: 0 12px;
}

.input-container:hover,
.input-container:focus-within {
    border-color: var(--color-button-regular);
    box-shadow: 0px 0px 0px 2px rgba(0, 104, 122, 0.25);
}

.input-container {
    width: 100%;
}

.input-large .input-container {
    height: 48px;
}

.input-medium .input-container {
    height: 40px;
}

.input-small .input-container {
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

.input-small .input-container .suffix-icon {
    min-width: 16px;
}

.suffix-icon {
    mask-image: v-bind(suffixIcon);
}

.prefix-icon {
    mask-image: v-bind(prefixIcon);
}

.input-error .prefix-icon {
    background-color: var(--color-danger-700);
}

.input-error .input-container {
    border: 1.5px solid var(--color-danger-700);
}

.input-error .helper-text {
    color: var(--color-danger-700);
}

.input-disabled {
    pointer-events: none;
}

.input-disabled .input-container {
    background-color: var(--color-bg-disabled);
}

.civ-input:focus:disabled {
    outline: none;
}

.input-disabled .icon-style {
    background-color: var(--color-divider);
}
</style>
