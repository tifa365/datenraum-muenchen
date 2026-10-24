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
import { ref, computed, type PropType, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CIVButton from '../CIVButton.vue'
import CIVTag from '../CIVTag.vue'
import CIVMetadata from './CIVMetadata.vue'
import CIVMetadataTimeInfoCard from './CIVMetadataTimeInfoCard.vue'
import CIVDropdownDatasets from '../CIVDropdownDatasets.vue'
import { useDistributions, type RDFFormat } from '@/composables/useDatasetsDownloads'
import { useAuthStore } from '@/stores/authStore'
import { isOUPUrl, useDownload } from '@/composables/useDownload'
import { hasPreview } from '@/composables/usePiveauDataPreview'
import { getLicenseLabelShort } from '@/projects/kdw/sdk/utils/helpers'
import appConfig from '@config/appConfig'

const { t: $t } = useI18n()

const shareIcon = new URL('@/assets/icons/share.svg', import.meta.url).href

interface PropertyTableEntryValue {
  type: 'value'
  id: string
  data: string
}

interface PropertyTableEntryHref {
  type: 'href'
  id: string
  data: {
    href: string
    label: string
  }
}

interface PropertyTableEntryNode {
  type: 'node'
  id: string
  label: string
  data: (PropertyTableEntryValue | PropertyTableEntryHref)[]
}

interface DistributionViewModel {
  id: string
  title?: string
  description?: string
  format?: string
  accessUrls: string[]
  downloadUrls: string[]
  properties: PropertyTableEntryNode[]
}

const props = defineProps({
  distribution: {
    type: Object as PropType<DistributionViewModel>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'preview', distribution: DistributionViewModel): void
}>()

const isOpen = ref(false)
const { downloadDistribution, getFormatName } = useDistributions()
const { handleDownload, isDownloading, error: downloadError } = useDownload()

watch(
  () => downloadError.value,
  (error) => {
    if (error) {
      alert($t('datasetDetails.previewViews.downloadError', { error }))
    }
  }
)

const authStore = useAuthStore();

const isPreviewFeatureEnabled = appConfig.customer.modules.dataCatalog?.isDatasetPreviewEnabled === 'true'
const pvPreviewEnabled = isPreviewFeatureEnabled && appConfig.customer.modules.dataCatalog?.previewBehaviorMode === 'piveau'

const oupUrl = computed(() => isOUPUrl(props?.distribution?.accessUrls?.[0] ?? ''))
const isPreviewable = computed(() => {
  return isPreviewFeatureEnabled &&
    ((!pvPreviewEnabled && oupUrl.value) ||
     (pvPreviewEnabled && hasPreview(props.distribution)))
})

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

// Distribution ID is directly available
const distributionId = computed(() => {
  return props.distribution.id || null
})

// Handle format download
const handleFormatDownload = async (format: RDFFormat) => {
  console.log('Attempting download with:', {
    distributionId: distributionId.value,
    format
  })

  if (!distributionId.value) {
    console.error('Distribution ID is required to download metadata')
    alert('Cannot download: Distribution ID not found')
    return
  }

  try {
    await downloadDistribution(distributionId.value, format)
  } catch (error) {
    console.error('Error downloading distribution in format:', format, error)
    alert(`Error downloading distribution: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Create metadata format dropdown items - flat structure with all formats
const metadataFormatItems = computed(() => {
  return rdfFormats.map(format => ({
    text: getFormatName(format),
    icon: '/src/assets/icons/download.svg',
    onClick: () => handleFormatDownload(format)
  }))
})

// Build data access menu from accessUrls and downloadUrls
const dataAccessMenuItems = computed(() => {
  const downloads = props.distribution.downloadUrls || []
  const accesses = props.distribution.accessUrls || []

  // Move piveau-store URLs from access to downloads
  const filteredAccesses = accesses.filter(url => !url.includes('https://piveau-store.'))
  const piveauStoreUrls = accesses.filter(url => url.includes('https://piveau-store.'))
  const allDownloads = [...downloads, ...piveauStoreUrls]
  
  if (allDownloads.length === 0 && filteredAccesses.length === 0) return null

  const items = []

  if (filteredAccesses.length === 1) {
    items.push({ 
      text: $t('datasetDetails.raw-data-dropdown.original-dataset'), 
      icon: '/src/assets/icons/share.svg',
      onClick: () => { void handleDownload(filteredAccesses[0], 'open') }
    })
  } else if (filteredAccesses.length > 1) {
    items.push({
      text: 'Zugriff',
      icon: '/src/assets/icons/share.svg',
      children: filteredAccesses.map(url => ({ 
        text: url, 
        onClick: () => { void handleDownload(url, 'open') }
      }))
    })
  }

  if (allDownloads.length === 1) {
    items.push({ 
      text: $t('datasetDetails.raw-data-dropdown.download'), 
      icon: '/src/assets/icons/download.svg',
      onClick: () => { void handleDownload(allDownloads[0]) }
    })
  } else if (allDownloads.length > 1) {
    items.push({
      text: 'Downloads',
      icon: '/src/assets/icons/download.svg',
      children: allDownloads.map(url => ({ 
        text: url, 
        onClick: () => { void handleDownload(url) }
      }))
    })
  }

  return items
})

const metadata = computed(() => {
  const meta = []
  
  const licenseProperty = props.distribution.properties.find(p => p.id === 'license')
  let licenseText = '/'
  
  if (licenseProperty && licenseProperty.data.length > 0) {
    const licenseData = licenseProperty.data[0]
    if (licenseData.type === 'href') {
      licenseText = licenseData.data.label || licenseData.data.href || '/'
    }
  }
  
  meta.push({
    title: 'Lizenz',
    icon: '/src/assets/icons/label.svg',
    list: [{ text: licenseText }]
  })
  
  // ALWAYS show Format section
  meta.push({
    title: 'Formate',
    tags: [props.distribution.format || '/']
  })
  
  // ALWAYS show Time section
  const updatedAtProperty = props.distribution.properties.find(p => p.id === 'updatedAt')
  let updatedAtValue = '/'
  
  if (updatedAtProperty && updatedAtProperty.data.length > 0) {
    const updatedAtData = updatedAtProperty.data[0]
    if (updatedAtData.type === 'value' && updatedAtData.data) {
      updatedAtValue = updatedAtData.data
    }
  }
  
  meta.push({
    title: 'Zeitangaben',
    icon: '/src/assets/icons/calendar.svg',
    items: [
      { text: 'Aktualisiert am', date: updatedAtValue }
    ]
  })
  
  return meta
})

const distributionTitle = computed(() => {
  return props.distribution.title || '/'
})

const licenseLabel = computed(() => {
  const licenseProperty = props.distribution.properties.find(p => p.id === 'license')
  if (licenseProperty && licenseProperty.data.length > 0) {
    const licenseData = licenseProperty.data[0]
    if (licenseData.type === 'href') {
      return licenseData.data.label || licenseData.data.href || '/'
    }
  }
  return '/'
})

const licenseHref = computed(() => {
  const licenseProperty = props.distribution.properties.find(p => p.id === 'license')
  if (licenseProperty && licenseProperty.data.length > 0) {
    const licenseData = licenseProperty.data[0]
    if (licenseData.type === 'href' && licenseData.data.href) {
      return licenseData.data.href
    }
  }
  return undefined
})

const licenseLabelShort = computed(() => {
  return getLicenseLabelShort({
    label: licenseLabel.value,
    href: licenseHref.value,
  })
})

const hasLicenseLink = computed(() => licenseHref.value !== undefined)

const updatedDate = computed(() => {
  const updatedAtProperty = props.distribution.properties.find(p => p.id === 'updatedAt')
  if (updatedAtProperty && updatedAtProperty.data.length > 0) {
    const updatedAtData = updatedAtProperty.data[0]
    if (updatedAtData.type === 'value' && updatedAtData.data) {
      return updatedAtData.data
    }
  }
  return '/'
})

const formatDisplay = computed(() => {
  return props.distribution.format || '/'
})
</script>

<template>
  <div class="distribution-card-container">
    <!-- Desktop Layout -->
    <div class="distribution-card-header desktop-layout">
      <span class="card-info-title">{{ distributionTitle }}</span>
      <div class="card-info">
        <CIVTag
          :has-close-icon="false"
          :has-dot-icon="false"
          :text="formatDisplay" />
      </div>
      <span class="card-info">
        <a 
          v-if="hasLicenseLink" 
          :href="licenseHref" 
          :title="licenseLabel"
          target="_blank" 
          rel="noopener noreferrer"
          class="license-link">
          {{ licenseLabelShort }}
          <img :src="shareIcon" alt="" class="license-icon">
        </a>
        <span v-else :title="licenseLabel">{{ licenseLabelShort }}</span>
      </span>
      <span class="card-info">{{ updatedDate }}</span>
      <div class="card-info">
        <CIVButton v-if="authStore.authenticated && isPreviewable" type="tertiary" :label="$t('datasetDetails.preview')" @click="emit('preview', distribution)" />
      </div>
      <div class="distribution-card-buttons">
        <CIVDropdownDatasets
          v-if="dataAccessMenuItems"
          type="tertiary"
          :label="$t('datasetDetails.raw-data')"
          :disabled="isDownloading"
          :list="dataAccessMenuItems" />
        <CIVDropdownDatasets
          v-if="distributionId"
          type="tertiary"
          :label="$t('datasetDetails.metadata')"
          :list="metadataFormatItems" />
      </div>
    </div>

    <!-- Mobile Layout -->
    <div class="distribution-card-header mobile-layout">
      <div class="mobile-header-top">
        <span class="mobile-title">{{ distributionTitle }}</span>
      </div>
      <div class="mobile-header-info">
        <CIVTag
          :has-close-icon="false"
          :has-dot-icon="false"
          :text="formatDisplay" />
        <a 
          v-if="hasLicenseLink" 
          :href="licenseHref" 
          :title="licenseLabel"
          target="_blank" 
          rel="noopener noreferrer"
          class="mobile-info-text license-link">
          {{ licenseLabelShort }}
          <img :src="shareIcon" alt="" class="license-icon">
        </a>
        <span v-else class="mobile-info-text" :title="licenseLabel">{{ licenseLabelShort }}</span>
        <span class="mobile-info-text">{{ updatedDate }}</span>
      </div>
      <div class="mobile-action-buttons">
        <CIVButton class="mobile-tertiary-button"
          v-if="authStore.authenticated && isPreviewable"
          type="tertiary"
          :label="$t('datasetDetails.preview')" @click="emit('preview', distribution)" />
        <CIVDropdownDatasets
          v-if="dataAccessMenuItems"
          type="tertiary"
          :label="$t('datasetDetails.raw-data')"
          :disabled="isDownloading"
          :list="dataAccessMenuItems" />
        <CIVDropdownDatasets
          v-if="distributionId"
          type="tertiary"
          :label="$t('datasetDetails.metadata')"
          :list="metadataFormatItems" />
      </div>
    </div>

    <div class="card-info-content">
      <div
        class="card-hidden-content"
        :style="{ display: isOpen ? 'flex' : 'none' }">
        <CIVMetadata
          v-for="(metaItem, key) in metadata"
          :key="key"
          :title="metaItem.title"
          :icon="metaItem.icon"
          :list="metaItem.list">
          <template #content v-if="!metaItem.list">
            <template v-if="metaItem.items">
              <CIVMetadataTimeInfoCard :items="metaItem.items" />
            </template>
            <template v-if="metaItem.tags">
              <div class="tags-container">
                <CIVTag
                  v-for="(tag, i) in metaItem.tags"
                  :key="i"
                  :has-close-icon="false"
                  :has-dot-icon="false"
                  :text="tag" />
              </div>
            </template>
          </template>
        </CIVMetadata>
      </div>
      <CIVButton
        class="show-more-button"
        type="tertiary"
        :label="isOpen ? $t('message.dataupload.distributions.card.hide') : $t('message.dataupload.distributions.card.show')"
        :icon-suffix="isOpen ? '/src/assets/icons/ChevronTop.svg' : '/src/assets/icons/ChevronBottom.svg'"
        @click="isOpen = !isOpen" />
    </div>
  </div>
</template>

<style scoped>
.distribution-card-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px;
}

/* Desktop Layout - Default */
.distribution-card-container .distribution-card-header {
  width: 100%;
  display: flex;
  align-items: flex-start;
}
.distribution-card-container .distribution-card-header .card-info-title {
  width: 20%;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.distribution-card-container .distribution-card-header .card-info {
  width: 15%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-wrap: wrap;
  word-break: break-word;
}
.distribution-card-container .distribution-card-header .distribution-card-buttons {
  width: 20%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.distribution-card-container .card-info-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-radius: 8px;
  background: var(--Neutrals-bg-darker, #F5F7FA);
  gap: 16px;
}
.distribution-card-container .card-info-content .card-hidden-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.distribution-card-container .card-info-content .show-more-button {
  padding: 0;
}
.distribution-card-container .card-info-content .tags-container {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary-800);
}

/* Hide mobile layout by default */
.mobile-layout {
  display: none !important;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .distribution-card-container {
    padding: 16px;
    border-radius: 8px;
    border: 1px solid var(--color-neutral-200, #E5E7EB);
    background: var(--color-white, #FFF);
  }

  .desktop-layout {
    display: none !important;
  }

  .mobile-layout {
    align-items: start !important;
    display: flex !important;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }

  .mobile-header-top {
    display: flex;
    align-items: flex-start;
  }

  .mobile-title {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.4;
    color: var(--color-primary-800);
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .mobile-header-info {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .mobile-info-text {
    font-size: 14px;
    color: var(--color-neutral-600);
  }

  .mobile-action-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .mobile-tertiary-button{
    flex: 0 !important;
  }

  .button-medium{
    padding: 8px 6px !important;
  }
  .mobile-action-buttons > * {
    flex: 1;
    min-width: fit-content;
  }

  .card-info-content {
    padding: 0;
    background: transparent;
    gap: 16px;
  }

  .card-info-content .card-hidden-content {
    gap: 24px;
  }

  .card-info-content .show-more-button {
    width: 100%;
    justify-content: center;
  }
}

.license-link {
  display: inline-flex !important;
  align-items: center;
  line-height: inherit;
  text-decoration: underline;
  max-width: 100%;
  overflow: hidden;
  word-break: break-word;
}
.license-link span, .license-link {
  white-space: normal;
}

.license-icon {
  width: 24px;
  height: 24px;
  display: block;
  flex-shrink: 0;
}
</style>
