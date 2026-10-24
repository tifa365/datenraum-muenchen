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
  <COSViewHeaderBackButtonPanel :contextText="$t('kdw.components.DatasetDetailsContainer.dataset')" />
  <div
    v-if="!isLoading"
    class="header view-header-background"
    :style="{ 'background-image': `url(config/${appConfig.customer.name}/assets/images/${appConfig.components.headerImageFileName})` }">
    <div class="header-content">
      <CIVCardBasic
        :title="organisation.title"
        :description="organisation.description"
        :url="organisation.website"
        :compactMode="true">
        <template #iconSection>
          <CIVIconButton icon="src/assets/icons/Hearth.svg" v-show="''" />

          <CIVIconButton
            v-if="canEditDataset"
            icon="src/assets/icons/edit-button.svg"
            @click="handleEditRedirect" />

          <!-- Download: public → all; confidential → canView; non-public → authenticated -->
          <template v-if="canDownload">
            <div class="download-container">
              <CIVIconButton icon="src/assets/icons/Download.svg" />
              <div v-if="computedDatasetId" class="download-container-body">
                <div
                  v-for="format in rdfFormats"
                  :key="format"
                  @click.prevent="handleFormatDownload(format)">
                  <p class="body-lg">{{ getFormatName(format) }}</p>
                </div>
              </div>
            </div>
          </template>

          <CIVIconButton icon="src/assets/icons/ThreeDotsVerticalGrey.svg" size="medium" v-show="''" />
        </template>

        <template v-if="hasDatasetTags" #tags>
          <CIVDatasetTags
            :visibilityLabel="visibilityLabel"
            :visibilityIcon="visibilityIcon"
            :visibilityTooltipText="visibilityTooltipText"
            :isHVD="metadata?.is_hvd"
            :isSoftData="isSoftData"
            :accrualPeriodicityVal="organisation.accrualPeriodicityVal"
            :publicationStatus="metadata?.catalog_record?.publication_status" />
        </template>

        <template #actions>
          <div v-if="canShowMetadata" class="metadata-button-container">
            <CIVButton
              :label="$t('datasets.metadata')"
              iconSuffix="/src/assets/icons/FullscreenWhite.svg"
              class="metadata"
              @click="isModalOpen = !isModalOpen" />
            <MetadataModal v-if="isModalOpen" v-model="isModalOpen" :metadata="metadata" />
          </div>
        </template>

        <template #meta>
          <CIVDatasetMeta
            :author="organisation.authorVal"
            :categories="organisation.categoriesVal"
            :distributions="organisation.formatVal" />
        </template>
      </CIVCardBasic>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import CIVCardBasic from './CIVCardBasic.vue'
import CIVDatasetTags from '@/components/civora-ui/datacatalog/CIVDatasetTags.vue'
import CIVDatasetMeta from '@/components/civora-ui/datacatalog/CIVDatasetMeta.vue'
import MetadataModal from '@/components/civora-ui/datacatalog/MetadataModal.vue'
import appConfig from '/config/appConfig'
import COSViewHeaderBackButtonPanel from '@/components/city-os/COSViewHeaderBackButtonPanel.vue'
import CIVIconButton from '../CIVIconButton.vue'
import CIVButton from '../../CIVButton.vue'
import { useDistributions } from '@/composables/useDatasetsDownloads'
import { usePermissions } from '@/composables/useAccessPermissions'
import { useDatasetAccess } from '@/composables/useDatasetAccess'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()
const { getDatasetPermissions } = usePermissions()

const isModalOpen = ref(false)

const props = defineProps({
  organisation: { type: Object, required: true },
  datasetId: { type: [String, Number], required: false },
  distributions: { type: Array, required: true },
  metadata: { type: Object, required: false },
  isLoading: Boolean,
})

const { downloadDataset, getFormatName } = useDistributions()

