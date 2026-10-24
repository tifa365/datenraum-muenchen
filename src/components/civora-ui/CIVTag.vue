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
  <div :class="[tone, size, size === 'big' ? 'title-sm' : 'label-sm']" class="tag-container">
    <svg v-if="hasDotIcon" class="doteIcon" width="6" height="6" viewBox="0 0 6 6" fill="none">
      <circle cx="3" cy="3" r="3" :fill="iconColor" />
    </svg>
    <div v-if="svgIcon" class="civ-tag-icon" :class="`icon-${size}`"></div>
    <slot>
      <p v-if="text">{{ text }}</p>
    </slot>
    <p v-if="!isNaN(number) && number !== null && number !== undefined">{{ number }}</p>
    <svg v-if="hasCloseIcon" @click="() => { emit('onClose') }" class="closeIcon" width="24" height="24"
      viewBox="0 0 24 24" fill="none">
      <path d="M8 8L16 16" :stroke="iconColor" stroke-width="1.333" stroke-linecap="round" />
      <path d="M16 8L8 16" :stroke="iconColor" stroke-width="1.333" stroke-linecap="round" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const emit = defineEmits(['onClose'])
const props = defineProps({
  hasCloseIcon: {
    type: Boolean,
    default: true
  },
  hasDotIcon: {
    type: Boolean,
    default: true,
  },
  tone: {
    type: String,
    default: 'neutral',
    validator: (value) =>
      ['critical', 'primary', 'positive', 'warning', 'promote', 'neutral', 'ghost'].includes(value),
  },
  size: {
    type: String,
    default: 'big',
    validator: (value) => ['big', 'small'].includes(value)
  },
  text: String,
  number: Number,
  svgIcon: String,
})

const iconColor = computed(() => {
  return {
    critical: 'var(--color-danger-700)',
    primary: 'var(--color-info-700)',
    positive: 'var(--color-success-700)',
    warning: 'var(--color-warning-700)',
    promote: 'var(--color-promote-700)',
    neutral: 'var(--color-neutral-700)',
    ghost: 'var(--color-neutral-500)',
  }[props.tone]
})
const iconUrl = computed(() => props.svgIcon ? 'url(' + props.svgIcon + ')' : ''
)
</script>

<style scoped>
.tag-container {
  display: flex;
  align-items: center;
  width: fit-content;
  font-family: var(--font-family);
  font-weight: var(--font-weight-medium);
  border-radius: 4px;
  border: 1.5px solid;
}

.civ-tag-icon {
  mask: v-bind(iconUrl);
  mask-size: contain;
  mask-repeat: no-repeat;
  background-color: v-bind(iconColor);
  width: 16px;
  height: 16px;
}

.icon-small {
  width: 16px;
  height: 16px;
}

.big {
  padding: 4px 13px;
  gap: 8px;
}
.small {
  padding: 3px 4px;
  font-size: var(--label-sm-font-size);
  gap: 4px;
}

.critical {
  color: var(--color-danger-700);
  background: var(--color-danger-400);
  border-color: var(--color-danger-500);
}
.primary {
  color: var(--color-info-700);
  background: var(--color-info-400);
  border-color: var(--color-info-500);
}
.positive {
  color: var(--color-success-700);
  background: var(--color-success-400);
  border-color: var(--color-success-500);
}
.warning {
  color: var(--color-warning-700);
  background: var(--color-warning-400);
  border-color: var(--color-warning-600);
}
.promote {
  color: var(--color-promote-700);
  background: var(--color-promote-400);
  border-color: var(--color-promote-500);
}
.neutral {
  color: var(--color-text-light);
  background: var(--color-neutral-200);
  border-color: var(--color-neutral-300);
}
.ghost {
  color: var(--color-neutral-500);
  background: var(--color-neutral-100);
  border-color: var(--color-neutral-300);
}
</style>