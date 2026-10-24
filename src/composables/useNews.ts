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

import { computed, type ComputedRef } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { useAuthStore } from "@/stores/authStore.js";
import appConfig from "@config/appConfig";

const staleTime = 2 * 60 * 1000
const refetchOnWindowFocus = false
const middlewareNewsUrl = appConfig.middlewareUrl.endsWith('/')
  ? appConfig.middlewareUrl + 'news'
  : appConfig.middlewareUrl + '/news'

interface NewsItem {
  header: string
  subject: Record<string, string>
  subjectId: string
  url: string
  type: string
  timestamp: Date
}

interface RawNewsItem {
  type: "newCatalogue" | "newDataset" | "newDashboard" | "newOrganization"
  publisher: {
    name: string
    email: string
    homepage: string
    resource: string
    type: string
  }
  timestamp: number
  newsSubjectID: string
  title: Record<string, string>
  description: Record<string, string>
}

function getUrlFor(rawItem: RawNewsItem) {
  switch (rawItem.type) {
    case 'newDataset':
      return `/app/data-catalog/${rawItem.newsSubjectID}`
    case 'newCatalogue':
      return `/app/data-catalog?catalog=${rawItem.newsSubjectID}`
    case 'newDashboard':
      return `/app/dashboards/${rawItem.newsSubjectID}`
    case 'newOrganization':
      return `/app/organisation-sites/${rawItem.newsSubjectID}`
  }
  console.error('unknown news type {}', rawItem.type)
  return '#'
}

export function useNews() {
  const authStore = useAuthStore()
  const newsQuery = useQuery({
    queryKey: ['newsQuery'],
    refetchOnWindowFocus,
    staleTime,
    queryFn: async () => {
      const response = await fetch(
        middlewareNewsUrl,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${await authStore.getAuthToken()}`,
          },
        }
      )
      if (!response.ok) {
        throw new Error(`failed to fetch news ${response.status} ${response.statusText}`)
      }
      return await response.json()
    }
  })

  const rawNewsItems = computed(() => {
    if (newsQuery.isSuccess && !! newsQuery.data.value) {
      return newsQuery.data.value
    }
    return []
  })

  const newsItems: ComputedRef<NewsItem[]> = computed(() => {
    return rawNewsItems.value
      .map((rawItem: any) => {
        return {
          type: rawItem.type,
          header: rawItem.publisher.name === 'Publisher name is missing!'
            ? '--'
            : rawItem.publisher.name,
          subject: rawItem.title,
          url: getUrlFor(rawItem),
          timestamp: new Date(rawItem.timestamp)
        }
      })
      .sort((a: NewsItem, b: NewsItem) => 
        b.timestamp.getTime() - a.timestamp.getTime())
  })

  return {
    isLoading: newsQuery.isLoading,
    isError: newsQuery.isError,
    newsItems 
  }
}