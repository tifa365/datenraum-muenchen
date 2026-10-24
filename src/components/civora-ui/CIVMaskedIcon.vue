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

<!--
  SVG Icon implemented as mask so it can be colorized as needed
  by setting the background-color property
-->
<template>
  <div class="masked-icon" :class="`masked-icon-${size}`"></div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

const props = defineProps({
  svgIcon: {
    type: String,
    required: true
  },
  size: {
    type: String as PropType<'small' | 'medium' | 'large'>,
    default: 'medium',
    validator: (value: string) => ['small', 'medium', 'large'].includes(value)
  }
})

const iconUrl = computed(() => `url(${props.svgIcon})`)
</script>

<style scoped>
.masked-icon {
  mask: v-bind(iconUrl);
  mask-size: contain;
  mask-repeat: no-repeat;
}

.masked-icon-small {
  width: 14px;
  height: 14px;
}

.masked-icon-medium {
  width: 24px;
  height: 24px;
}

.masked-icon-large {
  width: 32px;
  height: 32px;
}
</style>