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
import KCard from './KCard.vue'
</script>

<template>
  <Story title="Base Components/Card">
    <KCard>
      <template #title> Offene Anfragen </template>
      <template #content>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error amet atque debitis fugiat culpa consectetur
        numquam quidem, quisquam, animi facilis odit, provident accusantium obcaecati placeat rerum quibusdam eos iste.
        Nesciunt?
      </template>
    </KCard>
  </Story>
</template>

<style scoped></style>
