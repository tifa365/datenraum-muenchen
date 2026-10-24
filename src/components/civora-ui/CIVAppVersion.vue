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
  <div class="body-lg app-version-info">
    {{ `${$t('civora.layout.app-header-dropdown.version')}: ${appConfig?.appVersion || 'dev'}` }}
  </div>
</template>

<script setup lang="ts">
import appConfig from '@config/appConfig'
</script>

<style scoped>
.app-version-info {
  display: flex;
  gap: 8px;
  padding: 27px 24px 0 24px;
  color: var(--color-neutral-500);
  border-top: 1px solid var(--color-border);
  word-break: break-all;
}
</style>