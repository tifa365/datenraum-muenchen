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

import { ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import appConfig from '@config/appConfig'
import {
  ORGANISATION_DATASETS_QUERY_KEY,
  ORGANISATION_DATASETS_TOTAL_QUERY_KEY,
} from '@/composables/useOrganisationDatasetSearch'
import type {
  OrganisationDatasetItem,
  OrganisationDatasetPublicationStatus,
} from '@/composables/useOrganisationDatasetItems'
import { useDpiUtils } from '@/projects/kdw/utils/dpi'
import { useAuthStore } from '@/stores/authStore'

function createRepositoryUrl(path: string) {
  const baseUrl = appConfig.piveauHubRepoUrl.endsWith('/')
    ? appConfig.piveauHubRepoUrl
    : `${appConfig.piveauHubRepoUrl}/`
  return `${baseUrl}${path}`
}

export function useOrganisationDatasetActions(refresh: () => unknown) {
  const authStore = useAuthStore()
  const queryClient = useQueryClient()
  const { toEditMode } = useDpiUtils()
  const deleteTarget = ref<OrganisationDatasetItem | null>(null)
  const isDeleting = ref(false)
  const deleteError = ref<string | null>(null)

  function editDataset(item: OrganisationDatasetItem) {
    toEditMode({
      id: item.id,
      catalogId: item.catalogId,
      isDraft: item.status === 'draft',
    })
  }

  async function setPublicationStatus(
    item: Pick<OrganisationDatasetItem, 'id' | 'catalogId'>,
    publicationStatus: OrganisationDatasetPublicationStatus
  ) {
    try {
      const response = await fetch(createRepositoryUrl('action'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authStore.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'setDatasetPublicationStatus',
          params: {
            id: item.id,
            catalogueId: item.catalogId,
            publicationStatus,
          },
          id: crypto.randomUUID(),
        }),
      })

      if (!response.ok) {
        console.error(`Failed to set dataset publication status: ${response.statusText}`)
        return false
      }

      queryClient.setQueriesData({ queryKey: ORGANISATION_DATASETS_QUERY_KEY }, (oldData: any) => {
        if (!oldData?.result?.results) return oldData
        const results = oldData.result.results.map((dataset: any) =>
          dataset.id === item.id
            ? {
                ...dataset,
                catalog_record: {
                  ...dataset.catalog_record,
                  publication_status: publicationStatus,
                },
                modified: new Date().toISOString(),
              }
            : dataset
        )
        return { ...oldData, result: { ...oldData.result, results } }
      })
      return true
    } catch (error) {
      console.error('Error setting dataset publication status:', error)
      return false
    }
  }

  function publishDataset(item: Pick<OrganisationDatasetItem, 'id' | 'catalogId'>) {
    return setPublicationStatus(item, 'published')
  }

  function revertDatasetToDraft(item: Pick<OrganisationDatasetItem, 'id' | 'catalogId'>) {
    return setPublicationStatus(item, 'draft')
  }

  function requestDelete(item: OrganisationDatasetItem) {
    deleteTarget.value = item
    deleteError.value = null
  }

  function cancelDelete() {
    if (isDeleting.value) return
    deleteTarget.value = null
    deleteError.value = null
  }

  async function confirmDelete() {
    const item = deleteTarget.value
    if (!item) return

    isDeleting.value = true
    deleteError.value = null

    try {
      const response = await fetch(createRepositoryUrl(`datasets/${item.id}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authStore.authToken}`,
        },
      })

      if (!response.ok) {
        deleteError.value = `Failed to delete dataset (${response.status} ${response.statusText})`
        return
      }

      queryClient.setQueriesData({ queryKey: ORGANISATION_DATASETS_QUERY_KEY }, (oldData: any) => {
        if (!oldData?.result?.results) return oldData
        return {
          ...oldData,
          result: {
            ...oldData.result,
            results: oldData.result.results.filter((dataset: any) => dataset.id !== item.id),
            count: Math.max(0, (oldData.result.count ?? 1) - 1),
          },
        }
      })

      queryClient.setQueriesData(
        { queryKey: ORGANISATION_DATASETS_TOTAL_QUERY_KEY },
        (oldData: any) => ({
          ...oldData,
          result: {
            ...oldData?.result,
            count: Math.max(0, (oldData?.result?.count ?? 1) - 1),
          },
        })
      )

      deleteTarget.value = null
      setTimeout(refresh, 2500)
    } catch (error: any) {
      deleteError.value = error?.message ?? 'Unexpected error while deleting'
    } finally {
      isDeleting.value = false
    }
  }

  return {
    cancelDelete,
    confirmDelete,
    deleteError,
    deleteTarget,
    editDataset,
    isDeleting,
    publishDataset,
    requestDelete,
    revertDatasetToDraft,
  }
}
