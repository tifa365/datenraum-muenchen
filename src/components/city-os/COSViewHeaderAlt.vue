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
    class="legal-container view-header-background"
    :style="{
      'background-image': 'url(' + backgroundImageUrl + ')',
    }">
    <div class="legal-content">
      <h1 class="legal-title">{{ title }}</h1>
      <h4 class="legal-text">{{ text }}</h4>
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
  text: {
    type: String,
    required: true,
  },
})

const backgroundImageUrl = `config/${appConfig.customer.name}/assets/images/${appConfig.components.headerImageFileName}`
</script>

<style scoped>
.legal-container {
  min-height: 360px;
  width: 100%;
  padding: 1rem 4.5rem;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.legal-content {
  width: 100%;
  backdrop-filter: blur(10px);
  border: 2px #fff;
  background: linear-gradient(187deg, rgba(255, 255, 255, 0.73) 69.27%, rgba(196, 196, 196, 0) 172.21%);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
}

.legal-title {
  width: 100%;
  color: #002e6e;
  font-family: var(--font-family), serif;
  font-size: 32px;
  font-weight: 600;
  text-align: start;
}

.legal-text {
  width: 100%;
  color: #333;
  font-family: var(--font-family), serif;
  font-size: 16px;
  line-height: 24px;
  text-align: start;
}

@media (max-width: 1032px) {
  .legal-title {
    font-size: 28px;
  }

  .legal-text {
    font-size: 14px;
  }

  .legal-container {
    padding: 2rem 2rem;
    min-height: unset !important;
  }
}

@media (max-width: 480px) {
  .legal-title {
    font-size: 24px;
  }

  .legal-text {
    font-size: 12px;
  }

  .legal-container {
    padding: 1rem 1rem;
    min-height: unset !important;
  }
}
</style>
