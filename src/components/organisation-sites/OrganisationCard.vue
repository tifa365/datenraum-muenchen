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

<script setup lang="ts">
import CIVMaskedIcon from '@/components/civora-ui/CIVMaskedIcon.vue'
import appConfig from '@config/appConfig'
import { mapCatalogToOrganisation } from '@/components/organisation-sites/catalogToOrganisationMapper.vue'
import { useI18n } from 'vue-i18n'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const { t, locale } = useI18n()

const props = defineProps({
  organisation: {
    type: Object,
    required: true,
  },
})

const mappedOrganisation = computed(() => {
  return mapCatalogToOrganisation(props.organisation, locale.value)
})

const categories = computed(() => mappedOrganisation.value.categories ?? [])
const scrollContainerRef = ref<HTMLDivElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

let resizeObserver: ResizeObserver | null = null

const scrollMaskClass = computed(() => {
  if (canScrollLeft.value && canScrollRight.value) return 'has-overflow-both'
  if (canScrollLeft.value) return 'has-overflow-left'
  if (canScrollRight.value) return 'has-overflow-right'
  return ''
})

const updateScrollState = () => {
  const scrollContainer = scrollContainerRef.value

  if (!scrollContainer) {
    canScrollLeft.value = false
    canScrollRight.value = false
    return
  }

  const hasOverflow = scrollContainer.scrollWidth - scrollContainer.clientWidth > 1
  canScrollLeft.value = hasOverflow && scrollContainer.scrollLeft > 1
  canScrollRight.value = hasOverflow
    && scrollContainer.scrollLeft + scrollContainer.clientWidth < scrollContainer.scrollWidth - 1
}

const scrollTags = (direction: 'left' | 'right') => {
  const scrollContainer = scrollContainerRef.value

  if (!scrollContainer) return

  const distance = Math.max(scrollContainer.clientWidth * 0.75, 120)

  scrollContainer.scrollBy({
    left: direction === 'left' ? -distance : distance,
    behavior: 'smooth',
  })
}

const observeScrollContainer = () => {
  resizeObserver?.disconnect()

  if (!scrollContainerRef.value || typeof ResizeObserver === 'undefined') return

  resizeObserver = new ResizeObserver(() => {
    updateScrollState()
  })

  resizeObserver.observe(scrollContainerRef.value)
}

watch(
  categories,
  async () => {
    await nextTick()

    if (scrollContainerRef.value) {
      scrollContainerRef.value.scrollLeft = 0
    }

    updateScrollState()
  },
  { deep: true }
)

onMounted(async () => {
  await nextTick()
  observeScrollContainer()
  updateScrollState()
  window.addEventListener('resize', updateScrollState)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', updateScrollState)
})
</script>
<template>
  <div
    class="main-container">
    <div class="title-content">
      <RouterLink :to="'/app/organisation-sites/' + organisation.id">
        <img
          class="organisation-logo"
          :src="
            organisation.catalogueLogo
              ? organisation.catalogueLogo
              : `config/${appConfig.customer.name}/assets/images/` + appConfig.appHeader.logoFileName
          "
          alt="image" />
        <div class="titles">
          <p class="title">{{ mappedOrganisation.title }}</p>
        </div>
      </RouterLink>
    </div>
    <hr />
    <div class="tags-row">
      <button
        v-if="canScrollLeft"
        type="button"
        class="scroll-button"
        :aria-label="t('organisation.scrollTagsBack')"
        @click="scrollTags('left')">
        <CIVMaskedIcon
          class="scroll-button-icon"
          svg-icon="src/assets/icons/ChevronLeft.svg" />
      </button>
      <div
        ref="scrollContainerRef"
        class="scroll-container"
        :class="scrollMaskClass"
        @scroll="updateScrollState">
        <div
          v-for="(category, index) in categories"
          :key="index"
          class="category-container">
          {{ category }}
        </div>
      </div>
      <button
        v-if="canScrollRight"
        type="button"
        class="scroll-button"
        :aria-label="t('organisation.scrollTagsForward')"
        @click="scrollTags('right')">
        <CIVMaskedIcon
          class="scroll-button-icon"
          svg-icon="src/assets/icons/ChevronRight.svg" />
      </button>
    </div>
  </div>
</template>

<style scoped>
a {
  display: flex;
}

.main-container {
  width: 320px;
  height: 170px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: #fff;
  margin: 30px 15px;
}

.tags-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
}

.scroll-container {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: hidden;
  white-space: nowrap;
  gap: 8px;
  scroll-behavior: smooth;
  scrollbar-width: none;
  touch-action: pan-y;
}

.scroll-container.has-overflow-left {
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 16%,
    black 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 16%,
    black 100%
  );
}

.scroll-container.has-overflow-right {
  mask-image: linear-gradient(
    to right,
    black 84%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    black 84%,
    transparent 100%
  );
}

.scroll-container.has-overflow-both {
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 16%,
    black 84%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 16%,
    black 84%,
    transparent 100%
  );
}

.scroll-container::-webkit-scrollbar {
  display: none;
}

.scroll-container::-webkit-scrollbar-thumb {
  display: none;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
  display: none;
}

.scroll-button {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
}

.scroll-button:hover {
  background: var(--color-bg-darker);
}

.scroll-button:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.scroll-button-icon {
  width: 20px;
  height: 20px;
  background-color: var(--color-text-muted);
}

.category-container {
  padding: 5px 12px;
  border-radius: 40px;
  border: 1px solid var(--color-border);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title-content {
  padding: 16px;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
}

.titles {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
}

.title {
  color: #1a2025;
  font-family: var(--font-family), serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 26px; /* 162.5% */
}

.subtitle {
  color: #667f93;
  font-family: var(--font-family), serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px; /* 142.857% */
}

.organisation-logo {
  width: 64px;
  height: 64px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  object-fit: contain;
  padding: 2px;
}

@media (max-width: 1200px) {
  .main-container {
    width: 40%;
    margin: 30px 3.33%;
  }
}

@media (max-width: 768px) {
  .main-container {
    width: 320px;
    margin: 30px calc((100% - 320px) / 2);
  }
}

@media (max-width: 400px) {
  .main-container {
    width: 100%;
    margin: 30px 0px;
  }
}
</style>
