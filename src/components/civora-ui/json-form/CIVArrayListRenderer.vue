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
  <div v-if="control.visible" class="array-list" role="group" :aria-labelledby="titleId">
    <div class="array-list-header">
      <span :id="titleId" class="array-list-label title-sm">
        {{ control.label }}{{ control.required ? ' *' : '' }}
      </span>
      <CIVButton
        type="secondary"
        size="small"
        :label="translations.addTooltip"
        :iconPrefix="ICON_ADD"
        :disabled="!control.enabled || (!!appliedOptions.restrict && maxItemsReached)"
        @click="addButtonClick"
      />
    </div>
    <div
      v-for="(_element, index) in control.data"
      :key="`${control.path}-${index}`"
      class="array-list-item-wrapper"
    >
      <div class="array-list-item">
        <div class="array-list-item-toolbar" @click="onToolbarClick($event, index)">
          <CIVButton
            class="array-list-item-toggle"
            type="icon"
            size="icon-square"
            :label="`${toggleLabel}: ${itemName(index)}`"
            :iconPrefix="expandedItems.has(index) ? ICON_EXPANDED : ICON_COLLAPSED"
            :hideLabel="true"
            :aria-expanded="expandedItems.has(index)"
            @click="toggleItem(index)"
          />
          <div class="array-list-item-label title-sm" aria-hidden="true">{{ childLabelForIndex(index) }}</div>
          <CIVButton
            type="icon"
            size="icon-square"
            :label="`${translations.up}: ${itemName(index)}`"
            :iconPrefix="ICON_UP"
            :hideLabel="true"
            :disabled="!control.enabled || index === 0"
            @click="moveUp(control.path, index)()"
          />
          <CIVButton
            type="icon"
            size="icon-square"
            :label="`${translations.down}: ${itemName(index)}`"
            :iconPrefix="ICON_DOWN"
            :hideLabel="true"
            :disabled="!control.enabled || index >= control.data.length - 1"
            @click="moveDown(control.path, index)()"
          />
          <CIVButton
            type="icon"
            size="icon-square"
            :label="`${translations.removeTooltip}: ${itemName(index)}`"
            :iconPrefix="ICON_DELETE"
            :hideLabel="true"
            :disabled="!control.enabled || !!minItemsReached"
            @click="removeItems(control.path, [index])()"
          />
        </div>
        <div
          class="array-list-item-content"
          :class="{ expanded: expandedItems.has(index) }"
          role="group"
          :aria-label="`${control.label}: ${itemName(index)}`"
        >
          <DispatchRenderer
            :schema="control.schema"
            :uischema="childUiSchema"
            :path="composePaths(control.path, `${index}`)"
            :enabled="control.enabled"
            :renderers="control.renderers"
            :cells="control.cells"
          />
        </div>
      </div>
    </div>
    <div v-if="noData" class="array-list-no-data body-md">{{ translations.noDataMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  arrayDefaultTranslations,
  composePaths,
  createDefaultValue,
  defaultJsonFormsI18nState,
  Resolve,
  type ControlElement,
} from '@jsonforms/core'
import {
  DispatchRenderer,
  rendererProps,
  useJsonForms,
  useJsonFormsArrayControl,
} from '@jsonforms/vue'
import { useVanillaArrayControl } from '@jsonforms/vue-vanilla'
import CIVButton from '@/components/civora-ui/CIVButton.vue'

const ICON_ADD = '/src/assets/icons/Add.svg'
const ICON_UP = '/src/assets/icons/ChevronTop.svg'
const ICON_DOWN = '/src/assets/icons/ChevronBottom.svg'
const ICON_COLLAPSED = '/src/assets/icons/ChevronRight.svg'
const ICON_EXPANDED = '/src/assets/icons/ChevronBottom.svg'
const ICON_DELETE = '/src/assets/icons/Close.svg'

const props = defineProps({ ...rendererProps<ControlElement>() })
const {
  control,
  appliedOptions,
  childUiSchema,
  childLabelForIndex,
  addItem,
  removeItems,
  moveUp,
  moveDown,
} = useVanillaArrayControl(useJsonFormsArrayControl(props))
const jsonforms = useJsonForms()
const titleId = useId()

const noData = computed(() => !control.value.data || control.value.data.length === 0)
const arraySchema = computed(() =>
  Resolve.schema(props.schema, control.value.uischema.scope, control.value.rootSchema),
)
const maxItemsReached = computed(
  () =>
    arraySchema.value?.maxItems !== undefined &&
    control.value.data !== undefined &&
    control.value.data.length >= arraySchema.value.maxItems,
)
const minItemsReached = computed(
  () =>
    arraySchema.value?.minItems !== undefined &&
    control.value.data !== undefined &&
    control.value.data.length <= arraySchema.value.minItems,
)
// Fixed ids (jsonForms.array.*) instead of JSON Forms' per-path prefix, with the label as {label}.
const translations = computed(() => {
  const translate = jsonforms?.i18n?.translate ?? defaultJsonFormsI18nState.translate
  const label = control.value.label
  const out: Record<string, string | undefined> = {}
  for (const { key, default: dflt } of arrayDefaultTranslations) {
    out[key] = translate(`array.${key}`, dflt(label), { label })
  }
  return out
})

const { t } = useI18n()
const toggleLabel = computed(() => t('aria-labels.toggle-array-item'))

// Item-specific accessible name suffix: visible label, else a translated "Item N" (a bare
// position would collide with an item whose real label is that number).
const itemName = (index: number) => {
  const translate = jsonforms?.i18n?.translate ?? defaultJsonFormsI18nState.translate
  return (
    childLabelForIndex(index) ||
    translate('array.itemFallback', `Item ${index + 1}`, { position: index + 1 })
  )
}

// Vanilla CSS hides .array-list-item-content unless it has .expanded; items start collapsed.
const expandedItems = reactive(new Set<number>())
// CIVButton emits a bare 'click' (no event), so .stop is unavailable: ignore clicks that came from a button.
const toggleItem = (index: number) => {
  if (!expandedItems.delete(index)) expandedItems.add(index)
}
const onToolbarClick = (event: MouseEvent, index: number) => {
  if ((event.target as Element | null)?.closest('button')) return
  toggleItem(index)
}

const addButtonClick = () => {
  addItem(control.value.path, createDefaultValue(control.value.schema, control.value.rootSchema))()
}
</script>

<style scoped>
.array-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.array-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

/* CIVButton small renders label-md (12px bold); match the 14px property labels. */
.array-list-header :deep(.label-md) {
  font-size: var(--title-sm-font-size);
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;
}

.array-list-label {
  color: var(--color-text-regular);
}

.array-list-item {
  border: 1px solid var(--color-divider);
  border-radius: 6px;
  background: var(--color-bg-white);
  overflow: hidden;
}

.array-list-item-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  cursor: pointer;
}

.array-list-item-label {
  flex: 1;
  min-width: 0;
  color: var(--color-text-regular);
}

.array-list-item-content {
  padding: 12px;
  border-top: 1px solid var(--color-divider);
}

.array-list-no-data {
  color: var(--color-text-muted);
}
</style>
