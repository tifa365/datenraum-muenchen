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
import { ref } from 'vue'
import KRadioButton from './KRadioButton.vue'

const ingredient = ref('')
</script>

<template>
  <Story title="Base Components/RadioButton">
    <div class="flex flex-col flex-wrap gap-3">
      <div class="flex items-center">
        <KRadioButton
          v-model="ingredient"
          input-id="ingredient1"
          name="pizza"
          value="Cheese">
          Cheese
        </KRadioButton>
      </div>
      <div class="flex items-center">
        <KRadioButton
          v-model="ingredient"
          input-id="ingredient2"
          name="pizza"
          value="Mushroom">
          Mushroom
        </KRadioButton>
      </div>
      <div class="flex items-center">
        <KRadioButton
          v-model="ingredient"
          input-id="ingredient3"
          name="pizza"
          value="Pepper">
          Pepper
        </KRadioButton>
      </div>
      <div class="flex items-center">
        <KRadioButton
          v-model="ingredient"
          input-id="ingredient4"
          name="pizza"
          value="Onion">
          Onion
        </KRadioButton>
      </div>
    </div>
  </Story>
</template>

<style scoped></style>
