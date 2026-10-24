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

import { computed, getCurrentInstance, toValue, type MaybeRefOrGetter } from "vue"
import { useQuery } from "@tanstack/vue-query"
import appConfig from '@/../config/appConfig'
import { useAuthStore } from "@/stores/authStore.js"

const baseUrl = appConfig.oup.url.endsWith('/')
  ? appConfig.oup.url
  : appConfig.oup.url + '/'
const infoUrl = baseUrl + 'UrbanPulseManagement/api/eventtypes/'
const dataUrl = baseUrl + 'UrbanPulseData/historic/sensordata?'
const dataPreviewEndpoint = appConfig.middlewareUrl.endsWith('/')
  ? appConfig.middlewareUrl + 'datasetPreview/'
  : appConfig.middlewareUrl + '/datasetPreview/'


export interface DatasetPreviewTableHeader {
  field: string
  header: string
  __dataType: string
}

export type DatasetPreviewTableData = {
  [key: string]: any
}

export function isOUPUrl(url: string) {
  return isOUPInfoUrl(url) || isOUPDataUrl(url)
}

function isOUPInfoUrl(url: string) {
  return !!url && url.startsWith(infoUrl)
}

function isOUPDataUrl(url: string) {
  return !!url && url.startsWith(dataUrl)
}

/**
 * Manages async fetching of dataset preview table data using OUP historic API
 * @param id The sensor id. If reactive, it will trigger a refetch whenever changed.
 * @param url The access url
 * @returns 
 */
export function useDatasetPreviewTable(id: MaybeRefOrGetter<string>, url: MaybeRefOrGetter<string>) {
  const vm = getCurrentInstance();
  if (!vm) {
    throw new Error('useDatasetPreviewTable must be called within a setup function');
  }

  const authStore = useAuthStore()

  const isDataUrl = computed(() => isOUPDataUrl(toValue(url)))
  const isInfoUrl = computed(() => isOUPInfoUrl(toValue(url)))

  // parse correct parameter for dataset preview requests
  // if url is infoUrl -> parse id from pathname
  // if url is dataUrl -> parse eventType or eventTypeName from queryString
  const datasetParameter: MaybeRefOrGetter<string> = computed(() => {
    if (!isInfoUrl.value && !isDataUrl.value) {
      return ''
    }

    const parsedUrl = new URL(toValue(url))
    if (isInfoUrl.value) {
      return parsedUrl.pathname.split('/')[4]
    } else {
      return parsedUrl.searchParams.get('eventType') || parsedUrl.searchParams.get('eventTypeName') || ''
    }
  })

  const queryKey = computed(() => (['datasetPreviewQuery', toValue(id)]) )
  const enableDatasetPreviewQuery = computed(() => !!toValue(id) && !!toValue(datasetParameter))
  const datasetPreviewQuery = useQuery({
    queryKey: queryKey,
    enabled: enableDatasetPreviewQuery,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    queryFn: async () => {
      const response = await fetch(
        dataPreviewEndpoint + datasetParameter.value,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${await authStore.getAuthToken()}`,
          },
        }
      )
      if (!response.ok) {
        throw new Error(`failed to fetch dataset preview ${response.status} ${response.statusText}`)
      }
      return await response.json()
    }
  })

  const isLoadingPreviewTable = computed(() => datasetPreviewQuery.isFetching.value)
  const isError = computed(() => datasetPreviewQuery.isError.value)

  const previewTableHeader = computed<DatasetPreviewTableHeader[]>(() => {
    const header = datasetPreviewQuery.isSuccess
      && datasetPreviewQuery.data.value?.event
    if (!header) return []
    const headerKeys = Object.keys(header.description)
    return headerKeys.map((key) => ({
      field: key,
      header: header.description[key as keyof typeof header.description],
      __dataType: header.config[key as keyof typeof header.config],
    }))
  })

  const previewTableData = computed<DatasetPreviewTableData[]>(() => {
    const data = datasetPreviewQuery.isSuccess
      && datasetPreviewQuery.data.value?.data
    if (!data) return []
    return data
  })

  return {
    previewTableHeader,
    previewTableData,
    isLoadingPreviewTable,
    isError
  }
}