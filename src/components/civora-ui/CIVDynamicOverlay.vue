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
  <div v-show="isOpen" ref="overlayRef" class="fullscreen-overlay">
    <div class="overlay-content" :class="`overlay-content--${width} overlay-content-height--${height}`">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, watch, onUnmounted, nextTick } from 'vue'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'

const overlayRef = useTemplateRef('overlayRef')
const { activate, deactivate } = useFocusTrap(overlayRef)

const isOpen = defineModel<boolean>('isOpen', { required: true })

const props = defineProps({
  width: {
    type: String,
    default: 'full',
    validator: (value: string) => ['full', 'medium', 'small'].includes(value)
  },
  height: {
    type: String as () => 'full' | 'medium' | 'small',
    default: 'full',
    validator: (value: string) => ['full', 'medium', 'small'].includes(value)
  },
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
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2147483650;
  padding: 1rem;
  background: rgba(0, 45, 61, 0.56);
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-content {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  height: 100%;
  overflow: auto;
}

.overlay-content--full {
  width: 100%;
}
.overlay-content-height--full {
  height: 100%;
}

.overlay-content--medium {
  width: 100%;
  max-width: 1200px;
}
.overlay-content-height--medium {
  height: 75%;
}

.overlay-content--small {
  width: 100%;
  max-width: 600px;
}
.overlay-content-height--small {
  height: 50%;
}

@media (max-width: 1033px) {
  .overlay-content {
    padding: 0.5rem;
  }
  .fullscreen-overlay {
    padding: 0.5rem;
  }
}
</style>