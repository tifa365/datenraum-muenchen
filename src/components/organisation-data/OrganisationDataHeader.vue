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
        <div class="start-wrapper">
            <h1 class="title">{{ $t('home.organisation-data') }}</h1>
        </div>
        <div class="end-wrapper">
            <COSButton
                    class="new-data-button"
                    :button-text="$t('components.organization-data.OrganizationDataHeader.new-data')"
                    :route-to="dpiRoute"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import COSButton from "@/components/city-os/COSButton.vue";
import appConfig from '@config/appConfig'

const dpiRoute = computed(() => {
  return appConfig.civoraDpiUrl ? '/civora-dpi' : '/dpi/datasets'
})
</script>


<style scoped>
.main-container {
    margin: 40px 24px 48px 32px;
    height: 48px;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: space-between;
    align-items: center;
}
.title {
    color: var(--neutrals-text, #1A2025);
    text-align: center;
    text-shadow: 0 4px 20px rgba(255, 255, 255, 0.25);
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
</style>

