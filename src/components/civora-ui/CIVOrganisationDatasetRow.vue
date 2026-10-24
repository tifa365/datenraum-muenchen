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
import { useI18n } from 'vue-i18n'
import CIVActionMenu from './CIVActionMenu.vue'
import CIVTag from './CIVTag.vue'
import CIVTooltipIcon from './CIVTooltipIcon.vue'
import { useDatasetAccess } from '@/composables/useDatasetAccess'
import { usePermissions } from '@/composables/useAccessPermissions'
import type { OrganisationDatasetItem } from '@/composables/useOrganisationDatasetItems'
import { getTranslationFor } from '@/projects/kdw/sdk/utils/helpers'
import { formatTemporalValue } from '@/utils/formatTemporalValue'

const props = defineProps<{
  accessControlEnabled: boolean
  item: OrganisationDatasetItem
}>()

const emit = defineEmits<{
  delete: [item: OrganisationDatasetItem]
  edit: [item: OrganisationDatasetItem]
  publish: [item: OrganisationDatasetItem]
  revertToDraft: [item: OrganisationDatasetItem]
}>()

const { locale, t } = useI18n()
const { getDatasetPermissions } = usePermissions()
const dropdownOpen = defineModel<boolean>('dropdownOpen', { default: false })
const accessRight = computed(() => props.item.accessRight)
const permissions = computed(() =>
  getDatasetPermissions(
    props.item.id,
    props.item.organizationId ?? props.item.catalogId,
    props.item.catalogId
  )
)
const { visibilityIcon, visibilityLabel, visibilityTooltipText } = useDatasetAccess(
  accessRight,
  permissions
)
const datasetName = computed(() => getTranslationFor(props.item.name, locale.value) || '')
const canEdit = computed(
  () =>
    !props.accessControlEnabled ||
    (permissions.value.canUpdate &&
      (props.item.status === 'draft' || permissions.value.canPublish))
)
const canPublish = computed(
  () => !props.accessControlEnabled || permissions.value.canPublish
)
const canDelete = computed(
  () => !props.accessControlEnabled || permissions.value.canDelete
)

type DatasetAction = 'edit' | 'publish' | 'delete' | 'revertToDraft'

const actionItems = computed(() => {
  const items: { id: DatasetAction; labelKey: string; disabled: boolean }[] = [
    {
      id: 'edit',
      labelKey: 'organisation.datasets.edit',
      disabled: !canEdit.value,
    },
  ]

  if (!props.accessControlEnabled) return items

  if (props.item.status === 'published') {
    items.push({
      id: 'revertToDraft',
      labelKey: 'organisation.datasets.setToDraft',
      disabled: !canPublish.value,
    })
  } else {
    items.push(
      {
        id: 'publish',
        labelKey: 'organisation.datasets.publish',
        disabled: !canPublish.value,
      },
      {
        id: 'delete',
        labelKey: 'organisation.datasets.delete',
        disabled: !canDelete.value,
      }
    )
  }

  return items
})

function runAction(action: string) {
  dropdownOpen.value = false
  switch (action) {
    case 'edit':
      if (canEdit.value) emit('edit', props.item)
      break
    case 'publish':
      if (canPublish.value) emit('publish', props.item)
      break
    case 'delete':
      if (canDelete.value) emit('delete', props.item)
      break
    case 'revertToDraft':
      if (canPublish.value) emit('revertToDraft', props.item)
      break
  }
}
</script>

<template>
  <div class="row row-data body-lg" role="row">
    <a :href="item.url" class="row-link" :aria-label="datasetName" />

    <div class="col visibility" role="cell">
      <CIVTooltipIcon
        :svg-icon="visibilityIcon"
        :label="visibilityLabel"
        :tooltip-text="visibilityTooltipText"
      />
    </div>

    <div class="col title" role="cell">
      {{ datasetName }}
    </div>

    <div class="col modified" role="cell">
      <CIVTag
        v-if="accessControlEnabled"
        :text="
          item.status === 'published'
            ? $t('organisation.datasets.statusPublished')
            : $t('organisation.datasets.statusDraft')
        "
        size="small"
        :has-close-icon="false"
        :tone="item.status === 'published' ? 'positive' : 'warning'"
      />
      <span>
        {{ $t('organisation.datasets.lastModified') }}:
        {{ formatTemporalValue(item.modified, { locale }) }}
      </span>
    </div>

    <div class="col license" role="cell">
      <span class="mobile-column-label">{{ $t('organisation.datasets.license') }}</span>
      <span :title="item.licenseTitle" class="license-label">{{ item.license }}</span>
    </div>

    <div class="col formats" role="cell">
      <span class="mobile-column-label">{{ $t('organisation.datasets.format') }}</span>
      <span
        v-for="format in item.distributions"
        :key="format"
        class="format-pill"
      >
        {{ format }}
      </span>
    </div>

    <div class="col actions" role="cell">
      <CIVActionMenu
        v-model:open="dropdownOpen"
        class="dataset-actions-dropdown"
        :label="t('organisation.datasets.actions')"
        :items="actionItems.map(action => ({ id: action.id, label: t(action.labelKey), disabled: action.disabled }))"
        @select="runAction"
      />
    </div>
  </div>
</template>

<style scoped>
.row-data {
  display: grid;
  grid-template-columns: var(--dataset-list-columns);
  min-width: var(--dataset-list-min-width);
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 16px;
  margin: 10px 40px;
  gap: 24px;
  box-sizing: border-box;
  position: relative;
  color: var(--color-text-light);
  transition: background-color 0.3s ease;
}

.row-data:hover {
  background-color: #f0f0f0;
}

.row-link {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
}

.col {
  display: flex;
  min-width: 0;
  overflow-wrap: anywhere;
  position: relative;
  z-index: 1;
  pointer-events: none;
}

.title,
.modified {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.visibility {
  justify-content: center;
  align-items: center;
  pointer-events: auto;
}

.license,
.formats {
  gap: 8px;
  flex-wrap: wrap;
}

.license-label {
  color: inherit;
  text-decoration: none;
  pointer-events: auto;
  cursor: pointer;
}

.format-pill {
  width: fit-content;
  height: fit-content;
  padding: 4px;
  background: var(--color-bg-darker);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  line-height: 20px;
}

.actions {
  justify-content: flex-end;
  width: 54px;
  pointer-events: auto;
  z-index: auto;
}

.dataset-actions-dropdown {
  position: relative;
}

.mobile-column-label {
  display: none;
}

@media (max-width: 768px) {
  .row-data {
    grid-template-columns: 32px minmax(0, 1fr) 44px;
    grid-template-areas:
      'visibility title actions'
      '. modified actions'
      '. license actions'
      '. formats actions';
    min-width: 0;
    margin: 10px 0;
    width: auto;
    padding: 16px;
    column-gap: 16px;
    row-gap: 12px;
    align-items: start;
  }

  .visibility { grid-area: visibility; }
  .title { grid-area: title; padding-top: 8px; }
  .modified { grid-area: modified; }
  .license { grid-area: license; flex-direction: column; gap: 4px; }
  .formats { grid-area: formats; }
  .actions { grid-area: actions; width: 44px; }

  .mobile-column-label {
    display: block;
    flex-basis: 100%;
    color: var(--color-text-lighter, #596773);
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
  }
}
</style>
