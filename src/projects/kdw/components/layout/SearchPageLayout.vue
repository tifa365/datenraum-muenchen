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
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="relative">
    <div class="sm:ml-80 min-w-0 overflow-x-auto">
      <section class="sm:hidden">
        <slot name="hamburger">hamburger</slot>
      </section>
      <div class="section flex-none">
        <slot name="top">
          <div>A</div>
        </slot>
      </div>
      <div class="flex-1">
        <slot>
          <div class="h-[1000px]">C</div>
          <div class="h-[1000px]">D</div>
        </slot>
      </div>
    </div>
    <div class="hidden sm:block fixed top-0 max-w-80 h-screen bg-surface-100 z-10" :aria-label="t('aria-labels.filter')">
      <slot name="sidebar">Sidebar</slot>
    </div>
  </div>
</template>
