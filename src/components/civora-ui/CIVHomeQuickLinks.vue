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
        <CIVFloatingButton v-for="(item, index) in quickLinks" :key="index"
            :title="$t(item.title)"
            :subtitle="$t(item.subtitle)"   
            :icon-url="item.icon"     
            :route="item.route"
            :target="item.target"  
        />
    </div>
</template>


<script setup>
import appConfig from '@config/appConfig'
import CIVFloatingButton from './CIVFloatingButton.vue';

const quickLinks = Object.entries(appConfig.homeQuickLinks)
  .filter(entry => entry[1].available === 'true')
  .map(entry => entry[1] )
</script>

<style scoped>
.main-container{
    display: flex;
    justify-content: space-between;
    gap: 24px;
    padding: 32px;
    background: var(--color-bg-darker);
}

@media (max-width: 768px) {
    .main-container{
        padding: 15px 20px;
        gap: 10px;
    }
}

</style>