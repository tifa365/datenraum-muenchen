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
  <component
    :is="componentName"
    v-bind="buttonProps"
    :class="buttonClasses"
    :aria-disabled="props.disabled || undefined"
    :aria-labelledby="hideLabel ? undefined : labelId"
    :aria-label="hideLabel ? label : undefined"
    tabindex="0"
    @click="handleClick"
  >
    <div v-if="prefixIcon" aria-hidden="true" class="prefix-icon icon-style" />
    <span v-if="!hideLabel" :id="labelId" :class="fontSizeClass">{{ label }}</span>
    <div v-if="suffixIcon" aria-hidden="true" class="suffix-icon icon-style" />
  </component>
</template>

<script setup>
import { computed, useId } from 'vue'
import { RouterLink } from 'vue-router'

const labelId = useId()

const emit = defineEmits(['click'])

const props = defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => [
      'small',
      'medium',
      'large',
      'icon-square'
    ].includes(value),
  },
  type: {
    type: String,
    default: 'primary',
    validator: (value) => [
      'primary', 'secondary', 'tertiary', 'icon',
      'hero-primary', 'hero-secondary', 'hero-tertiary',
    ].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  iconPrefix: {
    type: String,
    default: null,
  },
  iconSuffix: {
    type: String,
    default: null,
  },
  label: {
    type: String,
    required: true,
  },
  // use href for external links and
  // to for internal links, if both are provided
  // href will be used
  href: {
    type: String,
    required: false,
  },
  to: {
    type: String,
    required: false,
  },
  hideLabel: {
    type: Boolean,
    default: false,
  },
})

const componentName = computed(() => {
  if (props.href) {
    return 'a'
  }
  if (props.to && !props.disabled) {
    return RouterLink
  }
  return 'button'
})

const buttonClasses = computed(() => {
  return [
    'button',
    'button-' + props.size,
    'button-' + props.type,
    {
      'button-disabled': props.disabled,
    },
  ]
})

const buttonProps = computed(() => {
  if (componentName.value === 'a') {
    return {
      href: safeHref.value,
      target: safeHref.value ? '_blank' : undefined,
      rel: safeHref.value ? 'noopener noreferrer' : undefined,
    }
  }
  if (componentName.value === RouterLink) {
    return {
      to: props.disabled ? undefined : props.to
    }
  }
  return {
    type: 'button',
    disabled: props.disabled
  }
})

const sizeToTextClass = {
  small: 'label-md',
  medium: 'body-lg',
  large: 'label-lg',
  icon: 'body-lg',
}

const fontSizeClass = computed(() => {
  return sizeToTextClass[props.size] || 'body-lg'
})

const handleClick = () => {
  if (props.disabled || props.href) {
    return
  }
  emit('click')
}

const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']
const safeHref = computed(() => {
  if (!props.href || props.disabled) {
    return undefined
  }
  try {
    const url = new URL(props.href, window.location.origin)
    if (allowedProtocols.includes(url.protocol)) {
      return props.href
    }
    console.warn(`Blocked navigation to URL with disallowed protocol: ${props.href}`)
  } catch (e) {
    console.warn(`Invalid URL provided to CIVButton: ${props.href}`)
  }
  return undefined
})

const suffixIcon = computed(() => {
  if (!props.iconSuffix) {
    return ''
  }
  if (!URL.canParse(props.iconSuffix, window.location.origin)) {
    console.warn(`Invalid URL provided for iconSuffix in CIVButton: ${props.iconSuffix}`)
    return ''
  }
  return 'url(' + props.iconSuffix + ')'
})
const prefixIcon = computed(() => {
  if (!props.iconPrefix) {
    return ''
  }
  if (!URL.canParse(props.iconPrefix, window.location.origin)) {
    console.warn(`Invalid URL provided for iconPrefix in CIVButton: ${props.iconPrefix}`)
    return ''
  }
  return 'url(' + props.iconPrefix + ')'
})
</script>

