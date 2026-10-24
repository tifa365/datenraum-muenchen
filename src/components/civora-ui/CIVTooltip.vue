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
    ref="triggerRef"
    class="tooltip"
    :class="positionClass"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    @focusin="showTooltip"
    @focusout="hideTooltip"
    @keydown="onTriggerKeydown">
    <slot :tooltip-id="tooltipId" :visible="isVisible"></slot>
    <span v-if="!portal" :id="tooltipId" role="tooltip" class="tooltip-text title-sm">
      <slot name="content">{{ text }}</slot>
    </span>
  </div>
  <Teleport v-if="portal" to="body">
    <span
      v-if="isVisible"
      :id="tooltipId"
      ref="tooltipRef"
      :role="interactive ? 'dialog' : 'tooltip'"
      :aria-label="interactive ? label : undefined"
      class="tooltip-text tooltip-text-portal title-sm"
      :class="{ 'tooltip-text-interactive': interactive }"
      :style="tooltipStyle"
      @mouseenter="cancelHide"
      @mouseleave="hideTooltip"
      @focusin="cancelHide"
      @focusout="hideTooltip"
      @keydown="onContentKeydown">
      <slot name="content">{{ text }}</slot>
    </span>
  </Teleport>
</template>

<script setup>
import { computed, onUnmounted, ref, useId, watch } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    default: 'right',
    validator: (value) => ['left', 'right', 'top', 'bottom'].includes(value),
  },
  portal: {
    type: Boolean,
    default: false,
  },
  interactive: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
})

const triggerRef = ref(null)
const tooltipRef = ref(null)
const tooltipId = useId()
let hideTimer
const isVisible = ref(false)
const tooltipCoordinates = ref({ top: 0, left: 0, transform: 'none' })

const tooltipStyle = computed(() => ({
  top: `${tooltipCoordinates.value.top}px`,
  left: `${tooltipCoordinates.value.left}px`,
  transform: tooltipCoordinates.value.transform,
}))

function calculatePosition() {
  if (!triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()
  const gap = 8
  const minViewportPadding = 16
  const maxTooltipWidth = 300
  const centeredLeft = Math.min(
    Math.max(rect.left + rect.width / 2, minViewportPadding + maxTooltipWidth / 2),
    window.innerWidth - minViewportPadding - maxTooltipWidth / 2
  )

  if (props.position === 'left') {
    const hasSpaceOnLeft = rect.left >= maxTooltipWidth + gap + minViewportPadding
    tooltipCoordinates.value = {
      top: rect.top + rect.height / 2,
      left: hasSpaceOnLeft ? rect.left - gap : rect.right + gap,
      transform: hasSpaceOnLeft ? 'translate(-100%, -50%)' : 'translateY(-50%)',
    }
    return
  }

  if (props.position === 'top') {
    tooltipCoordinates.value = {
      top: rect.top - gap,
      left: centeredLeft,
      transform: 'translate(-50%, -100%)',
    }
    return
  }

  if (props.position === 'bottom') {
    tooltipCoordinates.value = {
      top: rect.bottom + gap,
      left: centeredLeft,
      transform: 'translateX(-50%)',
    }
    return
  }

  const hasSpaceOnRight = window.innerWidth - rect.right >= maxTooltipWidth + gap + minViewportPadding
  tooltipCoordinates.value = {
    top: rect.top + rect.height / 2,
    left: hasSpaceOnRight ? rect.right + gap : rect.left - gap,
    transform: hasSpaceOnRight ? 'translateY(-50%)' : 'translate(-100%, -50%)',
  }
}

function showTooltip() {
  if (!props.portal) return
  cancelHide()
  calculatePosition()
  isVisible.value = true
}

function cancelHide() {
  clearTimeout(hideTimer)
}

function hideTooltip(event) {
  if (!props.portal) return
  if (props.interactive) {
    const nextTarget = event?.relatedTarget
    if (nextTarget instanceof Node &&
      (triggerRef.value?.contains(nextTarget) || tooltipRef.value?.contains(nextTarget))) return
    cancelHide()
    hideTimer = setTimeout(() => {
      if (triggerRef.value?.contains(document.activeElement) ||
        tooltipRef.value?.contains(document.activeElement)) return
      isVisible.value = false
    }, 150)
    return
  }
  isVisible.value = false
}

function closeTooltip() {
  cancelHide()
  isVisible.value = false
}

function onTriggerKeydown(event) {
  if (event.key === 'Escape') closeTooltip()
  if (props.interactive && isVisible.value && event.key === 'Tab' && !event.shiftKey) {
    const link = tooltipRef.value?.querySelector('a[href]')
    if (link) {
      event.preventDefault()
      link.focus()
    }
  }
}

function onContentKeydown(event) {
  if (!props.interactive) return
  if (event.key === 'Escape' || event.key === 'Tab') {
    if (event.key === 'Escape' || event.shiftKey) event.preventDefault()
    triggerRef.value?.querySelector('button, [tabindex="0"]')?.focus()
    if (event.key === 'Escape' || !event.shiftKey) closeTooltip()
  }
}

function stopTrackingPosition() {
  window.removeEventListener('resize', calculatePosition)
  window.removeEventListener('scroll', calculatePosition, true)
}

watch(isVisible, (visible) => {
  stopTrackingPosition()
  if (visible) {
    window.addEventListener('resize', calculatePosition)
    window.addEventListener('scroll', calculatePosition, true)
  }
})

onUnmounted(() => {
  cancelHide()
  stopTrackingPosition()
})

const positionClass = `tooltip-${props.position}`
</script>

<style scoped>
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip-text {
  position: absolute;
  z-index: 1;
  visibility: hidden;
  width: max-content;
  max-width: 450px;
  min-width: 80px;
  margin: 2px;
  padding: 8px 12px;
  border-radius: 12px;
  pointer-events: none;
  background-color: var(--color-neutral-600);
  color: var(--color-neutral-100);
  text-align: center;
  white-space: normal;
  word-wrap: break-word;
}

.tooltip-left .tooltip-text {
  top: 0;
  right: 105%;
}

.tooltip-right .tooltip-text {
  top: 0;
  left: 105%;
}

.tooltip-top .tooltip-text {
  bottom: 105%;
  left: 50%;
  transform: translateX(-50%);
}

.tooltip-bottom .tooltip-text {
  top: 105%;
  left: 50%;
  transform: translateX(-50%);
}

.tooltip:hover .tooltip-text,
.tooltip:focus-within .tooltip-text {
  visibility: visible;
}

.tooltip-text-portal {
  position: fixed;
  z-index: 9999;
  visibility: visible;
  max-width: 300px;
}

.tooltip-text-interactive {
  pointer-events: auto;
  text-align: left;
}

@media (min-width: 1124px) and (max-width: 1330px) {
  .tooltip .tooltip-text {
    max-width: 350px;
  }
}

@media (max-width: 852px) {
  .tooltip .tooltip-text {
    max-width: 280px;
  }
}

@media (max-width: 768px) {
  .tooltip-text {
    display: none;
  }

  .tooltip-text-portal {
    display: block;
    max-width: min(300px, calc(100vw - 32px));
  }
}
</style>
