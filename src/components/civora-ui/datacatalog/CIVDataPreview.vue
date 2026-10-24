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
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useDatasetPreviewTable } from '@/projects/kdw/composables/useDatasetPreviewTable'

import CIVDynamicOverlay from '@/components/civora-ui/CIVDynamicOverlay.vue'

import CIVIcon from '../CIVIcon.vue'
import CIVDropdown from '../CIVDropdown.vue'
import CIVTag from '../CIVTag.vue'
import CIVButton from '../CIVButton.vue'
import CIVViewTabs from '../CIVViewTabs.vue'
import type { DistributionViewModel } from '@/projects/kdw/components/dsitribution-data-info-box/shared'

const { t } = useI18n();

const props = defineProps<{
	distributions?: DistributionViewModel[] | null
	preselectedDistribution?: DistributionViewModel | null
}>()


const previewTabs = [
	{
		id: 'table',
		label: t('datasetDetails.tabs.table'),
	}
]

const isOpen = defineModel<boolean>({ required: true })

const selectedPreview = ref<DistributionViewModel | null>(null)
const currentTab = ref('table')

watch(
  () => isOpen.value,
  (open: boolean) => {
    if (!open) return

    if (props.preselectedDistribution && props.distributions) {
      selectedPreview.value =
        props.distributions.find(
          (d: DistributionViewModel) => d.id === props.preselectedDistribution?.id
        ) ?? null
      return
    }

    if (props.distributions && props.distributions.length === 1) {
      selectedPreview.value = props.distributions[0]
    }
  }
)

const selectedPreviewId = computed(() => isOpen.value ? selectedPreview.value?.id ?? null : null)
const selectedPreviewUrl = computed(() => isOpen.value ? selectedPreview.value?.accessUrl ?? null : null)
const selectedPreviewFormat = computed(() => selectedPreview.value?.format)
const { previewTableHeader, previewTableData, isLoadingPreviewTable, isError } = useDatasetPreviewTable(selectedPreviewId, selectedPreviewUrl)

const onClose = () => {
  isOpen.value = false
}

const selectPreview = (option: DistributionViewModel) => {
	selectedPreview.value = option
}
</script>

<template>
	<CIVDynamicOverlay v-model:is-open="isOpen" width="full">
		<div class="data-preview-modal-container">
			<div class="modal-header">
				<p class="modal-header-title title-md">
					{{ $t('datasetDetails.preview') }}
				</p>
				<CIVIcon iconUrl="/src/assets/icons/Close.svg" :onClick="onClose" />
			</div>
			<div>
				<p class="caption body-md">
					{{ $t('datasetDetails.choose-dataset') }}
				</p>
				<CIVDropdown :placeholder="selectedPreview?.title || 'Distribution'" :closeOnSelect="true"
					class="distribution-dropdown">
					<div class="preview-list">
						<p class="dropdown-content" v-for="option in props.distributions" :key="option.id" @click="selectPreview(option)">
							{{ option.title }}
						</p>
					</div>
				</CIVDropdown>
			</div>
			<div class="distribution-wrapper" v-if="!isLoadingPreviewTable">
				<div class="distribution-header">
					<div class="distribution-title-content">
						<CIVIcon iconUrl="/src/assets/icons/FileIcon.svg" />
						<p class="distribution-title title-md"> 
							{{ selectedPreview?.title }}
						</p>
						<CIVTag class="preview-format body-lg" :has-close-icon="false" :has-dot-icon="false"
							:text="selectedPreviewFormat" tone="ghost" />
					</div>
					<a :href="selectedPreviewUrl">
						<CIVButton v-if="selectedPreviewUrl" class="download-button" type="tertiary" size="large"
							:label="$t('message.metadata.downloadUrl')" iconSuffix="/src/assets/icons/ChevronBottomBlue.svg" />
					</a>
				</div>
				<CIVViewTabs class="preview-tabs" :tabs="previewTabs" v-model="currentTab" />
				<div v-show="currentTab === 'table' && !isLoadingPreviewTable && !isError && previewTableData.length" class="table-wrapper">
					<table class="data-table">
						<thead class="table-header">
							<tr class="table-header-row">
								<th v-for="col in previewTableHeader" :key="col.field" class="table-header-cell body-md">
									<div class="th-content">
										{{ col.field }}
									</div>
								</th>
							</tr>
						</thead>
						<tbody class="table-body">
							<tr v-for="(row, rowIndex) in previewTableData" :key="rowIndex" class="table-body-row">
								<td v-for="col in previewTableHeader" :key="col.field" class="table-body-cell body-md">
									{{ row[col.field] ?? "—" }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			<div v-else class="loading-preview-table" />
		</div>
	</CIVDynamicOverlay>
</template>

<style scoped>
.data-preview-modal-container {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 14px;
}

.modal-header-title {
	color: var(--color-neutral-700);
}

.dropdown-content {
	cursor: pointer;
	padding: 4px;
	padding-left: 12px;
	border-radius: 4px;
	text-transform: capitalize;
}

.dropdown-content:hover {
	background-color: var(--color-neutral-300);
}

.caption {
	color: var(--color-neutral-600);
}

.distribution-dropdown {
	max-width: 544px;
}

.distribution-wrapper {
	border: 1px solid var(--color-border);
	border-radius: 8px;
}

.distribution-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 68px;
	background-color: var(--color-bg-darker);

}

.distribution-title-content {
	display: flex;
	justify-content: space-between;
	gap: 24px;
	align-items: center;
	padding-left: 20px;
}

.distribution-title {
	color: var(--color-neutral-700);
}

.preview-format {
	color: var(--color-neutral-700);
	padding: 0 4px;
}

.preview-tabs {
	background-color: var(--color-bg-base);
	padding-left: 0 !important;
}

.table-wrapper {
	overflow-x: auto;
	border: 1px solid var(--color-border);
	padding: 11px 4px 0;
}

.data-table {
	width: 100%;
	min-width: 700px;
}

.table-header {
	background-color: var(--color-bg-darker);
}

.table-header-cell {
	padding: 32px 16px 12px 48px;
	text-transform: uppercase;
	color: var(--color-neutral-600);
}

.th-content {
	display: flex;
}

.table-body-row {
	border-top: 1px solid var(--color-border);
}

.table-body-row:nth-child(even) {
	background-color: var(--color-bg-darker);
}

.table-body-cell {
	padding: 12px 16px 12px 48px;
	color: var(--color-neutral-600);
}

.loading-preview-table {
 	display: grid;
  place-content: center;
  width: 100%;
  height: 24rem; 
  border-radius: 0.5rem; 
  background-color: #94a3b8; 
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
