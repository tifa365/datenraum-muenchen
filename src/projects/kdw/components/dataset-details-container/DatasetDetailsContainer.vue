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
import { computed, ref } from 'vue'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Dialog from 'primevue/dialog'
import type { DistributionViewModel } from '../dsitribution-data-info-box/shared'
import Typography from '../../components/base/typography/Typography.vue'
import PropertyTableRow from '../../components/property-table/PropertyTableRow.vue'
import RequestDatasetForm from '../../components/request-dataset-form/RequestDatasetForm.vue'
import KButton from '../../components/base/button/KButton.vue'
import KTag from '../../components/base/tag/KTag.vue'
import { type DatasetType, type PropertyTableEntryNode, datasetTypeMap } from '../../utils/types'
import { useRoute } from 'vue-router'
import PhCaretLeft from '~icons/ph/caret-left'
import { useI18n } from 'vue-i18n';
import appConfig from "@config/appConfig";
import { useAuthStore } from '@/stores/authStore'

const { t, locale } = useI18n(); 

const props = defineProps<{
  datasetType?: DatasetType
  loading?: boolean
  title?: string
  description?: string
  propertyTable: PropertyTableEntryNode[]
  distributions: DistributionViewModel[]
  variant?: 'default' | 'restricted'
}>()

const route = useRoute()

const computedDatasetType = computed(() => {
  return props.datasetType ? datasetTypeMap[props.datasetType] : undefined
})

const requestDatasetAccessDialog = ref(false)
function onRequestDatasetAccess() {
  requestDatasetAccessDialog.value = true
}

const showRequestDatasetAccess = computed(() => {
  return route.query?.['__force-restricted'] || props.variant === 'restricted'
})
const backgroundImageUrl = `config/${appConfig.customer.name}/assets/images/${appConfig.components.headerImageFileName}`

const authStore = useAuthStore()

</script>

