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
import CIVTooltip from '@/components/civora-ui/CIVTooltip.vue'

type TooltipPosition = 'left' | 'right' | 'top' | 'bottom'

withDefaults(
  defineProps<{
    svgIcon: string
    label: string
    tooltipText?: string
    color?: string
    size?: number
    position?: TooltipPosition
    portal?: boolean
  }>(),
  {
    tooltipText: '',
    color: 'var(--color-button-regular)',
    size: 24,
    position: 'top',
    portal: true,
  }
)
</script>

<template>
  <CIVTooltip
    v-if="svgIcon && tooltipText"
    :text="tooltipText"
    :position="position"
    :portal="portal">
    <span
      class="tooltip-icon"
      role="img"
      :aria-label="label">
      <CIVMaskedIcon
        :svg-icon="svgIcon"
        class="tooltip-icon__image"
        :style="{ backgroundColor: color, width: `${size}px`, height: `${size}px` }" />
    </span>
  </CIVTooltip>
  <span
    v-else-if="svgIcon"
    class="tooltip-icon"
    role="img"
    :aria-label="label">
    <CIVMaskedIcon
      :svg-icon="svgIcon"
      class="tooltip-icon__image"
      :style="{ backgroundColor: color, width: `${size}px`, height: `${size}px` }" />
  </span>
</template>

<style scoped>
.tooltip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tooltip-icon__image {
  flex-shrink: 0;
}
</style>
