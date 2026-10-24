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

import { computed } from 'vue'

import appConfig from '@config/appConfig'
import { useAuthStore } from '@/stores/authStore'
import {
  availableDataNoticeComponents,
  getDataNoticeComponentPath,
  supportedDataNoticePages,
} from '@/utils/dataNoticePages'

export function useDataNoticePages() {
  const authStore = useAuthStore()
  const customerName = appConfig.customer.name

  return computed(() =>
    supportedDataNoticePages.filter(page => {
      const componentPath = getDataNoticeComponentPath(customerName, page.id)
      const isAllowedByAuth =
        !page.requiresAuth || authStore.authenticated || customerName === 'datenatlas'

      return componentPath in availableDataNoticeComponents && isAllowedByAuth
    })
  )
}
