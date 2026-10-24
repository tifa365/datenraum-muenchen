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
import KCta from './KCta.vue'
import PhStack from '~icons/ph/stack'

const text = ref('Hello World')
</script>

<template>
  <Story
    title="Components/CallToAction"
    :layout="{ type: 'grid', width: 400 }">
    <Variant title="Default">
      <KCta
        title="Daten Analysieren"
        text="Hier kannst du deine Datensets analysieren">
      </KCta>
    </Variant>

    <Variant title="Icon">
      <KCta
        title="Daten Analysieren"
        text="Hier kannst du deine Datensets analysieren">
        <template #icon>
          <PhStack class="text-4xl" />
        </template>
      </KCta>
    </Variant>
  </Story>
</template>
