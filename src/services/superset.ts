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

import { embedDashboard, type UiConfigType } from "@superset-ui/embedded-sdk"
import appConfig from "@config/appConfig"
import { useAuthStore } from "@/stores/authStore"

const hiddenTag = 'not-for-civora-frontend'

export interface DashboardTag {
    name: string
    type?: string
    id?: string
}

export interface Dashboard {
    certified_by?: string
    dashboard_title?: string
    tags?: DashboardTag[]
    [key: string]: any
}

export interface SupersetError extends Error {
    status: number
    message: string
    dashboardId?: string
}

async function getHeader() {
    const defaultHeaders = new Headers({
        'Content-Type': 'application/json',
    });

    const authStore = useAuthStore();
    if (authStore.authenticated) {
        defaultHeaders.append("Authorization", `Bearer ${await authStore.getAuthToken()}`)
    }
    return defaultHeaders
}

async function fetchDashboards() {
    const query = JSON.stringify({
        columns: [
            "id",
            "created_by.first_name", "created_by.last_name",
            "owners.first_name", "owners.last_name",
            "tags.name", "tags.type",
            "roles.id", "roles.name",
            "dashboard_title", "certified_by", "status"
        ],
        page_size: 100,
    });

    const response = await fetch(`${appConfig.supersetUrl}/api/v1/dashboard/?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: await getHeader()
    });

    if (!response.ok) {
        throw new Error('Failed to fetch dashboards');
    }

    const data = await response.json();

    const filtered = {
        ...data,
        result: data.result.filter(d => d.status === 'published'
            && !(d?.tags?.some(tag => tag.name === hiddenTag)))
    };

    return filtered;
}

function clientFilterDashboards(dashboards: Dashboard[], searchTerm: string): Dashboard[] {
    const term = searchTerm.toLowerCase().trim()

    return dashboards.filter((d) => {
        const certified = (d.certified_by || '').toLowerCase()
        const title = (d.dashboard_title || '').toLowerCase()
        const tags = d.tags?.map((t) => t.name.toLowerCase()).join(' ') || ''

        return certified.includes(term) || title.includes(term) || tags.includes(term)
    })
}

function filterDashboards(
  dashboards: Dashboard[],
  selectedTags: string[] = [],
  selectedAuthors: string[] = []
) {
  return dashboards.filter((d: Dashboard) => {
    const matchTag =
      selectedTags.length === 0 ||
      d.tags?.some((t) => selectedTags.includes(t.name))

    const matchAuthor =
      selectedAuthors.length === 0 ||
      selectedAuthors.includes(d.editor)

    return matchTag && matchAuthor
  })
}


async function searchDashboards(searchTerm = '') {
  const trimmedTerm = searchTerm.trim()
  const headers = await getHeader()

  if (!trimmedTerm) {
    const response = await fetch(`${appConfig.supersetUrl}/api/v1/dashboard/`, { headers })
    const data = await response.json()
    return data?.result?.filter(dashboard => !(dashboard?.tags?.includes(tag => tag.name === hiddenTag))) || []
  }

  const tagQuery = JSON.stringify({
    filters: [{ col: 'name', opr: 'ct', value: trimmedTerm }],
  })

  const tagResponse = await fetch(`${appConfig.supersetUrl}/api/v1/tag/?q=${encodeURIComponent(tagQuery)}`, { headers })

  let tagIds = []
  if (tagResponse.ok) {
    const tagData = await tagResponse.json()
    tagIds = tagData.result?.map((tag:DashboardTag) => tag.id) || []
  }

  const filters = [{ col: 'dashboard_title', opr: 'ct', value: trimmedTerm }]

  if (tagIds.length > 0) {
    for (const tagId of tagIds) {
      filters.push({ col: 'tags', opr: 'rel_m_m', value: tagId })
    }
  }

  const dashboardQuery = JSON.stringify({ filters })

  const response = await fetch(`${appConfig.supersetUrl}/api/v1/dashboard/?q=${encodeURIComponent(dashboardQuery)}`, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboards: ${response.statusText}`)
  }

  const data = await response.json()
  const dashboards = data.result.filter(dashboard => !(dashboard?.tags?.includes(tag => tag.name === hiddenTag))) || []

  const filtered = clientFilterDashboards(dashboards, trimmedTerm)

  return filtered
}

async function fetchDashboardEmbeddingConfiguration(dashboardId: string) {
    const response = await fetch(`${appConfig.supersetUrl}/api/v1/dashboard/${dashboardId}/embedded`, {
        method: 'GET',
        headers: await getHeader()
    });

    if (response.ok) {
        const data = await response.json();
        return data.result.uuid;
    } else if (response.status === 404) {
        return await createDashboardEmbeddingConfiguration(dashboardId)
    } else {
        const error = new Error(`Failed to fetch embedded dashboard with ID ${dashboardId}`) as SupersetError;
        error.dashboardId = dashboardId;
        error.status = response.status;
        throw error;
    }
}

