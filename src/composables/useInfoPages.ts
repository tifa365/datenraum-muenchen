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

import { type ShallowRef, type ComputedRef, computed, shallowRef } from 'vue'
import appConfig from '@config/appConfig'
import { useAuthStore } from '@/stores/authStore.js'
import InterfacesTab from '@/components/info-pages/InterfacesTab.vue'

export type InfoTab = {
  id: string
  translationKey: string

  /*
   * Module requirement for displaying the tab.
   *
   * ⚠️ Currently ONLY `dataCatalog` is supported.
   * Other module names are ignored.
   *
   * This is intentionally limited for now and may be
   * extended in the future.
   */

  requiresModule?: 'dataCatalog'
  isHidden?: boolean
  requiresLogin?: boolean
  component?: any
  link?: string
}

/**
 * Load default and customer info pages as tab information
 * for display on InfoPage
 * @returns
 */
export function useInfoPages() {
  const authStore = useAuthStore()
  const enabledTabs: Array<string> = appConfig?.customer?.infoPages?.split(',') ?? ['*']

  const customerName = appConfig.customer.name
  const customerHasDatCatalogModule = appConfig.customer.modules.dataCatalog?.available === 'true'

  const defaultTabs: InfoTab[] = [
    {
      id: 'Interfaces',
      translationKey: 'info.tabs.interfaces',
      requiresModule: 'dataCatalog',
      isHidden: false,
      requiresLogin: false,
      component: InterfacesTab,
      link: '/app/info?tab=Interfaces',
    },
  ]

  const customerTabs: ShallowRef<InfoTab[]> = shallowRef([])
  import(`@config/${customerName}/components/app-info/index.ts`)
    .then((module) => {
      customerTabs.value = module.default as InfoTab[]
    })
    .catch((error) => {
      console.warn(
        `No customer-specific tabs found for ${customerName}:`,
        error
      )
    })

  const allTabs: ComputedRef<InfoTab[]> = computed(() => [
    ...defaultTabs,
    ...customerTabs.value,
  ])


  // filter tabs by visibility criteria
  const filteredTabs = computed(() => {
    return allTabs.value.reduce((tabs: InfoTab[], tab: InfoTab) => {
      const { requiresModule, isHidden, requiresLogin } = tab

      const isEnabled = enabledTabs.includes('*') || enabledTabs.includes(tab.id)
      const isrequiresLogin = requiresLogin && !authStore.authenticated
      const isRequiredModule = requiresModule === 'dataCatalog' && !customerHasDatCatalogModule

      if (!isEnabled || isHidden || isrequiresLogin || isRequiredModule) {
        return tabs
      }

      tabs.push(tab)

      return tabs
    }, [] as InfoTab[])
  })

  return filteredTabs
}

