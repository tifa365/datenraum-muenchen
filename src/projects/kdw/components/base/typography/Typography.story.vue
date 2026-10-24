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
import { ref } from 'vue'
import Typography from './Typography.vue'

const text = ref('The lazy fox jumps over the quick brown dog')
</script>

<template>
  <Story
    icon="ph:text-aa"
    title="Base Components/Typography"
    :layout="{ type: 'grid', width: 600 }">
    <Variant title="H1 (Header 1)">
      <Typography variant="header-1">{{ text }}</Typography>
    </Variant>
    <Variant title="H2 (Header 2)">
      <Typography variant="header-2">{{ text }}</Typography>
    </Variant>
    <Variant title="H3 (Header 3)">
      <Typography variant="header-3">{{ text }}</Typography>
    </Variant>
    <Variant title="H4 (Header 4)">
      <Typography variant="header-4">{{ text }}</Typography>
    </Variant>
    <Variant title="Paragraph 1">
      <Typography variant="paragraph-1">{{ text }}</Typography>
    </Variant>
    <Variant title="Paragraph 2">
      <Typography variant="paragraph-2">{{ text }}</Typography>
    </Variant>
    <Variant title="Caption">
      <Typography variant="caption">{{ text }}</Typography>
    </Variant>
    <Variant title="Numeric (Data and Statistics)">
      <Typography variant="numeric">{{ text }}</Typography>
    </Variant>
    <Variant title="Button Text">
      <Typography variant="button-text">{{ text }}</Typography>
    </Variant>
    <Variant title="Code or Data Tables">
      <Typography variant="code-or-data-tables">{{ text }}</Typography>
    </Variant>
    <template #controls>
      <HstText
        v-model="text"
        title="Text" />
    </template>
  </Story>
</template>
