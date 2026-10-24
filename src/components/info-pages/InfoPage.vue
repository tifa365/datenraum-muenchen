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

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouteQuery } from '@vueuse/router'
import appConfig from '@config/appConfig'
import { useInfoPages, type InfoTab } from '@/composables/useInfoPages'
import COSViewHeader from '@/components/city-os/COSViewHeader.vue'
import CIVViewHeader from '@/components/civora-ui/CIVViewHeader.vue'
import COSViewTabs from '@/components/city-os/COSViewTabs.vue'
import CIVViewTabs from '@/components/civora-ui/CIVViewTabs.vue'

const { t } = useI18n()
const infoPages = useInfoPages()
const computedInfoPages = computed(() => (infoPages.value ?? [])
  .map((infoTab: InfoTab) => {
    return {
      id: infoTab.id,
      label: t(infoTab.translationKey),
      component: infoTab.component,
      isHidden: infoTab.isHidden
    }
  })
)
const firstAvailableTab = computed(() => computedInfoPages?.value?.[0]?.id ?? '')

const currentTab = useRouteQuery('tab');

watchEffect(() => {
  if (!currentTab.value && firstAvailableTab.value) {
    currentTab.value = firstAvailableTab.value
  }
})
</script>

<template>
  <CIVViewHeader v-if="appConfig?.customer?.useNewCivoraUi === 'true'"
    :title="$t('info.title')"
    :description="$t('info.subtitle')"
  />
  <COSViewHeader v-else :title="$t('info.title')" :subtitle="$t('info.subtitle')" />
  <main>
    <CIVViewTabs
      v-if="appConfig?.customer?.useNewCivoraUi === 'true'"
      :tabs="computedInfoPages"
      v-model="currentTab"
    />
    <COSViewTabs
      v-else
     :tabs="computedInfoPages"
     v-model="currentTab"
    />
    <div v-for="tab in computedInfoPages" :key="tab.id" v-show="currentTab === tab.id" class="tab-content">
      <component :is="tab.component" v-if="tab.component" />
    </div>
  </main>
</template>

<style scoped>
main {
  background-color: var(--color-bg-darker);
}
.tab-content {
  margin: 32px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg-white);
}
</style>