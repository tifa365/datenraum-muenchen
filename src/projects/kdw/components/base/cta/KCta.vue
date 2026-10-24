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
const props = defineProps<{
  title?: string
  text?: string
}>()
</script>

<template>
  <div class="text-neutral-900 flex h-[91px] max-h-[91px] gap-4 rounded-lg border bg-white">
    <div class="size-[91px] flex-none rounded-l-lg bg-primary-800 text-white">
      <div class="grid size-full place-content-center">
        <div class="grid place-content-center">
          <slot name="icon">
            <div class="size-12 bg-white" />
          </slot>
        </div>
      </div>
    </div>
    <div class="flex-1">
      <slot>
        <div class="py-4 pr-4 text-content">
          <p class="text-base font-semibold">
            {{ props.title }}
          </p>
          <p class="text-sm">
            {{ props.text }}
          </p>
        </div>
      </slot>
    </div>
  </div>
</template>
