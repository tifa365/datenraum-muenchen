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
import { useVModel } from '@vueuse/core'
import { computed, unref } from 'vue'
import Typography from '../base/typography/Typography.vue'
import KButton from '../base/button/KButton.vue'
import type { FacetList } from '../../utils/types'
import PhX from '~icons/ph/x'

const props = defineProps<{
  facets: FacetList<string>
  modelValue: Record<string, string[]>
}>()

const emit = defineEmits(['update:modelValue'])

const selectedFacets = useVModel(props, 'modelValue', emit, { passive: true })

function resolveFacetValueToLabel(facetId: string, value: string) {
  const facet = unref(props.facets).find((f) => f.id === facetId)
  if (!facet) return value
  const facetValue = facet.items.find((f) => f.value === value)
  return facetValue?.label || value
}

function resolveFacetTitleById(facetId: string) {
  return unref(props.facets).find((f) => f.id === facetId)?.label
}

function resolveFacetValueTitle(facetId: string, value: string) {
  return props.facets.find((facet) => facet.id === facetId)?.items.find((item) => item.value === value)?.title
}

const flattenedSelectedFacets = computed(() => {
  return Object.entries(unref(selectedFacets))
    .reduce(
      (acc, [key, value]) => {
        if (Array.isArray(value) && value.length) {
          acc.push({
            title: key,
            values: value,
          })
        }
        return acc
      },
      [] as { title: string; values: string[] }[]
    )
    .flatMap((facet) => {
      return facet.values.map((value) => {
        return {
          title: facet.title,
          label: resolveFacetTitleById(facet.title),
          value: resolveFacetValueToLabel(facet.title, value),
          tooltip: resolveFacetValueTitle(facet.title, value),
          id: value,
        }
      })
    })
})

function removeSelectedFacetById(facetId: string, value: string) {
  const unwrapSelectedFacets = unref(selectedFacets)
  if (!Object.keys(unwrapSelectedFacets).includes(facetId)) return

  const typeSafeFacetId = facetId as keyof typeof unwrapSelectedFacets
  const selectedFacet = unwrapSelectedFacets[typeSafeFacetId]
  if (Array.isArray(selectedFacet)) {
    // splice in a reactive friendly way
    unwrapSelectedFacets[typeSafeFacetId] = unwrapSelectedFacets[typeSafeFacetId].filter((v) => v !== value)
  }
}

function beforeLeave(el: any) {
  const { marginLeft, marginTop, width, height } = window.getComputedStyle(el)

  el.style.left = `${el.offsetLeft - Number.parseFloat(marginLeft)}px`
  el.style.top = `${el.offsetTop - Number.parseFloat(marginTop)}px`
  el.style.width = width
  el.style.height = height
}
</script>

<template>
  <div class="relative w-full">
    <transition-group
      enter-active-class="transform-gpu transition-all"
      enter-from-class="opacity-0 scale-50"
      enter-to-class=""
      move-class="transform-gpu transition-all"
      leave-active-class="absolute transform-gpu transition-all"
      leave-from-class=""
      leave-to-class="opacity-0 scale-50"
      tag="div"
      class="relative flex w-full flex-row flex-wrap gap-2"
      @before-leave="beforeLeave">
      <div
        v-for="facet in flattenedSelectedFacets"
        :key="`selected-facet-${facet.title}-${facet.value}`">
        <KButton
          label="item"
          :title="facet.tooltip"
          severity="secondary"
          rounded
          @click="removeSelectedFacetById(facet.title, facet.id)">
          <div class="flex flex-row flex-nowrap items-center gap-2 normal-case">
            <PhX />
            <div class="flex flex-row flex-nowrap items-center gap-1">
              <Typography>{{ facet.title === 'is_soft_data' ? $t('datasetFacets.facets.is_soft_data') : `${facet.label || facet.title}:` }}</Typography>
              <Typography v-if="facet.title !== 'is_soft_data'" variant="paragraph-1">
                {{ facet.value }}
              </Typography>
            </div>
          </div>
        </KButton>
      </div>
    </transition-group>
  </div>
</template>
