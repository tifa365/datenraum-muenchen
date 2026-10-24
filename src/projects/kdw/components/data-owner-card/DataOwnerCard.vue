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
import Typography from '@/projects/kdw/components/base/typography/Typography.vue'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'

const { t, te } = useI18n()

const props = withDefaults(
  defineProps<{
    icon?: string
    label?: string
    translationKey?: string
    selected?: boolean
    onToggle?: () => void
  }>(),
  {
    icon: 'icon-[ph--globe-hemisphere-west]',
    selected: false,
  }
)

const resolvedLabel = computed(() => {
  if (props.translationKey && te(`datasets.${props.translationKey}`)) {
    return t(`datasets.${props.translationKey}`)
  }
  return props.label ?? ''
})

const tooltipText = computed(() => {
  if (props.translationKey && te(`datasets.tooltips.${props.translationKey}`)) {
    return t(`datasets.tooltips.${props.translationKey}`)
  }
  return ''
})

const iconRef = ref<HTMLElement | null>(null)
const tooltipVisible = ref(false)
const tooltipStyle = ref({ top: '0px', left: '0px' })

function showTooltip() {
  if (!iconRef.value) return
  const rect = iconRef.value.getBoundingClientRect()
  tooltipStyle.value = {
    top: `${rect.top + rect.height / 2}px`,
    left: `${rect.right + 8}px`,
  }
  tooltipVisible.value = true
}

function hideTooltip() {
  tooltipVisible.value = false
}
</script>

<template>
  <div
    class="flex flex-row flex-nowrap items-center gap-2 rounded-lg p-2 transition-colors border select-none"
    :class="props.onToggle
      ? [
          'cursor-pointer',
          props.selected
            ? 'bg-surface-100 border-surface-300'
            : 'bg-white border-surface-200 hover:bg-surface-50'
        ]
      : 'cursor-default bg-bg-darker border-transparent'"
    @click.stop="props.onToggle?.()"
  >
    <img
      v-if="props.icon?.startsWith('/')"
      :src="props.icon"
      class="flex-shrink-0 h-5 w-5"
      alt=""
      aria-hidden="true"
    />
    <i
      v-else
      class="flex-shrink-0 text-neutral-icon"
      :class="props.icon"
    />
    <Typography
      class="w-48 flex-1 truncate"
      variant="paragraph-2">
      {{ resolvedLabel }}
    </Typography>
    <div
      class="info-tooltip"
      @mouseenter="showTooltip"
      @mouseleave="hideTooltip"
    >
      <i
        ref="iconRef"
        class="icon-[ph--info] flex-shrink-0 text-neutral-icon"
      />
      <Teleport to="body">
        <span
          v-if="tooltipVisible && tooltipText"
          :style="{
            position: 'fixed',
            zIndex: 9999,
            backgroundColor: '#2d3841',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '12px',
            padding: '8px 12px',
            width: 'max-content',
            minWidth: '80px',
            maxWidth: '300px',
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            pointerEvents: 'none',
            top: tooltipStyle.top,
            left: tooltipStyle.left,
            transform: 'translateY(-50%)',
          }"
        >
          {{ tooltipText }}
        </span>
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
.info-tooltip {
  position: relative;
  display: inline-flex;
  align-items: center;
}
</style>