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
  <div v-show="isOpen" ref="overlayRef" class="civ-overlay-container">
    <div class="civ-overlay-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, watch, onUnmounted, nextTick } from 'vue'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'

const overlayRef = useTemplateRef('overlayRef')
const { activate, deactivate } = useFocusTrap(overlayRef, { escapeDeactivates: false })

const isOpen = defineModel<boolean>('isOpen', { required: true })

const props = defineProps({
  focusTrap: {
    type: Boolean,
    default: true
  }
})

watch(isOpen, async (newVal: boolean) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
    if (props.focusTrap) {
        await nextTick()
        activate()
      }
  } else {
    document.body.style.overflow = ''
    if (props.focusTrap) {
      await nextTick()
      deactivate()
    }
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  if (props.focusTrap) {
    deactivate()
  }
})
</script>

<style scoped>
.civ-overlay-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2147483650;
  padding: 1rem;
  background: rgba(42, 68, 80, 0.49);
  display: flex;
  align-items: center;
  justify-content: center;
}

.civ-overlay-content {
  border-radius: 8px;
  border: 1px solid var(--color-divider);
  background: var(--color-bg-white);
  box-shadow: 0 8px 20px 0 rgba(0, 0, 0, 0.06), 0 24px 60px 0 rgba(0, 0, 0, 0.12);
}
</style>