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
  <div class="nav tab">
    <a
      :class="activeTab === 'requestedByMe' ? 'active' : ''"
      @click="activeTab = 'requestedByMe'"
      >{{ $t('components.data-exchange.DataExchange.req-datasets-by-me') }}</a
    >
    <a
      :class="activeTab === 'requestedFromMe' ? 'active' : ''"
      @click="activeTab = 'requestedFromMe'"
      >{{ $t('components.data-exchange.DataExchange.req-datasets-from-me') }}</a
    >
  </div>
  <div>
    <DataExchangeTable
      :title="
        activeTab === 'requestedByMe'
          ? t('components.data-exchange.DataExchangeReqByMe.title')
          : t('components.data-exchange.DataExchangeReqFromMe.title')
      "
      :newDatasetsText="
        activeTab === 'requestedByMe'
          ? t('components.data-exchange.DataExchangeReqByMe.new-datasets')
          : t('components.data-exchange.DataExchangeReqFromMe.new-datasets')
      "
      :searchRequestsText="
        activeTab === 'requestedByMe'
          ? t('components.data-exchange.DataExchangeReqByMe.search-requests')
          : t('components.data-exchange.DataExchangeReqFromMe.search-requests')
      "
      :searchPlaceholder="
        activeTab === 'requestedByMe'
          ? t('components.data-exchange.DataExchangeReqByMe.search')
          : t('components.data-exchange.DataExchangeReqFromMe.search')
      "
      :headers="headers"
      :data="tableData">
      <template #actions>
        <div>
          <template v-if="activeTab === 'requestedByMe'">
            <a
              href="#"
              class="link-with-icon">
              Anfrage ansehen
              <img
                src="../../assets/icons/ArrowRight.svg"
                alt="arrow"
                class="icon-spacing" />
            </a>
            <br />
            <a
              href="#"
              class="link-with-icon">
              Verlängerung beantragen
              <img
                src="../../assets/icons/ArrowRight.svg"
                alt="arrow"
                class="icon-spacing" />
            </a>
          </template>
          <a
            v-else
            href="#"
            class="link-with-icon">
            Zur Anfrage
            <img
              src="../../assets/icons/ArrowRight.svg"
              alt="arrow"
              class="icon-spacing" />
          </a>
        </div>
      </template>
    </DataExchangeTable>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import DataExchangeTable from './DataExchangeTable.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const headers = [
  'components.data-exchange.DataExchangeReqByMe.status',
  'components.data-exchange.DataExchangeReqByMe.datasetName',
  'components.data-exchange.DataExchangeReqByMe.contactPerson',
  'components.data-exchange.DataExchangeReqByMe.requestPeriod',
  'components.data-exchange.DataExchangeReqByMe.actions',
]
const tableData = [
  {
    status: 'Freigegeben',
    datasetName: 'Flächennutzung/Verkehrsfläche Stadt Ingolstadt',
    contactPerson: 'Test Tester',
    requestPeriod: '10.10.2024 – 10.10.2025',
  },
]

let activeTab = ref('requestedByMe')
</script>
<style scoped>
.link-with-icon {
  display: inline-flex;
  align-items: center;
  color: var(--color-primary-500); 
  font-weight: 500;
  text-decoration: none; 
  display: inline-flex;
  align-items: center;
  transition: color 0.3s ease;
}

.icon-spacing {
  margin-left: 4px;
}
.nav {
  font-size: 15px;
  color: var(--button-pressed, var(--color-primary-500));
  display: flex;
  padding: 30px;
  font-weight: 500;
}

.content {
  background: var(--color-bg-dark);
  width: 100%;
  padding: 32px;
  display: flex;
  flex-wrap: wrap;
}

.tab {
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 0px;
  font-size: 17px;
}
.tab a {
  cursor: pointer;
}
.active {
  color: var(--color-primary-500) !important;
  border-bottom: 1px solid var(--color-primary-500);
}
.tab a {
  margin-right: 50px;
  color: #33404a;
}
</style>
