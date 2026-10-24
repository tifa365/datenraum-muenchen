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
import { computed } from 'vue'
import clsx from 'clsx'

const props = withDefaults(
  defineProps<{
    as?: string
    text?: string
    variant?:
      | 'header-1'
      | 'header-2'
      | 'header-3'
      | 'header-4'
      | 'paragraph-1'
      | 'paragraph-2'
      | 'caption'
      | 'numeric'
      | 'button-text'
      | 'code-or-data-tables'
  }>(),
  {
    as: 'span',
    variant: 'paragraph-2',
  }
)

const computedClasses = computed(() =>
  clsx(
    // heading
    {
      'font-medium text-4xl': props.variant === 'header-1',
      'font-medium text-3xl': props.variant === 'header-2',
      'font-medium text-2xl': props.variant === 'header-3',
      'font-semibold text-lg': props.variant === 'header-4',
    },
    // paragraph
    {
      'font-semibold text-base': props.variant === 'paragraph-1',
      'font-normal text-base': props.variant === 'paragraph-2',
    },
    // caption
    {
      'font-normal text-sm': props.variant === 'caption',
    },
    // numeric
    // todo: apply roboto condensed
    {
      'font-normal text-sm': props.variant === 'numeric',
    },
    // button-text
    {
      'font-medium text-base uppercase': props.variant === 'button-text',
    },
    // code-or-data-tables
    // todo: apply roboto mono
    {
      'font-normal text-sm': props.variant === 'code-or-data-tables',
    }
  )
)
</script>

<template>
  <component
    :is="props.as"
    :class="computedClasses">
    <slot>{{ text }}</slot>
  </component>
</template>
