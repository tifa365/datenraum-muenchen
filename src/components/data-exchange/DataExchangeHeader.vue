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
    <div class="main-container">
      <div class="header-section">
        <div class="start-wrapper">
          <h1 class="title">{{ $t('components.data-exchange.DataExchangeHeader.title') }}</h1>
        </div>
        <div class="end-wrapper">
          <COSButton
            class="new-data-button"
            :button-text="$t('components.data-exchange.DataExchangeHeader.button-header')"
            route-to="/" />
          <div class="dropdown" ref="dropdowns">
            <img
              class="dropdown-button"
              src="../../../src/assets/icons/ThreeDotsVertical.svg" />
            <div class="dropdown-content">
              <a href="#">Choice A</a>
              <a href="#">Choice B</a>
            </div>
          </div>
        </div>
      </div>
      <div class="info-section">
        <DataExchangeHeaderReqInfo></DataExchangeHeaderReqInfo>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import COSButton from '@/components/city-os/COSButton.vue'
  import DataExchangeHeaderReqInfo from './DataExchangeHeaderReqInfo.vue';
  </script>
  
  <style scoped>
  .main-container {
    padding: 48px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background-color: rgb(244, 244, 244);
  }
  
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  .info-section {
    width: 100%;
    margin-top: 16px;
  }
  
  .title {
    color: #1a2025;
    font-family: var(--font-family), serif;
    font-size: 24px;
    font-style: normal;
    font-weight: 500;
    line-height: 28px;
  }
  
  .start-wrapper,
  .end-wrapper {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .new-data-button {
    height: 48px;
  }
  
  .dropdown {
    position: relative;
  }
  
  .dropdown-button {
    border: 1px solid #167d89;
    border-radius: 8px;
    cursor: pointer;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
  }
  
  .dropdown-button img {
    width: 16px;
    height: auto;
  }
  
  .dropdown-button:hover {
    background-color: #f4f6f9;
  }
  
  .dropdown-content {
    display: none;
    position: absolute;
    background-color: var(--color-bg-darker);
    border: solid 1px #d5d7da;
    border-radius: 8px;
    width: 180px;
    z-index: 1;
    right: 0;
    top: 100%;
    margin-top: 1px;
  }
  
  .dropdown-content a {
    padding: 10px;
    text-decoration: none;
    display: block;
    color: #1a2025;
    font-size: 16px;
    font-weight: 400;
    line-height: 26px;
  }
  
  .dropdown-content a:hover {
    background-color: #d5d7da;
  }
  
  .dropdown:hover .dropdown-content {
    display: block;
  }
  </style>
  