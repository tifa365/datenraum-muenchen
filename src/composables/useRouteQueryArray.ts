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

import { type Ref } from 'vue'
import { useRouteQuery } from '@vueuse/router'

export function useRouteQueryArray<T>(queryParam: string, initialValue: string = '[]') {
  const arr: Ref<T[]> = useRouteQuery<string | undefined, T[]>(
    queryParam,
    initialValue,
    {
      transform: {
        get: (value: string | undefined): T[] => {
          if (!value) {
            return []
          }
          try {
            return JSON.parse(decodeURIComponent(value))
          } catch (e) {
            return []
          }
        },
        set: (value: T[]): string | undefined => {
          if (!value || value.length === 0) {
            return undefined
          }
          try {
            return encodeURIComponent(JSON.stringify(value))
          } catch (e) {
            return undefined
          }
        },
      }
    }
  )

  return {
    items: arr,
    push: (item: T) => {
      if (item === undefined || item === null) {
        return
      }
      arr.value = [...arr.value, item]
    },
    remove: (index: number) => {
      if (index >= 0 && index < arr.value.length) {
        arr.value = arr.value.filter((_, i) => i !== index)
      }
    },
    removeByValue: (item: T) => {
      const index = arr.value.indexOf(item)
      if (index > -1) {
        arr.value = arr.value.filter((_, i) => i !== index)
      }
    },
    clear: () => {
      arr.value = []
    },
    toggle: (item: T) => {
      const index = arr.value.indexOf(item)
      if (index === -1) {
        arr.value = [...arr.value, item]
      } else {
        arr.value = arr.value.filter((_, i) => i !== index)
      }
    }
  }
}
