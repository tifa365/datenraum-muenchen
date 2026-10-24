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
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import appConfig from '@config/appConfig'
import { useRoute } from 'vue-router'
import { useAuthStore } from "@/stores/authStore";

const route = useRoute()
const organisationId = route.params.organisationId || ''
const staleTime = 2 * 60 * 1000

let authStore = useAuthStore()

const middlewareOrgMembersUrl = appConfig.middlewareUrl.endsWith('/')
  ? appConfig.middlewareUrl + 'orgMembers'
  : appConfig.middlewareUrl + '/orgMembers'

const colleaguesQuery = useQuery({
  queryKey: [`orgMembers${organisationId}`],
  staleTime: staleTime,
  refetchOnWindowFocus: false,
  queryFn: async () => {
    const response = await fetch(
      middlewareOrgMembersUrl,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await authStore.getAuthToken()}`,
        },
      }
    )
    if (!response.ok) {
      throw new Error(`failed to fetch data from middleware ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    return data
  },
})

const items = computed(() => {
  if (colleaguesQuery.isSuccess.value && colleaguesQuery.data.value) {
    getAccessTags(colleaguesQuery.data.value[0].access)
    return colleaguesQuery.data.value
  }
  return []
})

function abbr(firstname: String, lastname: String) {
  return firstname[0] + lastname[0]
}

function getAccessTags(accesses: Object) {
  return Object.entries(accesses)
    .filter(([, value]) => value === true)
    .map(([key]) =>
      key.replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .replace(/^./, str => str.toUpperCase())
    )
}
</script>
<template>
  <div
    class="row"
    v-if="items.length == 0">
    {{ $t('organisation.colleagues.noData') }}
  </div>

  <div v-if="items.length > 0">
    <div class="row row-header">
      <div>{{ $t('organisation.colleagues.name') }}</div>
      <div>{{ $t('organisation.colleagues.position') }}</div>
      <div>{{ $t('organisation.colleagues.access') }}</div>
      <div>{{ $t('organisation.colleagues.contact') }}</div>
    </div>

    <template
      v-for="(item, i) in items"
      :key="i">
      <div class="row row-data">
        <div>
          <span class="user-initials">{{ abbr(item.firstName, item.lastName) }} </span>{{ item.firstName }}
          {{ item.lastName }}
        </div>
        <div class="access">
          <span class="tag" v-for="(position, index) in item.attributes?.position" :key="index">
            {{ position }}
          </span>
        </div>
        <div class="access">
          <span class="tag" v-for="(tag, index) in getAccessTags(item.access)" :key="index">
            {{ tag }}
          </span>
        </div>
        <div>
          <a v-if="item.email" :href="'mailto:' + item.email"><img
            src="../../assets/icons/EmailGray.svg"/>{{ $t('organisation.colleagues.email') }}</a>
          <a v-if="item.phone" :href="'tel:' + item.phone"><img
            src="../../assets/icons/PhoneGray.svg"/>{{ $t('organisation.colleagues.phone') }}</a>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.row {
  font-size: 14px;
  font-weight: 500;
  display: flex;
  width: calc(100% - 60px);
  margin: 20px 40px;
  padding: 5px;
}
.row-header {
  border-bottom: 1px solid var(--color-border);
}
.row-data {
  color: #33404a;
  font-size: 15px;
  font-weight: 400;
  padding: 0px;
}
.row-data a {
  display: flex;
}
.row-data img {
  margin-right: 5px;
  margin-bottom: 5px;
}
.row div {
  width: 25%;
  padding: 5px;
  align-content: center;
}
input[type='search'] {
  border: 1px solid var(--color-border);
  padding: 15px 15px 15px 50px;
  border-radius: 3px;
  width: 50%;
  margin: 20px 0px;
  background: url(../../assets/icons/Searchgray.svg) no-repeat scroll 15px 15px;
  font-weight: 400;
}
.user-initials {
  text-align: center;
  font-weight: 600;
  line-height: 78px;
  border: 1px solid #33404a;
  border-radius: 50%;
  padding: 15px;
  margin-right: 10px;
  background-color: #33404a0e;
}

.access {
  display: flex;
  flex-wrap: wrap;
  gap: 8px
}

.access .tag {
  width: -moz-fit-content;
  width: fit-content;
  height: -moz-fit-content;
  height: fit-content;
  padding: 4px;
  background: var(--color-bg-darker);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-family: var(--font-family), sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #33404a;
}

@media (max-width: 768px) {
  .row {
    flex-wrap: wrap;
    margin: 10px 20px;
    width: unset;
  }
  input[type='search'] {
    width: 100%;
  }
  .row div {
    width: 50%;
  }
  .row-data {
    padding: 5px;

    border: 1px solid var(--color-border);
    border-radius: 10px;
  }
  .row-header {
    border-bottom: unset;
  }
}
</style>
