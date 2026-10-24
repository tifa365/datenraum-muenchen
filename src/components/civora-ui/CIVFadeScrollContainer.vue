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
    class="fade-scroll-container"
    ref="scrollContainerRef"
    :class="classObject"
    tabindex="0"
    @scroll="updateScrollState"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  orientation: {
    type: String,
    default: 'horizontal',
    validator: (value: string) => ['horizontal', 'vertical', 'both'].includes(value),
  },
})

const scrollContainerRef = ref<HTMLDivElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const canScrollUp = ref(false)
const canScrollDown = ref(false)

const classObject = computed(() => ({
  'fade-scroll-container-horizontal': props.orientation === 'horizontal' || props.orientation === 'both',
  'fade-scroll-container-vertical': props.orientation === 'vertical' || props.orientation === 'both',
  'has-overflow-left': canScrollLeft.value,
  'has-overflow-right': canScrollRight.value,
  'has-overflow-top': canScrollUp.value,
  'has-overflow-bottom': canScrollDown.value,
  'fade-scroll-container-outline-fix': isFirefox.value,
}))

const updateScrollState = () => {
  const scrollContainer = scrollContainerRef.value

  const hasOverflow = scrollContainer
    ? scrollContainer.scrollWidth > scrollContainer.clientWidth ||
      scrollContainer.scrollHeight > scrollContainer.clientHeight
    : false

  if (!scrollContainer || !hasOverflow) {
    canScrollLeft.value = false
    canScrollRight.value = false
    canScrollUp.value = false
    canScrollDown.value = false
    return
  }

  canScrollLeft.value = scrollContainer.scrollLeft > 0
  canScrollRight.value = scrollContainer.scrollLeft + scrollContainer.clientWidth < scrollContainer.scrollWidth
  canScrollUp.value = scrollContainer.scrollTop > 0
  canScrollDown.value = scrollContainer.scrollTop + scrollContainer.clientHeight < scrollContainer.scrollHeight
}

// Detect Firefox
const isFirefox = computed(() => /Firefox/.test(navigator.userAgent))

let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
  await nextTick()
  updateScrollState()
  if (scrollContainerRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(scrollContainerRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.fade-scroll-container {
  scrollbar-width: thin;
  /* scrollbar-width: none; */ /* Firefox */
  /* -ms-overflow-style: none; */ /* Internet Explorer 10+ */
}

/* Safari and Chrome */
/* .fade-scroll-container::-webkit-scrollbar {
  display: none;
} */

/* .fade-scroll-container::-webkit-scrollbar-thumb {
  display: none;
} */

/* .fade-scroll-container::-webkit-scrollbar-thumb:hover {
  display: none;
} */

.fade-scroll-container-outline-fix:focus-visible {
  border: 2px solid rgb(0, 67, 91);
}

.fade-scroll-container-horizontal {
  position: relative;
  overflow-x: auto;
  touch-action: pan-x;
}

.fade-scroll-container-vertical {
  position: relative;
  overflow-y: auto;
  touch-action: pan-y;
}

.has-overflow-left {
  mask-image: linear-gradient(
    to left,
    black 70%,
    transparent 100%
  );
}

.has-overflow-right {
  mask-image: linear-gradient(
    to right,
    black 70%,
    transparent 100%
  );
}

.has-overflow-top {
  mask-image: linear-gradient(
    to top,
    black 70%,
    transparent 100%
  );
}

.has-overflow-bottom {
  mask-image: linear-gradient(
    to bottom,
    black 70%,
    transparent 100%
  );
}

.has-overflow-top.has-overflow-bottom {
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 30%,
    black 70%,
    transparent 100%
  );
}

.has-overflow-left.has-overflow-right {
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 30%,
    black 70%,
    transparent 100%
  );
}

.has-overflow-left.has-overflow-right.has-overflow-top.has-overflow-bottom {
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 30%,
    black 70%,
    transparent 100%
  ), linear-gradient(
    to bottom,
    transparent 0%,
    black 30%,
    black 70%,
    transparent 100%
  );
}
</style>
