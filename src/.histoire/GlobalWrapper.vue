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

<script lang="ts" setup>
import { Story, Variant } from 'histoire'

const props = defineProps<{
  story: Story
  variant?: Variant
}>()

function hasWrapper () {
  return props.story.meta?.wrapper !== false &&
    props.variant?.meta?.wrapper !== false
}
</script>

<template>
  <div
    class="global-wrapper"
    :style="hasWrapper() ? 'padding: 0.25rem; border: solid 1px rgba(0, 0, 0, 0.05);' : ''"
  >
    <slot />
  </div>
</template>
