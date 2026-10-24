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

<script setup>
import { useAuthStore } from '@/stores/authStore'
import appConfig from '@config/appConfig'

import CIVHeroSection from '@/components/civora-ui/CIVHeroSection.vue'
import CIVHomeQuickLinks from '@/components/civora-ui/CIVHomeQuickLinks.vue'
import COSButton from '@/components/city-os/COSButton.vue'
import HomeHeader from '@/components/civora-ui/layout/header/HomeHeader.vue'
import HomepageHeader from '@/components/homepage/HomepageHeader.vue'
import HomepageQuickLinks from '@/components/homepage/HomepageQuickLinks.vue'
import UserDashboard from '@/components/user-dashboard/user-dashboard.vue'

import { default as AargauHomeView } from '@config/aargau/components/home/HomeView.vue'
import { default as ASCENDHomeView } from '@config/ascend/components/home/HomeView.vue'
import BipHomeView from "@config/bip/components/home/BipHomeView.vue"
import CivoraHomeView from '@config/civora/components/home/CivoraHomeView.vue'
import CzHomeView from '@config/cz/components/home/CzHomeView.vue'
import DatenatlasHomeView from '@config/datenatlas/components/home/DatenatlasHomeView.vue'
import HofHomeView from '@config/hof/components/home/HofHomeView.vue'
import { default as KommOneHomeView } from '@config/komm.one/components/home/HomeView.vue'
import LadadiHomeView from '@config/ladadi/components/home/LadadiHomeView.vue'
import MetrocogHomeView from '@config/metrocog/components/home/MetrocogHomeView.vue'
import NorwalkHomeView from '@config/norwalk/components/home/NorwalkHomeView.vue'
import SiegburgHomeView from '@config/siegburg/components/home/SiegburgHomeView.vue'
import SpcHomeView from '@config/spc/components/home/SpcHomeView.vue'
import TroisdorfHomeView from '@config/trs/components/home/TroisdorfHomeView.vue'
import WetteraukreisHomeView from '@config/wetteraukreis/components/home/WetteraukreisHomeView.vue'
import WivHomeView from '@config/wiv/components/home/WivHomeView.vue'
import MainzHomeView from '@config/mainz/components/home/MainzHomeView.vue'
import JaegHomeView from '@config/jaeg/components/home/JaegHomeView.vue'
import WDHomeView from '@config/wd/components/home/WDHomeView.vue'
import SgfHomeView from '@config/sgf/components/home/SgfHomeView.vue'
import KrcHomeView from '@config/krc/components/home/KrcHomeView.vue'
import SWLUHomeView from '@config/swlu/components/home/SWLUHomeView.vue'
import FnHomeView from '@config/fn/components/home/FnHomeView.vue'
import AugsburgHomeView from '@config/augsburg/components/home/AugsburgHomeView.vue'

const authStore = useAuthStore()
const customerLogo = `/config/${appConfig.customer.name}/assets/images/${appConfig.appHeader.logoFileName}`
const homepageHeaderImage = `/config/${appConfig.customer.name}/assets/images/${appConfig.components.headerImageFileName}`
</script>

