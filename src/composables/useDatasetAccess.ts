/*
 * This file is part of Civora UI.
 *
 * Copyright (C) 2025 DKSR GmbH.
 *
 * Civora UI is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
import { computed, type Ref } from 'vue'
import { usePermissions, type DatasetPermissions } from './useAccessPermissions'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'

export function useDatasetAccess(
  accessRightVal: Ref<string>,
  datasetPermissions?: Ref<DatasetPermissions>
) {
  const { t } = useI18n()
  const authStore = useAuthStore()
  const { accessControlEnabled, getVisibilityFlags } = usePermissions()

  const visibilityFlags = computed(() => getVisibilityFlags(accessRightVal.value))
  const isPublic = computed(() => visibilityFlags.value.isPublic)
  const isConfidential = computed(() => visibilityFlags.value.isConfidential)
  const accessLevelKey = computed(() => {
    const normalized = (accessRightVal.value || '').toLowerCase()
    return normalized.split('/').filter(Boolean).pop() || ''
  })

  const visibilityLabel = computed(() => {
    if (!accessRightVal.value) return ''
    if (isPublic.value) return t('datasets.public', 'Open Data')
    if (accessLevelKey.value === 'internal') return t('datasets.internal', 'Confidential')
    if (accessLevelKey.value === 'confidential') return t('datasets.confidential', 'Confidential')
    if (accessLevelKey.value === 'restricted') return t('datasets.restricted', 'Restricted Data')
    return t('datasets.non-public', 'Restricted Data')
  })

  const visibilityIcon = computed(() => {
    if (isPublic.value) return '/src/assets/icons/OpenData.svg'
    if (isConfidential.value) return '/src/assets/icons/Internal-data.svg'
    if (accessRightVal.value) return '/src/assets/icons/Non-public.svg'
    return ''
  })

  const visibilityTooltipText = computed(() => {
    if (isPublic.value) return t('datasets.tooltips.public')
    if (accessLevelKey.value === 'internal') return t('datasets.tooltips.internal')
    if (accessLevelKey.value === 'confidential') return t('datasets.tooltips.confidential')
    if (accessLevelKey.value === 'restricted') return t('datasets.tooltips.restricted')
    if (accessRightVal.value) return t('datasets.tooltips.non-public')
    return ''
  })

  const canShowMetadata = computed(() => {
    if (!accessControlEnabled) return true
    if (isPublic.value) return true
    if (isConfidential.value) return datasetPermissions?.value.canView ?? authStore.authenticated
    return authStore.authenticated
  })

  /**
   * Download visibility per access level:
   * - access control off -> always visible
   * - public -> always visible
   * - confidential -> needs dataset:view_published (or higher) RPT scope
   * - non-public -> any authenticated user
   */
  const canDownload = computed(() => {
    if (!accessControlEnabled) return true
    if (isPublic.value) return true
    if (isConfidential.value) return datasetPermissions?.value.canView ?? authStore.authenticated
    return authStore.authenticated
  })

  const canEditDataset = computed(() =>
    authStore.authenticated && (!accessControlEnabled || (datasetPermissions?.value.canUpdate ?? false))
  )

  return {
    visibilityFlags,
    accessLevelKey,
    isPublic,
    isConfidential,
    visibilityLabel,
    visibilityIcon,
    visibilityTooltipText,
    canShowMetadata,
    canDownload,
    canEditDataset,
    accessControlEnabled,
  }
}
