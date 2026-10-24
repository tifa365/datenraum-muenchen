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
import { computed, ref, type Ref } from 'vue';
import appConfig from '@config/appConfig';
import CIVTag from '../CIVTag.vue';
import CIVButton from '../CIVButton.vue';
import CIVInfoBanner from './CIVInfoBanner.vue';
import CIVDatacatalogDistributionListHeader from './CIVDatacatalogDistributionListHeader.vue';
import CIVDatacatalogDistributionCard from './CIVDatacatalogDistributionCard.vue';
import { useDistributions, type RDFFormat } from '@/composables/useDatasetsDownloads';
import { hasPreview } from '@/composables/usePiveauDataPreview.js'
import CIVDataPreview from './CIVDataPreview.vue';
import { useAuthStore } from '@/stores/authStore';  
import { isOUPUrl } from '@/projects/kdw/composables/useDatasetPreviewTable';
import type { DistributionViewModel } from '@/projects/kdw/components/dsitribution-data-info-box/shared'
import CIVDataPreviewPiveau from './CIVDataPreviewPiveau.vue';

const props = defineProps<{
  distributions: DistributionViewModel[]
}>()

const isModalOpen = ref(false)
const preselectedDistribution: Ref<DistributionViewModel | null> = ref(null)

const openPreview = (distribution?: DistributionViewModel) => {
  if (distribution) {
    preselectedDistribution.value = distribution
  }
  isModalOpen.value = true
}

const authStore = useAuthStore()
const isPreviewEnabled = appConfig.customer.modules.dataCatalog?.isDatasetPreviewEnabled === 'true'
const pvPreviewEnabled = isPreviewEnabled && appConfig.customer.modules.dataCatalog?.previewBehaviorMode === 'piveau'

const previewableDistributions = computed(() => {
  if (!props.distributions || props.distributions.length === 0 || !isPreviewEnabled || !authStore.authenticated) {
    return []
  }

  // legacy behavior
  if (!pvPreviewEnabled) {
    return (props.distributions as DistributionViewModel[]).reduce((acc, dist) => {
      const oupUrl = dist.accessUrls?.find(isOUPUrl)
      if (oupUrl) {
        acc.push({
          title: dist.title || dist.id || 'Unknown',
          id: dist.id,
          accessUrl: oupUrl,
          format: dist.format,
        })
      }
      return acc
    }, [] as { title: string; id: string; accessUrl: string; format: string }[])
  }

  return (props.distributions)
    .filter(dist => hasPreview(dist))
})

const distributionsCount = computed(() => (props.distributions ?? []).length)

// Import the composable
const { downloadDistribution, getFormatName } = useDistributions()

// Available RDF formats for download
const rdfFormats: RDFFormat[] = [
  'application/rdf+xml',
  'application/ld+json',
  'application/n-triples',
  'application/n-quads',
  'application/trig',
  'application/trix',
  'text/turtle',
  'text/n3'
]

// Handle downloading all distributions in a specific format
const handleDownloadAll = async (format: RDFFormat) => {
  const distributions = props.distributions ?? []
  
  if (distributions.length === 0) {
    console.warn('No distributions to download')
    return
  }

  console.log(`Downloading ${distributions.length} distributions in format: ${format}`)

  let successCount = 0
  let errorCount = 0

  // Loop through all distributions and download them one by one
  for (const distribution of distributions) {
    const distributionId = distribution.id
    
    if (!distributionId) {
      console.error('Distribution missing ID:', distribution)
      errorCount++
      continue
    }

    try {
      await downloadDistribution(distributionId, format)
      successCount++
      console.log(`Downloaded distribution ${distributionId} in format ${format}`)
    } catch (error) {
      console.error(`Error downloading distribution ${distributionId}:`, error)
      errorCount++
    }
  }

  // Show summary
  if (errorCount > 0) {
    alert(`Downloaded ${successCount} of ${distributions.length} distributions. ${errorCount} failed.`)
  } else {
    console.log(`Successfully downloaded all ${successCount} distributions`)
  }
}

// Create dropdown items for "Download All" button
const downloadAllFormatItems = computed(() => {
  return rdfFormats.map(format => ({
    text: getFormatName(format),
    icon: '/src/assets/icons/download.svg',
    onClick: () => handleDownloadAll(format)
  }))
})
</script>

<template>
	<section class="distribution-section">
		<div class="distribution-section-header">
			<div class="distribution-title-content">
				<p class="title-lg distribution-section-title">{{ $t('kdw.components.DatasetDetailsContainer.distribution') }}</p>
				<CIVTag :has-close-icon="false" :text="distributionsCount"/>
			</div>
			<div class="distribution-buttons-content">
        <CIVButton v-if="previewableDistributions.length && isPreviewEnabled && authStore.authenticated" type="secondary"
          :label="$t('kdw.components.DatasetDetailsContainer.data-preview')"
          iconSuffix="/src/assets/icons/data-preview.svg" @click="openPreview()" />
        <KeepAlive>
          <CIVDataPreviewPiveau
            v-if="pvPreviewEnabled"
            v-model:is-open="isModalOpen"
            v-model:selected-distribution="preselectedDistribution"
            :distributions="previewableDistributions"
          />
          <CIVDataPreview
            v-else
            v-show="isModalOpen"
            v-model="isModalOpen"
            :distributions="previewableDistributions"
            :preselectedDistribution="preselectedDistribution"
          />
        </KeepAlive>
				<!-- Replace CIVButton with CIVDropdownDatasets -->
				<!-- <CIVDropdownDatasets 
					type="primary" 
					:label="$t('message.datasetDetails.datasets.downloadAll')" 
					iconSuffix="/src/assets/icons/ChevronBottom.svg"
					:list="downloadAllFormatItems" 
				/> -->
			</div>
		</div>
		<CIVInfoBanner
			:title="$t('kdw.components.DatasetDetailsContainer.info-banner.title')"
			:text="$t('kdw.components.DatasetDetailsContainer.info-banner.text')"
		/>
		<div class="distribution-list">
			<CIVDatacatalogDistributionListHeader />
			<div v-for="distribution in distributions" :key="distribution.id">
				<CIVDatacatalogDistributionCard :distribution="distribution" @preview="openPreview"/>
			</div>
		</div>
	</section>
</template>

<style scoped>
.distribution-section {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 40px;
	padding: 40px;
}
.distribution-section .distribution-section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.distribution-section .distribution-section-header .distribution-title-content {
	display: flex;
	align-items: center;
	gap: 8px;
}
.distribution-section-header .distribution-title-content .distribution-section-title {
	color: var(--color-primary-500);
}
.distribution-section-header .distribution-buttons-content {
	display: flex;
	align-items: center;
	gap: 16px;
}
.distribution-section .distribution-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}
@media (max-width: 768px) {
	.distribution-section-header{
		flex-wrap: wrap;
		row-gap: 1.5rem;
	}
}
</style>