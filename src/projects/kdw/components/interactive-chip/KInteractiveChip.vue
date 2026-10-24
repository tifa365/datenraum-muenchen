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
import KButton from '../base/button/KButton.vue'
import Typography from '../base/typography/Typography.vue'
import PhXBold from '~icons/ph/x-bold'

const props = defineProps<{
  idName: string
  groupName?: string
  label?: string
}>()

const emit = defineEmits<{
  click: [id: string]
}>()
</script>

<template>
  <KButton
    rounded
    severity="secondary"
    @click="emit('click', props.idName)">
    <div class="flex flex-wrap-none flex-row items-center gap-2">
      <PhXBold />
      <span
        v-if="props.groupName || props.label"
        class="text-neutral-lighter normal-case">
        <Typography
          v-if="props.groupName"
          variant="paragraph-2"
          >{{ groupName }}:
        </Typography>
        <Typography
          v-if="props.label"
          variant="paragraph-1"
          >{{ label }}</Typography
        >
      </span>
    </div>
  </KButton>
</template>
