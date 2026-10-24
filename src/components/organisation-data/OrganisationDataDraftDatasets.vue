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
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { getTranslationFor } from '@/projects/kdw/sdk/utils/helpers'
import { truncate } from '@/projects/data-provider-interface/utils/helpers'
import { useAuthStore } from '@/stores/authStore'

import { useAuthToDpiBridge } from '@/projects/kdw/composables/useAuthToDpiBridge'
import { useDatasetDrafts } from '@/composables/useDatasetDrafts'

import { useDpiUtils } from '../../projects/kdw/utils/dpi'

const { toEditMode } = useDpiUtils()

useAuthToDpiBridge()

const { draftDatasetsQuery, items, deleteDatasetDraft, publishDatasetDraft } = useDatasetDrafts()

const dropdownOpen = ref<Record<number, boolean>>({})

function toggleDropdown(index: number) {
  dropdownOpen.value = { ...dropdownOpen.value, [index]: !dropdownOpen.value[index] }
}

async function editItem(item: { id: any; catalog: any }) {
  try {
    handleEdit(item.id, item.catalog)
    closeAllDropdowns()
  } catch (error) {
    console.error(error)
  }
}


function handleEdit(datasetId: any, catalogId: any) {
  toEditMode({
    id: datasetId,
    catalogId: catalogId,
    isDraft: true 
  })
}

async function deleteItem(item: { id: any; catalog: any }) {
    try {
    const response = await deleteDatasetDraft(item.id, item.catalog)
    if (response?.ok) {
      closeAllDropdowns()
    } else {
      console.error(`Failed to delete item: ${response?.statusText}`)
    }
  } catch (error) {
    console.error('Error to delete dataset: ', error)
  }
}


async function publishItem(item: { id: any; catalog: any }) {
    try {
    const response = await publishDatasetDraft(item.id, item.catalog)
    if (response?.ok) {
      closeAllDropdowns()
    } else {
      console.error(`Failed to publish item: ${response?.statusText}`)
    }
  } catch (error) {
    console.error('Error to publish dataset: ', error)
  }
}

function closeAllDropdowns() {
  dropdownOpen.value = {}
}

function handleOutsideClick(event: MouseEvent) {
  const target = event.target as Element
  if (!target.closest('.dropdown')) {
    closeAllDropdowns()
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  draftDatasetsQuery.refetch()
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>
<template>
  <div
    class="row"
    v-if="items.length == 0">
    {{ $t('organisation.datasets.noData') }}
  </div>

  <div v-if="items.length > 0">
    <div class="row">
      <div class="col">{{ $t('organisation.datasets.datasetName') }}</div>
      <div class="col">{{ $t('organisation.datasets.catalog') }}</div>
    </div>

    <template
      v-for="(item, i) in items"
      :key="i">
      <div class="row row-data">
        <div class="col">{{ truncate(getTranslationFor(item.title, $i18n.locale), 42, true) }}</div>
        <div class="col">{{ item.catalog }}</div>
        <div class="col"></div>
        <div class="col"></div>
        <div class="col">
          <div
            class="dropdown"
            ref="dropdowns">
            <img
              @click.stop.prevent="toggleDropdown(i)"
              class="dropdown-button"
              src="../../../src/assets/icons/ThreeDotsVertical.svg" />
            <div
              class="dropdown-content"
              v-show="dropdownOpen[i]">
              <a @click.stop.prevent="editItem(item)">{{ $t('organisation.datasets.edit') }}</a>
              <a @click.stop.prevent="publishItem(item)">{{ $t('organisation.datasets.publish') }}</a>
              <a @click.stop.prevent="deleteItem(item)">{{ $t('organisation.datasets.delete') }}</a>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dropdown {
  position: relative;
}

.dropdown-button {
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
}

.dropdown-button:hover {
  background-color: #f4f6f9;
}

.dropdown-content {
  position: absolute;
  background-color: var(--color-bg-darker);
  border: solid 1px #d5d7da;
  border-radius: 8px;
  width: 180px;
  height: auto;
  z-index: 1;
  right: 0;
  top: -90px;
}

.dropdown-content a {
  margin: auto;
  padding: 10px;
  text-decoration: none;
  display: block;
  color: #1a2025;
  font-size: 16px;
  font-weight: 400;
  line-height: 26px;
}

.dropdown-content a:hover {
  background-color: #d5d7da;
}

.cos-orgnews-widget-grid-item-format-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
}

.cos-orgnews-widget-grid-item-format {
  width: fit-content;
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

.row {
  font-family: var(--font-family), serif;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  width: calc(100% - 60px);
  margin: 20px 40px;
  padding: 5px;
}

.row-data {
  font-size: 15px;
  font-weight: 400;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 30px 20px;
}
.row .col {
  width: calc((100% - 54px) / 5);
  padding: 5px;
  display: flex;
  align-items: center;
}
.row .col:first-of-type {
  width: calc((100% - 54px) / 5 * 2);
}

.row .col:last-of-type {
  width: 54px;
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
    width: 100%;
  }
  .row-data {
    padding: 5px;
  }
}
</style>
