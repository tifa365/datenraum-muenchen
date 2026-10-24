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

<template>
  <div
    class="main-container"
    :style="{ 'background-image': 'url(' + backgroundImageUrl + ')' }">
    <div class="content-row">
      <div class="homepage-info">
        <h1 class="title">{{ title }}</h1>
        <h6 class="subtitle">{{ subtitle }}</h6>
      </div>
    </div>
  </div>
</template>

<script setup>
import appConfig from '@config/appConfig'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
})

const backgroundImageUrl = `config/${appConfig.customer.name}/assets/images/${appConfig.components.headerImageFileName}`
</script>

<style scoped>
.title {
  color: #fff;
  text-align: center;
  text-shadow: 0 4px 20px rgba(255, 255, 255, 0.25);
  font-family: var(--font-family), serif;
  font-size: 28px;
  font-style: normal;
  font-weight: 500;
  line-height: 36px;
}

.subtitle {
  color: var(--color-bg-darker);
  text-shadow: 0 3px 15px rgba(0, 0, 0, 0.61);
  font-family: var(--font-family), serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 26px;
}
.main-container {
  height: 260px;
  width: 100%;
  display: flex;
  background: lightgray
    linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.48) 1.83%,
      rgba(0, 0, 0, 0.48) 19.92%,
      rgba(0, 0, 0, 0.34) 40.44%,
      rgba(0, 0, 0, 0.28) 55.42%,
      rgba(0, 0, 0, 0.23) 69.12%,
      rgba(0, 0, 0, 0.14) 92.15%,
      rgba(0, 0, 0, 0) 130.66%
    )
    0 -100.205px / cover no-repeat;
}

.content-row {
  padding: 40px 40px 40px 64px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.homepage-info {
  display: flex;
  flex-direction: column;
  gap: 30px;
  justify-content: center;
  align-items: start;
}
</style>
