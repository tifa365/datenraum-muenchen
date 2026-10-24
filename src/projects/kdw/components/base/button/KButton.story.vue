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

<script setup>
import { ref } from 'vue'
import { logEvent } from 'histoire/client'
import KButton from './KButton.vue'

const text = ref('Neue Daten')
</script>

<template>
  <Story
    title="Base Components/Button"
    :layout="{ type: 'grid' }">
    <Variant title="Severity">
      <div class="card justify-content-center flex flex-wrap gap-3">
        <KButton
          :label="text"
          @click="logEvent('click', $event)" />
        <KButton
          :label="text"
          severity="secondary"
          @click="logEvent('click', $event)" />
        <KButton
          :label="text"
          severity="success"
          @click="logEvent('click', $event)" />
        <KButton
          :label="text"
          severity="info"
          @click="logEvent('click', $event)" />
        <KButton
          :label="text"
          severity="warning"
          @click="logEvent('click', $event)" />
        <KButton
          :label="text"
          severity="help"
          @click="logEvent('click', $event)" />
        <KButton
          :label="text"
          severity="danger"
          @click="logEvent('click', $event)" />
        <KButton
          :label="text"
          severity="contrast"
          @click="logEvent('click', $event)" />
      </div>
    </Variant>
    <Variant title="Rounded">
      <div class="card justify-content-center flex flex-wrap gap-3">
        <KButton
          rounded
          :label="text"
          @click="logEvent('click', $event)" />
        <KButton
          rounded
          :label="text"
          severity="secondary"
          @click="logEvent('click', $event)" />
        <KButton
          rounded
          :label="text"
          severity="success"
          @click="logEvent('click', $event)" />
        <KButton
          rounded
          :label="text"
          severity="info"
          @click="logEvent('click', $event)" />
        <KButton
          rounded
          :label="text"
          severity="warning"
          @click="logEvent('click', $event)" />
        <KButton
          rounded
          :label="text"
          severity="help"
          @click="logEvent('click', $event)" />
        <KButton
          rounded
          :label="text"
          severity="danger"
          @click="logEvent('click', $event)" />
        <KButton
          rounded
          :label="text"
          severity="contrast"
          @click="logEvent('click', $event)" />
      </div>
    </Variant>
    <Variant title="Icon">
      <div class="card justify-content-center flex flex-wrap gap-3">
        <KButton
          icon="icon-[ph--download]"
          :label="text"
          icon-pos="left"
          @click="logEvent('click', $event)" />
        <KButton
          icon="icon-[ph--download]"
          :label="text"
          severity="secondary"
          icon-pos="left"
          @click="logEvent('click', $event)" />
        <KButton
          icon="icon-[ph--download]"
          :label="text"
          severity="success"
          icon-pos="left"
          @click="logEvent('click', $event)" />
        <KButton
          icon="icon-[ph--download]"
          :label="text"
          severity="info"
          icon-pos="left"
          @click="logEvent('click', $event)" />
        <KButton
          icon="icon-[ph--download]"
          :label="text"
          severity="warning"
          icon-pos="left"
          @click="logEvent('click', $event)" />
        <KButton
          icon="icon-[ph--download]"
          :label="text"
          severity="help"
          icon-pos="left"
          @click="logEvent('click', $event)" />
        <KButton
          icon="icon-[ph--download]"
          :label="text"
          severity="danger"
          icon-pos="left"
          @click="logEvent('click', $event)" />
        <KButton
          icon="icon-[ph--download]"
          :label="text"
          severity="contrast"
          icon-pos="left"
          @click="logEvent('click', $event)" />
      </div>
    </Variant>
    <Variant title="icon only">
      <KButton
        icon="icon-[ph--download]"
        @click="logEvent('click', $event)" />
    </Variant>
    <Variant title="loading">
      <KButton
        loading
        @click="logEvent('click', $event)" />
    </Variant>
    <Variant>
      <KButton
        rounded
        @click="logEvent('click', $event)">
        {{ text }}
      </KButton>
    </Variant>

    <template #controls>
      <HstText
        v-model="text"
        title="default slot" />
    </template>
  </Story>
</template>