<style scoped>
.button {
  width: fit-content;
  height: fit-content;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-radius: 8px;
}

.button-primary {
  background-color: var(--color-button-regular);
  color: var(--color-button-text);
  border: 2px solid var(--color-button-regular);
}
.button-primary:hover {
  background-color: var(--color-button-hover);
  border-color: var(--color-button-hover);
}
.button-primary:active {
  background-color: var(--color-button-pressed);
  border-color: var(--color-button-pressed);
}

.button-secondary {
  background-color: var(--color-button-text);
  color: var(--color-button-regular);
  border: 2px solid var(--color-button-regular);
}
.button-secondary:hover {
  border-color: var(--color-button-hover);
  box-shadow: -1px 1px 8px 0 rgba(0, 0, 0, 0.31) inset;
}
.button-secondary:active {
  border-color: var(--color-button-pressed);
  box-shadow: none;
}

.button-tertiary {
  background-color: transparent;
  color: var(--color-button-regular);
}
.button-tertiary:hover {
  color: var(--color-button-hover);
}
.button-tertiary:active {
  color: var(--color-button-pressed);
}

.button-hero-primary {
  background-color: var(--hero-button-primary-bg-color);
  color: var(--hero-button-primary-text-color);
  border: 2px solid var(--hero-button-primary-border-color);
}
.button-hero-primary:hover {
  background-color: var(--hero-button-primary-bg-color-hover);
  border-color: var(--hero-button-primary-border-color-hover);
}
.button-hero-primary:active {
  background-color: var(--hero-button-primary-bg-color-active);
  border-color: var(--hero-button-primary-border-color-active);
}

.button-hero-secondary {
  background-color: var(--hero-button-secondary-bg-color);
  color: var(--hero-button-secondary-text-color);
  border: 2px solid var(--hero-button-secondary-border-color);
}
.button-hero-secondary:hover {
  border-color: var(--hero-button-secondary-border-color-hover);
  box-shadow: -1px 1px 8px 0 rgba(0, 0, 0, 0.31) inset;
}
.button-hero-secondary:active {
  border-color: var(--hero-button-secondary-border-color-active);
  box-shadow: none;
}

.button-hero-tertiary {
  background-color: var(--hero-button-tertiary-bg-color);
  color: var(--hero-button-tertiary-text-color);
}
.button-hero-tertiary:hover {
  color: var(--hero-button-tertiary-text-color-hover);
}
.button-hero-tertiary:active {
  color: var(--hero-button-tertiary-text-color-active);
}

.button-icon {
  border: 1px solid var(--color-divider);
  background-color: var(--color-bg-white);
  color: var(--color-button-regular);
}
.button-icon:hover {
  background-color: var(--color-bg-hover);
}
.button-icon:active {
  filter: brightness(85%);
}

.button-small {
  padding: 4px 16px;
}
.button-medium {
  padding: 8px 16px;
}
.button-large {
  padding: 14px 16px;
}
.button-icon-square {
  padding: 8px;
}
.button-disabled {
  opacity: 0.3;
  pointer-events: none;
}

.button-primary .icon-style {
  background-color: var(--color-button-text);
}
.button-secondary .icon-style {
  background-color: var(--color-button-regular);
}
.button-tertiary .icon-style {
  background-color: var(--color-button-regular);
}

.button-icon .icon-style {
  background-color: var(--color-button-regular);
}
.button-icon:hover .icon-style {
  background-color: var(--color-button-hover);
}
.button-icon:active .icon-style {
  background-color: var(--color-button-pressed);
}

.icon-style {
  mask-size: contain !important;
  mask-repeat: no-repeat;
  mask-position: center;
  width: 24px;
  height: 24px;
  background-color: currentColor !important;
}
.suffix-icon {
  mask-image: v-bind(suffixIcon);
}
.prefix-icon {
  mask-image: v-bind(prefixIcon);
}
</style>
