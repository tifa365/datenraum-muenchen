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
    v-if="isInfoBoxVisible"
    class="info-box">
    <img
      src="../../assets/icons/Info.svg"
      alt="Info Icon"
      class="info-icon" />
    <div class="info-content">
      <p>{{ $t('components.data-exchange.DataExchangeHeaderReqInfo.first-line') }}</p>
      <p>{{ $t('components.data-exchange.DataExchangeHeaderReqInfo.second-line') }}</p>
      <a href="#"
        >{{ $t('components.data-exchange.DataExchangeHeaderReqInfo.link-text') }}
        <img
          src="../../assets/icons/ArrowRight.svg"
          alt="arrow" />
      </a>
    </div>
    <img
      class="close-icon"
      @click="hideInfoBox"
      src="../../assets/icons/Close.svg"
      alt="" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isInfoBoxVisible = ref(true)

const hideInfoBox = () => {
  isInfoBoxVisible.value = false
}
</script>

<style scoped>
.info-box {
  display: flex;
  align-items: flex-start;
  background-color: #e7f3ff;
  border: 1px solid #d5e4f2;
  border-radius: 8px;
  border-color: #9ebbf3;
  padding: 16px;
  font-family: var(--font-family), serif;
  color: var(--color-primary-500);
}

.info-box .info-icon {
  font-size: 24px;
  margin-right: 10px;
  color: var(--color-primary-500);
}

.info-box p {
  margin: 0 0 8px 0;
}

.info-box a {
  color: var(--color-primary-500);
  text-decoration: none;
  font-size: 14px;
}

.info-box a:hover {
  text-decoration: underline;
}

.info-box p:last-of-type {
  margin-bottom: 20px;
}

.info-icon {
  width: 27px;
  height: 27px;
  background-color: #a8dcfb;
  padding: 2px;
  border-radius: 4px;
  margin-right: 12px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}
.close-icon {
  cursor: pointer;
  margin-left: auto;
  margin-top: -6px;
}
.info-content a {
  color: var(--color-primary-500);
  text-decoration: none;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
}

.info-content img {
  width: 19px;
  height: auto;
  margin-left: 6px;
}
</style>
