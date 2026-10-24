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
  <header class="header">
    <div class="header-info">
      <img
        class="customer-logo"
        :src="headerLogo"
        alt="City Logo" />
      <h1 class="header-title">{{ headerTitle }}</h1>
    </div>
    <nav class="header-buttons">
      <!--      <COSTooltip-->
      <!--        position="left"-->
      <!--        text="Notifications">-->
      <!--        <HeaderIconButton-->
      <!--          icon="Bell.svg"-->
      <!--          alt="Test"-->
      <!--          route="/app/tbd"></HeaderIconButton>-->
      <!--      </COSTooltip>-->
      <COSTooltip
        position="left"
        text="Nutzerprofil">
        <HeaderIconButton
          icon="User.svg"
          alt="Test"
          route="/app/user-profile"></HeaderIconButton>
      </COSTooltip>
      <COSTooltip
        position="left"
        text="Warning">
        <HeaderIconButton
          icon="Info.svg"
          alt="Test"
          route="/app/tbd"></HeaderIconButton>
      </COSTooltip>
    </nav>
  </header>
</template>

<script setup>
import HeaderIconButton from '@/components/navigation/header/HeaderIconButton.vue'
import COSTooltip from '@/components/city-os/COSTooltip.vue'
import appConfig from '@config/appConfig'

const headerLogo = `config/${appConfig.customer.name}/assets/images/${appConfig.appHeader.logoFileName}`
const headerTitle = appConfig.appHeader.headerTitle
</script>

<style scoped>
.customer-logo {
  height: 40px;
  object-fit: contain;
}
.header-title {
  font-family: var(--font-family), serif;
  color: #33404a;
  font-weight: 600;
  font-size: 18px;
  font-style: normal;
  line-height: 20px;
}
.header {
  z-index: 999;
  height: 72px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  background-color: white;
  color: black;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #d4dde3;
}

.header-info {
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
  padding-left: 32px;
}

.header-buttons {
  display: flex;
  flex-direction: row;
  gap: 16px;
  padding-right: 32px;
}
</style>