// The catalogue overview uses catalog_record.access_level for DLAC visibility.
// Keep the details page on the same authoritative field; access_right describes
// the dataset metadata and can contain a different value.
const accessRightVal = computed(() =>
  props.metadata?.catalog_record?.access_level ??
  props.organisation.accessRightVal ??
  ''
)
const publicationStatus = computed(() => props.metadata?.catalog_record?.publication_status || '')
const isSoftData = computed(() => props.metadata?.is_soft_data === true)
const isHVD = computed(() => !!props.metadata?.is_hvd)
const isLiveData = computed(() =>
  props.organisation.accrualPeriodicityVal === 'http://publications.europa.eu/resource/authority/frequency/UPDATE_CONT'
)

const computedDatasetId = computed(() =>
  props.organisation.id || props.organisation.datasetId || props.datasetId || null
)

const catalogId = computed(() => props.metadata?.catalog?.id || '')

/**
 * Organization ID from metadata.
 * Adjust the path if your metadata structure differs (e.g. catalog.publisher.id).
 */
const organizationId = computed(() =>
  props.metadata?.catalog?.is_part_of ||
  props.metadata?.catalog?.organisation?.id ||
  ''
)

/**
 * Full permission set for the current dataset derived from the user's RPT token.
 * Falls back to "deny all" when IDs are missing; access-control-disabled config
 * returns "allow all" automatically (handled inside usePermissions).
 */
const datasetPermissions = computed(() =>
  getDatasetPermissions(
    computedDatasetId.value || '',
    organizationId.value,
    catalogId.value
  )
)

const {
  visibilityLabel,
  visibilityIcon,
  visibilityTooltipText,
  canShowMetadata,
  canDownload,
  canEditDataset,
} = useDatasetAccess(accessRightVal, datasetPermissions)

const hasDatasetTags = computed(() =>
  !!visibilityLabel.value ||
  publicationStatus.value === 'draft' ||
  isLiveData.value ||
  isHVD.value ||
  isSoftData.value
)

const rdfFormats = [
  'application/rdf+xml',
  'application/ld+json',
  'application/n-triples',
  'application/n-quads',
  'application/trig',
  'application/trix',
  'text/turtle',
  'text/n3',
]

const handleFormatDownload = async (format) => {
  if (!computedDatasetId.value) {
    console.error('Dataset ID is required to download metadata')
    alert(t('datasets.downloadErrors.datasetIdMissing'))
    return
  }
  try {
    await downloadDataset(computedDatasetId.value, format)
  } catch (error) {
    console.error('Error downloading dataset in format:', format, error)
    const message = error instanceof Error ? error.message : String(error)
    alert(t('datasets.downloadErrors.failed', { message }))
  }
}

const handleEditRedirect = () => {
  const id = computedDatasetId.value
  const catalog = catalogId.value

  if (!id || !catalog) {
    console.warn('Missing navigation parameters:', { id, catalog })
    return
  }

  router.push({
    name: 'CivoraDPI',
    query: { edit: 'true', id, catalog },
  })
}
</script>

<style scoped>
.header {
  display: flex;
  background-repeat: no-repeat;
  color: var(--hero-card-header-text-secondary-color);
  padding: 16px 32px 32px 32px;
}

.header-content {
  width: 100%;
  gap: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metadata-card {
  width: 488px;
}

.download-container {
  position: relative;
}

.download-container {
  position: relative;
  padding-bottom: 8px;
}

.download-container-body {
  width: 120px;
  position: absolute;
  right: 0;
  z-index: 999;
  padding: 8px;
  background-color: var(--color-neutral-100);
  display: none;
  border-radius: 8px;
  gap: 16px;
  top: 100%;
  border: 1px solid var(--color-neutral-300);
  color: var(--color-text-light);
}

.download-container-body a {
  text-decoration: none;
  color: inherit;
}

.download-container-body p {
  padding: 4px 8px;
  cursor: pointer;
}

.download-container-body p:hover {
  background-color: var(--color-neutral-300);
  border-radius: 8px;
}

.download-container:hover .download-container-body {
  display: flex;
  justify-content: end;
  flex-direction: column;
}

@media (max-width: 992px) {
  .header-content {
    flex-direction: column;
  }

  .metadata-card {
    width: 100%;
  }
}
</style>
