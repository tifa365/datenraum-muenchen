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
import DashboardRadioButton from './DashboardRadioButton.vue'

const pick = ref('')
</script>

<template>
  <Story title="Components/DashboardRadioButton">
    <div class="w-[269px] h-[600px]">
      <DashboardRadioButton
        v-model="pick"
        class="w-[269px] h-[60 0px]"
        input-id="verkehr"
        input-value="verkehr"
        title="Stadtverkehr Übersicht" />
      <DashboardRadioButton
        v-model="pick"
        class="w-[269px] h-[60 0px]"
        input-id="social"
        input-value="social"
        title="Stadtverkehr Übersicht" />
    </div>
  </Story>
</template>

<style scoped></style>