<template>
  <!-- NOTE: Remove all configs which are not available before running -->
  <ASCENDHomeView v-if="appConfig.customer.name === 'ascend' && !authStore.authenticated" />
  <AargauHomeView v-else-if="appConfig.customer.name === 'aargau' && !authStore.authenticated" />
  <AugsburgHomeView v-else-if="appConfig.customer.name === 'augsburg' && !authStore.authenticated" />
  <BipHomeView v-else-if="appConfig.customer.name === 'bip' && !authStore.authenticated" />
  <CivoraHomeView v-else-if="appConfig.customer.name === 'civora' && !authStore.authenticated" />
  <CzHomeView v-else-if="appConfig.customer.name === 'cz' && !authStore.authenticated" />
  <DatenatlasHomeView v-else-if="appConfig.customer.name === 'datenatlas' && !authStore.authenticated" />
  <HofHomeView v-else-if="appConfig.customer.name === 'hof' && !authStore.authenticated" />
  <KommOneHomeView v-else-if="appConfig.customer.name === 'komm.one' && !authStore.authenticated" />
  <LadadiHomeView v-else-if="appConfig.customer.name === 'ladadi' && !authStore.authenticated" />
  <MetrocogHomeView v-else-if="appConfig.customer.name === 'metrocog' && !authStore.authenticated" />
  <NorwalkHomeView v-else-if="appConfig.customer.name === 'norwalk' && !authStore.authenticated" />
  <SiegburgHomeView v-else-if="appConfig.customer.name === 'siegburg' && !authStore.authenticated" />
  <SpcHomeView v-else-if="appConfig.customer.name === 'spc' && !authStore.authenticated"/>
  <TroisdorfHomeView v-else-if="appConfig.customer.name === 'trs' && !authStore.authenticated"/>
  <WetteraukreisHomeView  v-else-if="appConfig.customer.name === 'wetteraukreis' && !authStore.authenticated" />
  <MainzHomeView v-else-if="appConfig.customer.name === 'mainz' && !authStore.authenticated" />
  <WivHomeView v-else-if="appConfig.customer.name === 'wiv' && !authStore.authenticated" />
  <JaegHomeView v-else-if="appConfig.customer.name === 'jaeg' && !authStore.authenticated" />
  <WDHomeView v-else-if="appConfig.customer.name === 'wd' && !authStore.authenticated" />
  <SgfHomeView v-else-if="appConfig.customer.name === 'sgf' && !authStore.authenticated" />
  <KrcHomeView v-else-if="appConfig.customer.name === 'krc' && !authStore.authenticated" />
  <SWLUHomeView v-else-if="appConfig.customer.name === 'swlu' && !authStore.authenticated" />
  <FnHomeView v-else-if="appConfig.customer.name === 'fn' && !authStore.authenticated" />
  <main v-else-if="appConfig.customer.useNewCivoraUi === 'true'">
    <CIVHeroSection
      :title="$t('homepage.title') + (authStore.user.parsedToken?.name
        ? ' ' + authStore.user.parsedToken?.name
        : '')"
      :subtitle="$t('homepage.subtitle')"
      :description="$t('homepage.description')"
      :header-image="homepageHeaderImage"
    />
    <CIVHomeQuickLinks/>
    <!-- <HomeHeader :title="$t('homepage.title')"
      :description="$t('homepage.description')"
      :homepageHeaderImage="homepageHeaderImage"
      :logo="customerLogo"/>
    <CIVHomeQuickLinks/> -->
    <UserDashboard
      v-if="authStore.authenticated"
      :widgets="appConfig.customer.modules.home.widgets"
    />
  </main>
  <main
    v-else
    class="main-background">
    <HomepageHeader
      :title="$t('homepage.title') + ' ' + authStore.user.parsedToken?.name"
      :subtitle="$t('homepage.subtitle')"
      :background-image-url="homepageHeaderImage">
      <template
        v-if="appConfig.customer.modules.home.cosButtonActive === 'true'
          && appConfig?.customer?.modules?.dataCatalog?.available === 'true'"
        v-slot:primary-button
      >
        <COSButton
          button-style="outline"
          suffix="src/assets/icons/ThreeDotsVertical.svg"
          route-to="data-catalog/organisation-data"
          :button-text="$t('home.organisation-data')"
          :capitalize-text="false"></COSButton>
      </template>
    </HomepageHeader>
    <HomepageQuickLinks></HomepageQuickLinks>
    <UserDashboard
      v-if="authStore.authenticated"
      :widgets="appConfig.customer.modules.home.widgets"
    />
  </main>

</template>

<style scoped>
.main-background {
  min-height: 95dvh;
  background: var(--color-bg-darker);
}
</style>
