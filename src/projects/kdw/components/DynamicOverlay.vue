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
  <div class="fullscreen-overlay">
    <div class="overlay-content" :class="`overlay-content--${width}`">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

defineProps({
  width: {
    type: String,
    default: 'full',
    validator: (value) => ['full', 'medium', 'small'].includes(value)
  }
})

const emit = defineEmits(['close'])

onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
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

.overlay-content--medium {
  width: 100%;
  max-width: 1200px;
}

.overlay-content--small {
  width: 100%;
  max-width: 600px;
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