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
    <div class="header-section">
      <div class="start-wrapper">
        <h1 class="title">{{ title }}</h1>
        <div class="state-tag">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="6"
            height="6"
            viewBox="0 0 6 6"
            fill="none">
            <circle
              cx="3"
              cy="3"
              r="3"
              fill="#667F93" />
          </svg>
          <p class="state-number">11</p>
        </div>
        <div class="new-datasets">
          <p>{{ newDatasetsText }}</p>
        </div>
      </div>
      <div class="end-wrapper"></div>
      <div class="row search-request">{{ searchRequestsText }}</div>
      <div class="row">
        <input
          type="search"
          v-model="q"
          @keyup.enter="searchAgain"
          :placeholder="$t('components.data-exchange.DataExchangeReqByMe.search')" />
      </div>
    </div>

    <div class="content-section">
      <div class="row">
        <span>13/150 {{ $t('components.data-exchange.DataExchangeReqByMe.requests') }}</span>
        <span class="sort-section"
          >sortieren: freigegeben zuerst
          <img
            src="../../assets/icons/Sort.svg"
            alt="sort icon"
        /></span>
      </div>
    </div>

    <div class="table-section">
      <table>
        <thead>
          <tr>
            <th
              v-for="header in headers"
              :key="header">
              {{ $t(header) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in data"
            :key="row.id">
            <td>{{ row.status }}</td>
            <td>{{ row.datasetName }}</td>
            <td>{{ row.contactPerson }}</td>
            <td>{{ row.requestPeriod }}</td>
            <td>
              <slot
                name="actions"
                :row="row">
                <a href="#">Anfrage ansehen</a><br />
                <a href="#">Verlängerung beantragen</a>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  newDatasetsText: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  searchRequestsText: {
    type: String,
    required: true,
  },
  searchPlaceholder: {
    type: String,
    required: true,
  },
  headers: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
})
</script>

<style scoped>
.main-container {
  margin: 40px 24px 48px 32px;
  padding-top: 20px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}

.header-section {
  display: flex;
  flex-direction: column;
  margin-left: 30px;
  width: 100%;
  margin-top: 20px;
  display: flex;
  justify-content: flex-start;
  color: #667f93;
}

.content-section {
  width: 100%;
  padding: 16px 0;
}

.content-section .row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.title {
  color: var(--neutrals-text, #1a2025);
  font-family: var(--font-family), serif;
  font-size: 24px;
  font-weight: 500;
}

.start-wrapper,
.end-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.state-tag {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: #e7f3ff;
}

.state-number {
  color: #667f93;
  font-family: var(--font-family);
  font-size: 16px;
  font-weight: 600;
}

.new-datasets {
  margin-left: -8px;
  font-size: 14px;
}

.search-request {
  margin-bottom: 8px;
  margin-top: 20px;
}

input[type='search'] {
  border: 1px solid var(--color-border);
  padding: 15px 15px 15px 50px;
  border-radius: 3px;
  width: 50%;
  background: url(../../assets/icons/Searchgray.svg) no-repeat 15px center;
  font-weight: 400;
}

.sort-section {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary-500);
  font-weight: 500;
}

.table-section {
  padding: 10px 30px;
  margin-top: 20px;
  display: block;
  overflow-x: auto;
  width: 100%;
}

table {
  width: 100%;
  min-width: 600px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: white;
  border-collapse: separate;
}

th,
td {
  padding: 16px;
  text-align: left;
}

th {
  background-color: var(--color-bg-darker);
  color: #1a2025;
  font-weight: 600;
}

td {
  color: #1a2025;
}

td a {
  color: var(--color-primary-500);
  text-decoration: none;
  font-weight: 500;
}

td a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .start-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .new-datasets {
    margin-left: 0;
    margin-top: 10px;
  }
  .table-section {
    overflow-x: auto;
  }

  table {
    min-width: 600px;
  }

  th,
  td {
    white-space: nowrap;
    text-align: left;
  }
}
</style>
