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
import ScrollPanel from 'primevue/scrollpanel'
import { toRefs, computed } from 'vue'
import { useVModel } from '@vueuse/core'
import Typography from '../base/typography/Typography.vue'
import KFacetGroup from '../base/facet-group/KFacetGroup.vue'
import KCheckbox from '../base/checkbox/KCheckbox.vue'
import DataOwnerCard from '../data-owner-card/DataOwnerCard.vue'

// Need to import the types so that the export below doesn't error
// @eslint-ignore-next-line
import type { FacetList } from '../../utils/types'

// Need to export the types so that the generics work properly
export type { Facet, FacetList } from '../../utils/types'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

export interface AccessLevelItem {
  id: string
  label: string
  count: number
}

const props = defineProps<{
  public?: boolean
  facets: FacetList<string>
  ghost?: boolean
  mobile?: boolean
  modelValue: Record<string, string[]>
  accessLevelItems?: AccessLevelItem[]
  enableAccessControl?: boolean
}>()

const softData = defineModel<boolean>('softData', { default: false })
const hvd = defineModel<boolean>('hvd', { default: false })
const livedata = defineModel<boolean>('livedata', { default: false })
const accessLevels = defineModel<string[]>('accessLevels', { default: () => [] })

const emit = defineEmits(['update:modelValue'])

const { facets } = toRefs(props)

const model = useVModel(props, 'modelValue', emit, { passive: true })

const ACCESS_LEVEL_ICON_MAP: Record<string, string> = {
  public: '/src/assets/icons/OpenData.svg',
  "non-public": '/src/assets/icons/Non-public.svg',
  internal: '/src/assets/icons/Internal-data.svg',
  restricted: '/src/assets/icons/Non-public.svg',
  confidential: '/src/assets/icons/Internal-data.svg',
}

function getAccessLevelIcon(id: string): string {
  return ACCESS_LEVEL_ICON_MAP[id] ?? '/src/assets/icons/OpenData.svg'
}

function toggleAccessLevel(id: string | undefined) {
  if (!id) return
  const current = accessLevels.value
  const idx = current.indexOf(id)
  if (idx === -1) {
    accessLevels.value = [...current, id]
  } else {
    accessLevels.value = current.filter(v => v !== id)
  }
}
const hasHvd = computed(() => {
  const facet = facets.value.find((facet: { id: string }) => facet.id === 'is_hvd')
  if (!facet) return false

  const hvdItems = facet.items.find((item: { id: string }) => item.id === 'true')
  return !!hvdItems?.count
})

// Keep the active filter available even when another filter removes all matches.
const hasSoftData = computed(() => softData.value || facets.value.some(facet =>
  facet.id === 'is_soft_data' && facet.items.some(item => item.id === 'true' && (item.count ?? 0) > 0)
))

const LIVE_PERIODICITIES = ['UPDATE_CONT']

const hasLiveData = computed(() => {
  const facet = facets.value.find(
    (facet: { id: string }) => facet.id === 'periodicity'
  )

  if (!facet?.items?.length) return false

  return facet.items.some(
    (item: { id: string; count?: number }) =>
      LIVE_PERIODICITIES.some(freq => item.id?.endsWith(freq)) &&
      !!item.count
  )
})
</script>

<template>
  <ScrollPanel style="width: 100%; height: 100%" :pt="{
    wrapper: {
      style:
        'border-right: 10px solid rgb(var(--primary-400)/10%); border-bottom: 10px solid rgb(var(--primary-400)/10%);',
    },
    bary: 'relative z-20 w-[9px] top-0 rounded-none bg-surface-300 hover:bg-surface-400',
  }">
      <div class="overflow-auto flex flex-col gap-6 border bg-white px-6 sm:py-24 py-4 ">
        <template v-if="!props.mobile">
        <Typography
          as="h4"
          variant="header-4">
          {{$t('kdw.components.facet-sidebar.FacetSidebar.search-catalog')}}
        </Typography>
        <hr />
      </template>
      <div class="flex flex-col gap-2" v-if="hasLiveData || hasHvd || hasSoftData">
        <KCheckbox
          v-if="hasLiveData"
          v-model="livedata"
          input-id="livedata"
          name="dataset-scope"
          value="livedata"
          binary
          >
          {{$t('kdw.components.facet-sidebar.FacetSidebar.live-data')}}
        </KCheckbox>
        <KCheckbox
          v-if="hasHvd"
          v-model="hvd"
          input-id="hvd"
          name="dataset-scope-hvd"
          value="hvd"
          binary
          >
          {{$t('kdw.components.facet-sidebar.FacetSidebar.high-value-data')}}
        </KCheckbox>
        <KCheckbox
          v-if="hasSoftData"
          v-model="softData"
          :input-id="props.mobile ? 'soft-data-mobile' : 'soft-data'"
          name="dataset-scope-soft-data"
          value="soft-data"
          binary>
          {{ $t('datasetFacets.facets.is_soft_data') }}
        </KCheckbox>
        <hr class="mt-4"/>
      </div>
      <!-- Dynamic access-level filter cards (new behavior) -->
      <template v-if="props.enableAccessControl">
        <div
          v-if="accessLevelItems && accessLevelItems.length > 0"
          class="flex flex-col gap-2">
          <DataOwnerCard
            v-for="item in accessLevelItems"
            :key="item.id"
            :icon="getAccessLevelIcon(item.id)"
            :label="item.label"
            :translation-key="item.id"
            :selected="accessLevels.includes(item.id)"
            :on-toggle="() => toggleAccessLevel(item.id)"
          />
        </div>
        <hr v-if="accessLevelItems && accessLevelItems.length > 0" />
      </template>
      <!-- Static informational cards (old behavior) -->
      <template v-else>
        <div class="flex flex-col gap-2">
          <DataOwnerCard
            :icon="getAccessLevelIcon('public')"
            :label="t('landing-page.open-data.chip-one')" />
          <DataOwnerCard
            v-if="!public"
            :icon="getAccessLevelIcon('non-public')"
            :label="t('landing-page.open-data.chip-two')" />
          <DataOwnerCard
            v-if="!public"
            :icon="getAccessLevelIcon('confidential')"
            :label="t('landing-page.open-data.chip-four')" />
        </div>
        <hr />
      </template>
      <div
        v-if="ghost"
        class="h-[720px] w-full animate-pulse rounded-lg border bg-surface-200" />
      <template v-else>
        <KFacetGroup
          v-for="facet of facets.filter((facet) => facet.items.length > 0 && facet.id !== 'is_hvd' && facet.id !== 'is_soft_data' && facet.id !== 'periodicity')"
          :id="`facet-group-${facet.id}`"
          :key="`facet-group-${facet.id}`"
          v-model="model[facet.id]"
          :title="facet.label"
          :wrap-labels="facet.id === 'license'"
          :facets="facet.items" />
      </template>
    </div>
  </ScrollPanel>
</template>
