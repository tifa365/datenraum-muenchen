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
    class="main-container view-header-background"
    :style="backgroundStyle">
    <CIVCardBasic 
      class="civ-view-header-card"
      v-bind="props">
      <template v-if="$slots.iconSection" #iconSection>
        <slot name="iconSection"/>
      </template>
      <template v-if="$slots.tags" #tags>
        <slot name="tags"/>
      </template>
      <template v-if="$slots.actions" #actions>
        <slot name="actions"/>
      </template>
      <template v-if="$slots.search" #search>
        <slot name="search"/>
      </template>
      <template v-if="$slots.meta" #meta>
        <slot name="meta"/>
      </template>
      <template v-if="$slots.footer" #footer>
        <slot name="footer"/>
      </template>
      <template v-if="$slots.bottomLeft" #bottomLeft>
        <slot name="bottomLeft"/>
      </template>
    </CIVCardBasic>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import appConfig from '@config/appConfig'
import CIVCardBasic from './layout/header/CIVCardBasic.vue'

const props = withDefaults(defineProps<{
  title: string
  description?: string
  image?: string
  url?: string
  compactMode?: boolean
  showAllText?: boolean
  cardClass?: string
  cardStyle?: Record<string, string>
  descriptionClass?: string
}>(),
{
  showAllText: true,
  descriptionClass: 'body-lg'
})

// deprecated method of setting background image
// use view-header-background class and its associated variables instead
// will be removed in the future
const backgroundStyle = computed(() => ({
  'background-image': `url(config/${appConfig.customer.name}/assets/images/${appConfig.components.headerImageFileName})`,
}))
</script>

<style scoped>
.main-container {
  width: 100%;
  display: flex;
  justify-content: center;
  background: lightgray
    linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.48) 1.83%,
      rgba(0, 0, 0, 0.48) 19.92%,
      rgba(0, 0, 0, 0.34) 40.44%,
      rgba(0, 0, 0, 0.28) 55.42%,
      rgba(0, 0, 0, 0.23) 69.12%,
      rgba(0, 0, 0, 0.14) 92.15%,
      rgba(0, 0, 0) 130.66%
    )
    0 -100.205px / cover no-repeat center;
  padding: 32px;
}
</style>