<template>
  <section class="p-4 border border-b">
    <!-- Go previous page -->
    <div class="back-button" @click="$router.back()">
      <Typography variant="paragraph-1" class="flex gap-4 items-center text-primary">
        <PhCaretLeft />
        <span>{{t('kdw.components.DatasetDetailsContainer.back')}}</span>
        <span>|</span>
        <span>{{t('kdw.components.DatasetDetailsContainer.dataset')}}</span>
      </Typography>
    </div>
  </section>
  <section class="relative view-header-background"
     :style="{
      'background-image': 'url(' + backgroundImageUrl + ')',
    }">
    <div class="relative flex flex-col gap-4 p-6">
      <section class="hidden ml-auto">
        <div class="grid w-[8rem] place-content-center rounded-lg bg-slate-200 p-2">Actions</div>
      </section>
      <div class="flex flex-col gap-4 bg-transparent lg:flex-row">
        <section class="flex-1 flex-shrink-0">
          <div class="rounded-lg border bg-white p-6 lg:h-full">
            <div class="flex min-h-[528px] flex-col gap-4">
              <div class="flex min-h-[25rem] flex-col gap-2">
                <div>
                  <KTag v-if="computedDatasetType" light :label="datasetType === 'kritis' ? $t('landing-page.open-data.chip-two') : $t('landing-page.open-data.chip-one')" name="dataset-type" />
                </div>
                <div v-if="loading" class="h-16 w-full animate-pulse rounded-md bg-surface-200" />
                <Typography as="h2" variant="header-2" class="text-primary">
                  {{ title }}
                </Typography>
                <div>
                  <Typography as="p" variant="paragraph-2" class="prose">
                    {{ description }}
                  </Typography>
                </div>
              </div>
              <div v-if="showRequestDatasetAccess" class="flex flex-col sm:flex-row gap-4">
                <template v-if="variant === 'restricted'">
                  <KButton icon="icon-[ph--arrow-right]" outlined label="Daten Anfragen"
                    @click="onRequestDatasetAccess" />
                </template>
                <template v-if="variant === 'default'">
                  <KButton icon="icon-[ph--arrow-right]" outlined label="Im digitalen Zwilling ansehen"
                    @click="onRequestDatasetAccess" />
                  <KButton icon="icon-[ph--arrow-right]" outlined label="Zu Dashboard hinzufügen"
                    @click="onRequestDatasetAccess" />
                </template>
              </div>
            </div>
          </div>
        </section>
        <div class="w-full flex-none flex-shrink-0 overflow-clip rounded-lg border bg-white lg:w-[28rem]">
          <div v-if="loading" class="h-[720px] w-full animate-pulse bg-surface-200" />
          <PropertyTableRow v-else :data="propertyTable || []" class="p-6 lg:h-full">
            <template #data="{ data, literal }">
              <div v-if="literal && (data.id === 'formatVal' || data.id === 'categoriesVal' || data.id === 'licenseVal')"
                class="flex flex-row flex-wrap gap-2">
                <KTag v-if="data.data.length > 0" v-for="(tag, index) in data.data" :key="index" :small="data.id === 'formatVal'"
                  :outline="data.id !== 'formatVal'" :label="tag" />
                <span v-else>-</span>
              </div>
            </template>
          </PropertyTableRow>
        </div>
      </div>
    </div>
  </section>
  <section class="w-full border bg-white">
    <TabView>
      <TabPanel :header="t('kdw.components.DatasetDetailsContainer.dataset')">
        <Accordion :multiple="true" :active-index="[0, 1]">
          <AccordionTab v-if="authStore.authenticated" :header="t('kdw.components.DatasetDetailsContainer.data-preview')">
            <slot name="preview">
              <div class="grid h-[360px] place-content-center rounded-xl bg-surface-200">Datenvorschau</div>
            </slot>
          </AccordionTab>
          <AccordionTab :header="`${t('kdw.components.DatasetDetailsContainer.distribution')} (${distributions.length})`">
            <div class="flex flex-col gap-6 max-w-[556px]">
              <Typography variant="header-4" as="h4" class="text-primary">{{t('kdw.components.DatasetDetailsContainer.distributions-left-format')}}</Typography>
              <div class="flex flex-col gap-6">
                <div v-for="(distribution, i) in distributions" :key="distribution.id"
                  class="flex flex-col gap-2 m-0 p-0">
                  <div class="flex flex-col gap-5 m-0 p-0">
                    <div class="flex flex-row gap-4 flex-nowrap items-center justify-between">
                      <Typography variant="paragraph-2" class="text-neutral">Distribution {{ i + 1 }} - {{
                        distribution.title }}</Typography>
                      <KTag v-show="!!distribution.format" light small :label="distribution.format" />
                    </div>
                    <div class="flex flex-row flex-wrap gap-3">
                      <a v-if="distribution.accessUrls && distribution.accessUrls?.length > 0" :href="distribution.accessUrls[0]">
                        <KButton icon="icon-[ph--arrow-right]" :label="t('kdw.components.DatasetDetailsContainer.to-dataset')" class="min-w-fit" />
                      </a>
                      <a v-if="distribution.downloadUrls && distribution.downloadUrls?.length > 0" :href="distribution.downloadUrls[0]" >
                        <KButton icon="icon-[ph--download]" outlined icon-pos="right" label="Download" class="min-w-fit" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AccordionTab>
        </Accordion>
      </TabPanel>
      <!-- 2024-11-01 Hide these tabs until further notice, see HOF-194 for more details  -->
      <!-- <TabPanel header="Aktivität" :disabled="true" /> -->
      <!-- <TabPanel header="Ähnliche Datensets" :disabled="true" /> -->
    </TabView>
  </section>
  <teleport to="body">
    <Dialog v-model:visible="requestDatasetAccessDialog" modal header=" ">
      <RequestDatasetForm />
    </Dialog>
  </teleport>
</template>

<style scoped>
 .back-button {
  cursor: pointer;
 }
</style>
