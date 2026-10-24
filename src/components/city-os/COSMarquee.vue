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
    <div class="marquee-container" :class="{ animated: !prefersReducedMotion }" :data-direction="direction" :data-speed="speed">
        <div class="marquee-content" ref="marqueeContent" :style="{ speed: speed , direction: direction}">
            <div v-for="(item, index) in items" :key="index" class="marquee-item">
                <slot :name="item.slotName" />
            </div>
        </div>
    </div>
</template>

<script setup>
import {computed, onMounted, ref, useSlots} from 'vue';

const props = defineProps({
    speed: {
        type: String,
        default: 'normal',
        validator: value => ['fast', 'normal', 'slow'].includes(value)
    },
    direction: {
        type: String,
        default: 'left',
        validator: value => ['left', 'right'].includes(value)
    }
});

const slots = useSlots();
const items = computed(() => {
    return Object.keys(slots).map((slotName, index) => ({
        slotName,
        key: index
    }));
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const marqueeContent = ref(null);

onMounted(() => {
    if (!prefersReducedMotion) {
        addAnimation();
    }
});

function addAnimation() {
    const scrollerContent = Array.from(marqueeContent.value.children);
    scrollerContent.forEach(item => {
        const duplicatedItem = item.cloneNode(true);
        duplicatedItem.setAttribute('aria-hidden', 'true');
        marqueeContent.value.appendChild(duplicatedItem);
    });
}
</script>

<style scoped>
.marquee-container {
    max-width: inherit;
}

.marquee-content {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding-block: 1rem;
}

.marquee-item {
    gap: 16px;
}

.marquee-container.animated {
    overflow: hidden;
}

.marquee-container.animated .marquee-content {
    width: max-content;
    flex-wrap: nowrap;
    animation: scroll var(--_animation-duration, 40s) var(--_animation-direction, forwards) linear infinite;
}

.marquee-container[data-direction="right"] {
    --_animation-direction: reverse;
}

.marquee-container[data-direction="left"] {
    --_animation-direction: forwards;
}

.marquee-container[data-speed="fast"] {
    --_animation-duration: 10s;
}

.marquee-container[data-speed="normal"] {
    --_animation-duration: 20s;
}

.marquee-container[data-speed="slow"] {
    --_animation-duration: 30s;
}

@keyframes scroll {
    to {
        transform: translate(calc(-50% - 0.5rem));
    }
}

.marquee-item {
    flex-shrink: 0;
    display: flex;
}
</style>
