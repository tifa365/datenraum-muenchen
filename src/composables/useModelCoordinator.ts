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

import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useMutation, useQuery } from '@tanstack/vue-query'
import appConfig from '@config/appConfig'

const staleTime = 2 * 60 * 1000
const refetchOnWindowFocus = false
const baseUrl = appConfig?.modelCoordinatorUrl?.endsWith('/')
  ? appConfig?.modelCoordinatorUrl + 'api/'
  : appConfig?.modelCoordinatorUrl + '/api/'

export interface ModelCoordinatorModels {
  id: string
  title: string
}

export interface ModelExecutionParams {
  modelId: string
  parameters?: object
}

export interface ProcessDescription {
  id: string
  title?: string
  description?: string
  inputs?: Record<string, unknown> // JSON Schema object
}

// Builds an informative error for a non-ok response: what failed, the HTTP status
// and, when the body is JSON with an `error` field, the backend's own message.
// Body parsing problems never mask the original failure.
async function failedRequest(action: string, response: Response): Promise<Error> {
  let message = `failed to ${action}: ${response.status} ${response.statusText}`.trimEnd()
  const body = await response.json().catch(() => null)
  if (typeof body?.error === 'string' && body.error) {
    message += ` - ${body.error}`
  }
  return new Error(message)
}

export function useModels() {
  const modelsQuery = useQuery({
    queryKey: ['modelCoordinator-models'],
    refetchOnWindowFocus,
    staleTime,
    queryFn: async () => {
      const response = await fetch(
        baseUrl + 'processes/',
        {
          method: 'GET',
        }
      )
      if (!response.ok) {
        throw new Error(`failed to fetch model coordinator models ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      if (!Array.isArray(result.processes)) {
        throw new Error('failed to fetch model coordinator models: unexpected response shape')
      }
      return result.processes
    }
  })

  const models = computed(() => {
    // currently the model coordinator endpoint
    // /api/processes/{process-id} does not
    // return additional information, so return here.
    // this may be used in the future to populate
    // the response with additional information however
    if (modelsQuery.isSuccess && modelsQuery.data.value) {
      return modelsQuery.data.value
    }
    return []
  })

  return {
    isLoading: modelsQuery.isLoading,
    isError: modelsQuery.isError,
    error: modelsQuery.error,
    models
  }
}

export function useModelExecution() {
  const { isPending, isError, error, isSuccess, data, mutate } = useMutation({
    scope: {
      id: 'execute-model',
    },
    mutationFn: async (params: ModelExecutionParams) => {
      const modelId = params.modelId
      const paramsJson = JSON.stringify(params?.parameters ?? {})
      const response = await fetch(
        baseUrl + `processes/${modelId}/execution`,
        {
          method: 'POST',
          headers: [
            ['Content-Type', 'application/json']
          ],
          body: paramsJson
        },
      )
      if (!response.ok) {
        throw await failedRequest(`execute model ${modelId}`, response)
      }
      const result = await response.json()
      if (result.status !== 'running') {
        throw new Error(`failed to execute model ${modelId}, result is ${result.status}`)
      }
      return result
    }
  })

  return {
    isPending,
    isError,
    error,
    isSuccess,
    data,
    mutate
  }
}

export function useJobStatus(jobIdRef: MaybeRefOrGetter<string>) {
  const { isLoading, isError, error, data } = useQuery({
    queryKey: ['job-status', jobIdRef],
    refetchOnWindowFocus,
    staleTime,
    enabled: () => !!(toValue(jobIdRef)),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'successful' || status === 'failed' || status === 'dismissed') {
        return false
      }
      return 1000
    },
    queryFn: async () => {
      const jobId = toValue(jobIdRef)
      const response = await fetch(
        baseUrl + `jobs/${jobId}`,
        {
          method: 'GET'
        },
      )
      if (!response.ok) {
        console.error(`failed to fetch status for job with id ${jobId}, ${response.status} | ${response.statusText}`)
        throw new Error(`failed to fetch status for job with id  ${jobId}`)
      }
      return response.json()
    }
  })
  return {
    isLoading,
    isError,
    error,
    data
  }
}

export function useJobResults(maybeJobId: MaybeRefOrGetter<string>) {
  const { isLoading, isError, error, data } = useQuery({
    queryKey: ['job-result', maybeJobId],
    refetchOnWindowFocus,
    staleTime,
    enabled: () => !!(toValue(maybeJobId)),
    queryFn: async () => {
      const jobId = toValue(maybeJobId)
      const response = await fetch (
        baseUrl + `jobs/${jobId}/results`,
        {
          method: 'GET'
        }
      )
      if (!response.ok) {
        console.error(`failed to fetch results for job with id ${jobId}, ${response.status} | ${response.statusText}`)
        throw new Error(`failed to fetch results for job with id  ${jobId}`)
      }
      return response.json()
    }
  })
  return {
    isLoading,
    isError,
    error,
    data
  }
}

export function useProcessDescription(processId: MaybeRefOrGetter<string>) {
  const { isLoading, isError, error, data } = useQuery({
    queryKey: computed(() => ['process-description', toValue(processId)]),
    refetchOnWindowFocus,
    staleTime,
    enabled: () => !!toValue(processId),
    queryFn: async () => {
      const id = toValue(processId)
      const response = await fetch(baseUrl + `processes/${id}`, { method: 'GET' })
      if (!response.ok) {
        throw await failedRequest(`fetch process description for ${id}`, response)
      }
      return response.json() as Promise<ProcessDescription>
    },
  })
  return { isLoading, isError, error, data }
}

export function useScenarioLoader(distributionId: MaybeRefOrGetter<string>) {
  const { isFetching, isError, error, data, refetch } = useQuery({
    queryKey: computed(() => ['scenario', toValue(distributionId)]),
    enabled: false,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const id = toValue(distributionId)
      const response = await fetch(baseUrl + 'scenarios/distribution?distributionId=' + encodeURIComponent(id), {
        method: 'GET',
      })
      if (!response.ok) {
        throw await failedRequest(`load scenario for distribution ${id}`, response)
      }
      const result = await response.json()
      return result.inputs as Record<string, unknown>
    },
  })
  return { isFetching, isError, error, data, refetch }
}
