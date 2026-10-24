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
const props = defineProps({
  iconFilename: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
    required: true,
  },
  buttonPath: {
    type: String,
    required: false,
  },
})

</script>

<template>
  <div class="widget">
    <div class="img-wrapper">
      <img
        :src="'src/assets/icons/' + iconFilename"
        alt="Widget Icon" />
    </div>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <a v-if="buttonPath" :href="buttonPath + '/'" target="_blank">
      <div class="button">
        <span class="text">{{ buttonText }}</span>
        <img
          src="../../assets/icons/ArrowRightWhite.svg"
          alt="Arrow Right" />
      </div>
    </a>
  </div>
</template>

<style scoped>
.widget {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 32px;
  padding: 24px 16px;
  border-radius: 8px;
  border: 1px solid #D8E1E7;
}
.widget .img-wrapper {
  width: 40px;
  padding: 3px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background-color: rgba(147, 178, 195, 0.2);
}
.widget .img-wrapper img {
  width: 32px;
}
.widget h2 {
  font-size: 22px;
  font-weight: 500;
  color: var(--color-neutral-700);
}
.widget p {
  font-size: 16px;
  color: var(--color-neutral-600);
}
.widget .button {
  display: flex;
  gap: 12px;
  width: fit-content;
  padding: 16px;
  border-radius: 8px;
  color: var(--color-neutral-100);
  background-color: var(--color-primary-500);
}
</style>