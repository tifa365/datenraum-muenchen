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
  <CIVAppLayout v-if="appConfig.customer.useNewCivoraUi === 'true'"></CIVAppLayout>
  <COSAppLayout v-else></COSAppLayout>
  <div id="app-content" class="app-content" tabindex="-1"><RouterView> </RouterView></div>
</template>

<script setup>
import COSAppLayout from '@/components/city-os/layout/COSAppLayout.vue'
import CIVAppLayout from '@/components/civora-ui/layout/CIVAppLayout.vue';
import appConfig from '@config/appConfig';
</script>

<style scoped>
@media (max-width: 1032px) {
  .app-content {
    /* padding-top: 71px; */
    height: calc(100dvh - 73px);
  }
}

@media (min-width: 1033px) {
  .app-content {
    /* padding-top: 73px; */
    padding-left: 72px;
    height: calc(100dvh - 72px);
    /* width: calc(100dvw - 73px); */
  }
}
</style>
