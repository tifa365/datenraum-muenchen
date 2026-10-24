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

import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'
import { useStore } from 'vuex'
import appConfig from '@config/appConfig'

const draftDatasetsURL = appConfig.piveauHubRepoUrl.endsWith('/')
    ? appConfig.piveauHubRepoUrl + 'drafts/datasets'
    : appConfig.piveauHubRepoUrl + '/drafts/datasets'

export function useDatasetDrafts() {
    const store = useStore()

    const fetchDraftDatasets = async () => {
        const response = await fetch(
            draftDatasetsURL,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${store.state.auth.userData.rtpToken}`,
                    'Accept': 'application/json'
                },
            }
        )
        if (!response.ok) {
            throw new Error(`failed to fetch data from piveau ${response.status} ${response.statusText}`)
        }
        return await response.json()
    }

    const draftDatasetsQuery = useQuery({
        queryKey: ['orgDraftDatasets'],
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
        queryFn: fetchDraftDatasets,
    })

    const items = computed(() => {
        if (draftDatasetsQuery.isSuccess.value && draftDatasetsQuery.data.value) {
            return draftDatasetsQuery.data.value
        }
        return []
    })

    async function revertDatasetToDraft(id: string, catalogId: string) {
        const rtpToken = store.state.auth.userData.rtpToken
        try {
            const response = await fetch(
                draftDatasetsURL + `/hide/${id}?catalogue=${catalogId}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${rtpToken}`,
                        Accept: 'application/json',
                    },
                }
            )
            if (!response.ok) {
                throw new Error(`Failed to revert item to draft: ${response.status} ${response.statusText}`)
            }
            console.log(`Item ${id} reverted to draft`)
            draftDatasetsQuery.refetch()
            return response
        } catch (error) {
            console.error(error)
        }
    }

    async function publishDatasetDraft(id: string, catalogId: string) {
        const rtpToken = store.state.auth.userData.rtpToken
        try {
            const response = await fetch(
                draftDatasetsURL + `/publish/${id}?catalogue=${catalogId}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${rtpToken}`,
                        Accept: 'application/json',
                    },
                }
            )
            if (!response.ok) {
                throw new Error(`Failed to PUBLISH draft: ${response.status} ${response.statusText}`)
            }
            console.log(`Draft item ${id} published`)
            draftDatasetsQuery.refetch()
            return response
        } catch (error) {
            console.error(error)
        }
    }

    async function deleteDatasetDraft(id: string, catalogId: string) {
        const rtpToken = store.state.auth.userData.rtpToken
        try {
            const response = await fetch(
                draftDatasetsURL + `/${id}?catalogue=${catalogId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${rtpToken}`,
                        Accept: 'application/json',
                    },
                }
            )
            if (!response.ok) {
                throw new Error(`Failed to delete draft: ${response.status} ${response.statusText}`)
            }
            console.log(`Draft item ${id} deleted`)
            draftDatasetsQuery.refetch()
            return response
        } catch (error) {
            console.error(error)
        }
    }

    return {
        draftDatasetsQuery,
        items,
        revertDatasetToDraft,
        deleteDatasetDraft,
        publishDatasetDraft,
    }
}