async function createDashboardEmbeddingConfiguration(dashboardId: string) {
    const response = await fetch(`${appConfig.supersetUrl}/api/v1/dashboard/${dashboardId}/embedded`, {
        method: 'POST',
        headers: await getHeader(),
        body: JSON.stringify({
            allowed_domains: []
        }),
    })

    if (response.ok) {
        const data = await response.json()
        return data.result.uuid
    } else {
        const error = new Error(`Failed to create embedding configuration for dashboard with ID ${dashboardId}`) as SupersetError;
        error.dashboardId = dashboardId;
        error.status = response.status;
        throw error;
    }
}

async function fetchGuestToken(embeddableDashboardId: string) {
    const guestTokenResponse = await fetch(appConfig.supersetUrl + '/api/v1/security/guest_token/', {
        method: 'POST',
        headers: await getHeader(),
        body: JSON.stringify({
            user: {
                username: 'random',
                first_name: 'irrelevant',
                last_name: 'info',
            },
            resources: [
                {
                    type: 'dashboard',
                    id: embeddableDashboardId,
                },
            ],
            rls: [],
        }),
    })

    if (!guestTokenResponse.ok) {
        const error = await guestTokenResponse.text()
        throw new Error(`Failed to obtain guest token: ${error}`)
    }

  const result = await guestTokenResponse.json()
  return result.token
}

function embedDashboardByEmbeddableDashboardId(embeddableDashboardId: string, mountPoint: HTMLElement, dashboardUiConfig: UiConfigType = { hideTitle: true, filters: { expanded: false }}) {
    if (embeddableDashboardId) {
        return embedDashboard({
            id: embeddableDashboardId,
            supersetDomain: appConfig.supersetUrl,
            mountPoint: mountPoint,
            fetchGuestToken: () => fetchGuestToken(embeddableDashboardId),
            dashboardUiConfig,
        })
    }
}

async function requestDashboardScreenshot(dashboardId: string): Promise<string> {
    const response = await fetch(
        `${appConfig.supersetUrl}/api/v1/dashboard/${dashboardId}/cache_dashboard_screenshot/`,
        { method: 'POST', headers: await getHeader(), body: JSON.stringify({}) }
    )
    if (!response.ok) {
        console.error(`Failed to request screenshot for dashboard ${dashboardId}: ${response.status} ${response.statusText}`)
        throw new Error(`Failed to request screenshot for dashboard ${dashboardId}`)
    }
    const data = await response.json()
    return data.cache_key as string
}

async function fetchDashboardScreenshot(dashboardId: string, digest: string, format: 'png' | 'pdf' = 'png'): Promise<Blob> {
    const response = await fetch(
        `${appConfig.supersetUrl}/api/v1/dashboard/${dashboardId}/screenshot/${digest}/?download_format=${format}`,
        { method: 'GET', headers: await getHeader() }
    )
    if (!response.ok) {
        throw new Error(`Failed to fetch screenshot for dashboard ${dashboardId}`)
    }
    return response.blob()
}

async function downloadDashboardScreenshot(dashboardId: string, format: 'png' | 'pdf' = 'png'): Promise<Blob> {
    const digest = await requestDashboardScreenshot(dashboardId)

    const maxAttempts = 10
    const intervalMs = 2000
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, intervalMs))
        try {
            return await fetchDashboardScreenshot(dashboardId, digest, format)
        } catch {
            // not ready yet
        }
    }
    throw new Error(`Screenshot timed out for dashboard ${dashboardId}`)
}

async function queryCharts(searchTerm: string) {
    const queryParams = JSON.stringify({
        columns: [ 'slice_name', 'dashboards', 'dashboards.dashboard_title' ],
        filters: [{ col: 'slice_name', opr: 'ct', value: searchTerm }]
    })
    const response = await fetch(
        `${appConfig.supersetUrl}/api/v1/chart/?q=${encodeURIComponent(queryParams)}`,
        {
            method: 'GET',
            headers: await getHeader()
        }
    )
    if (!response.ok) {
        console.error(`failed to query charts ${response.status} ${response.statusText}`)
        return {}
        // throw new Error('failed to query charts')
    }
    return await response.json()
}

const SupersetService = {
    fetchDashboards,
    searchDashboards,
    fetchDashboardEmbeddingConfiguration,
    embedDashboardByEmbeddableDashboardId,
    filterDashboards,
    queryCharts,
    downloadDashboardScreenshot,
}

export default SupersetService