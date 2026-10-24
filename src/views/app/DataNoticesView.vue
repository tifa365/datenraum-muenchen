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
  <main>
    <CIVViewHeader
      v-if="appConfig.customer.useNewCivoraUi === 'true'"
      :title="$t('views.public.PublicDataNoticesView.legal.header.title')"
      :description="$t('views.public.PublicDataNoticesView.legal.header.description')"
    >
    </CIVViewHeader>
    <COSViewHeader
      v-else
      :title="$t('views.public.PublicDataNoticesView.legal.header.title')"
      :subtitle="$t('views.public.PublicDataNoticesView.legal.header.description')">
    </COSViewHeader>
    <CIVViewTabs
      v-if="appConfig.customer.useNewCivoraUi === 'true'"
      :tabs="computedTabs"
      v-model="currentTab"
    />
    <COSViewTabs
      v-else
      :tabs="computedTabs"
      v-model="currentTab" />
    <div v-show="currentTab === 'LegalNotice'" class="tab-content">
      <div class="impressum-content">
        <LegalNotice/>
      </div>
    </div>
    <div v-show="currentTab === 'PrivacyPolicy'" class="tab-content">
      <PrivacyPolicy />
    </div>
    <div v-show="currentTab === 'TermsOfUse'" class="tab-content">
      <TermsOfUse />
    </div>
    <!-- <div v-show="currentTab === 'StatementsNotice'" class="tab-content">
      <StatementsNotice />
    </div> -->
    <div v-show="currentTab === 'AccessibilityInfo'" class="tab-content">
      <AccessibilityInfo />
    </div>
  </main>
</template>

<script setup>
import { computed, defineAsyncComponent, ref } from 'vue'
import { useRouteQuery } from '@vueuse/router'
import { useI18n } from 'vue-i18n'

import appConfig from '@config/appConfig'
import { useAuthStore } from '@/stores/authStore'

import COSViewHeader from '@/components/city-os/COSViewHeader.vue'
import CIVViewHeader from '@/components/civora-ui/CIVViewHeader.vue'
import COSViewTabs from '@/components/city-os/COSViewTabs.vue'
import CIVViewTabs from '@/components/civora-ui/CIVViewTabs.vue'
import {
  availableDataNoticeComponents,
  getDataNoticeComponentPath,
  supportedDataNoticePages,
} from '@/utils/dataNoticePages'

const { t } = useI18n()
const authStore = useAuthStore()

const customerName = appConfig.customer.name
const tabs = ref(supportedDataNoticePages.map(page => ({
  ...page,
  isHidden: true,
  requiresAuth: page.requiresAuth && customerName !== 'datenatlas',
})))
const computedTabs = computed(() =>
  tabs.value
    .filter(tab => {
      const { requiresAuth, isHidden } = tab
      const isAllowedByAuth = !requiresAuth || authStore.authenticated

      if (isHidden) return false

      return isAllowedByAuth
    })
    .map(tab => Object.assign({}, tab, { label: t(tab.translationKey) })))
const currentTab = useRouteQuery('tab', 'LegalNotice')

function wireTab(tab, index) {
  const componentPath = getDataNoticeComponentPath(customerName, tab.id)
  const loadComponent = availableDataNoticeComponents[componentPath]

  if (!loadComponent) return Promise.resolve(null)

  return loadComponent().then(component => {
    tabs.value[index].isHidden = false
    return component
  })
}

const contentPromises = Object.fromEntries(
  tabs.value.map((tab, index) => [tab.id, wireTab(tab, index)])
)
const LegalNotice = defineAsyncComponent(() => contentPromises.LegalNotice)
const PrivacyPolicy = defineAsyncComponent(() => contentPromises.PrivacyPolicy)
const TermsOfUse = defineAsyncComponent(() => contentPromises.TermsOfUse)
const AccessibilityInfo = defineAsyncComponent(() => contentPromises.AccessibilityInfo)
</script>

<style scoped>
p {
  max-width: 900px !important;
}

.impressum-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  justify-content: center;
}

.tab-content{
  padding: 3rem 2rem;
}

@media (max-width: 767px) {
  .tab-content {
    padding: 1rem;
   }
}

.impressum-notice {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
