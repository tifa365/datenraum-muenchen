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
    <LPHeader></LPHeader>
    <CIVViewHeader
      :title="$t('views.public.PublicDataNoticesView.legal.header.title')"
      :description="$t('views.public.PublicDataNoticesView.legal.header.description')"
    >
    </CIVViewHeader>
    <COSViewTabs
      :tabs="tabs"
      :defaultTab="$route.query.tab || 'impressum'"
      @update:tab="handleTabChange" />
    <div v-if="currentTab === 'impressum'">
      <div class="impressum-content">
        <div class="impressum-notice">
          <p style="font-weight: bold">{{ $t('views.public.PublicDataNoticesView.legal.impressum.notice.heading') }}</p>
          <p>
            {{ $t('views.public.PublicDataNoticesView.legal.impressum.notice.paragraph1')}} </p>
          <p>
            {{ $t('views.public.PublicDataNoticesView.legal.impressum.notice.paragraph2') }}
          </p>
          <p>
            {{ $t('views.public.PublicDataNoticesView.legal.impressum.notice.paragraph3') }}
          </p>
        </div>
        <div class="impressum-contact">
          <p style="text-align: center">Daten-Kompetenzzentrum Städte und Regionen DKSR GmbH</p>
          <p style="text-align: center">CEO Dr.-Ing. Alanus von Radecki</p>
          <p style="text-align: center">
            <span
              class="ui-provider ee bpe bjb ceg ceh cei cej cek cel cem cen ceo cep ceq cer ces cet ceu cev cew cex cey cez cfa cfb cfc cfd cfe cff cfg cfh cfi cfj cfk cfl"
              dir="ltr"
              >Linienstraße 86 | D-10119 Berlin<br />
            </span>

          </p>
          <p style="text-align: center">
            <a href="mailto:info@dksr.city">info@dksr.city</a> | <a href="https://www.dksr.city">www.dksr.city</a>
          </p>
          <p style="text-align: center">Amtsgericht Charlottenburg | HRB 227659</p>
          <p style="text-align: center">USt. ID DE342267182</p>
        </div>
      </div>
    </div>
    <div v-if="currentTab === 'datenschutz'">
      Datenschutz
    </div>
    <div v-if="currentTab === 'nutzungsbedingungen'">
      Nutzungsbedingungen
    </div>
    <div v-if="currentTab === 'statements'">
      Statements
    </div>
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router'
import CIVViewHeader from '@/components/civora-ui/CIVViewHeader.vue'
import COSViewTabs from '@/components/city-os/COSViewTabs.vue'
import { ref, computed } from 'vue'
import LPHeader from '@/components/landing-page/LPHeader.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const tabs = computed(() => [
  { label: t('views.public.PublicDataNoticesView.legal.tabs.impressum'), value: 'impressum' },
  { label: t('views.public.PublicDataNoticesView.legal.tabs.datenschutz'), value: 'datenschutz' },
  { label: t('views.public.PublicDataNoticesView.legal.tabs.nutzungsbedingungen'), value: 'nutzungsbedingungen' },
  { label: t('views.public.PublicDataNoticesView.legal.tabs.statements'), value: 'statements' }
])

const router = useRouter()
const currentTab = ref()

const handleTabChange = (selectedTab) => {
  if (!tabs.value.some(tab => tab.value === selectedTab)) {
    currentTab.value = 'impressum'
  }
  router.replace({ query: { tab: selectedTab }})
  currentTab.value = selectedTab
}
</script>

<style scoped>
p {
  max-width: 900px !important;
}
.impressum-content {
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  align-items: center;
  justify-content: center;
}

.impressum-notice {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
