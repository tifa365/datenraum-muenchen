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
import { useI18n } from 'vue-i18n'
import AdminPageCard from '@/components/admin/AdminPageCard.vue'
import CIVViewHeader from '@/components/civora-ui/CIVViewHeader.vue'
import { useAdminCards } from '@/composables/useAdminCards'
import { useAuthStore } from '@/stores/authStore'
import appConfig from '@config/appConfig'

const { t } = useI18n()

const availableCards = useAdminCards()
</script>

<template>
  <main class="admin-page-container">
    <CIVViewHeader
      :title="t('admin-tools.title')"
      :description="t('admin-tools.subtitle')">
    </CIVViewHeader>
    <section class="card-container">
      <AdminPageCard
        v-for="adminCard in availableCards"
        :key="adminCard.key"
        :iconUrl="adminCard.icon"
        :title="t(`${adminCard.translationKey}.title`)"
        :description="t(`${adminCard.translationKey}.description`)"
        :link="adminCard.link" />
    </section>
  </main>
</template>

<style scoped>
.admin-page-container {
  width: 100%;
  min-height: calc(100vh - 72px);
  background-color: var(--color-neutral-200);
}

.card-container {
  width: 100%;
  padding: 32px;
  display: flex;
  align-items: stretch;
  justify-content: start;
  flex-wrap: wrap;
  column-gap: 41px;
  row-gap: 32px;
}
</style>
