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
import { useAuthStore } from '@/stores/authStore.js'

type Mode = 'mobile' | 'desktop'

export function useSidebarModules(t: (key: string) => string, mode: Mode = 'desktop') {
  const useIconKeys = (active: string, inactive: string, key?: string) => 
    mode === 'mobile'
      ? {
          iconActive: appConfig.customer.modules[key]?.iconActive || active,
          iconInactive: appConfig.customer.modules[key]?.icon || inactive
        }
      : {
          icon: appConfig.customer.modules[key]?.icon || inactive,
          iconActive: appConfig.customer.modules[key]?.iconActive || active
        }

  const auth = useAuthStore()

  const orderedModules = computed(() => {
    const modules = [
    {
      name: 'home',
      available: appConfig.customer.modules.home?.available === 'true',
      requiresLogin: appConfig.customer.modules.home?.requiresLogin === 'true',
      order: appConfig.customer.modules.home?.order,
      ...useIconKeys('src/assets/icons/HomeActive.svg', 'src/assets/icons/Home.svg', 'home'),
      route: '/app/home',
      title: t('navigation.home'),
    },
    {
      name: 'digitalTwin',
      available: appConfig.customer.modules.digitalTwin?.available === 'true',
      requiresLogin: appConfig.customer.modules.digitalTwin?.requiresLogin === 'true',
      order: appConfig.customer.modules.digitalTwin?.order,
      ...useIconKeys('src/assets/icons/FlipActive.svg', 'src/assets/icons/Flip.svg', 'digitalTwin'),
      route: '/app/digital-twin',
      title: t('navigation.digital-twin'),
    },
    {
      name: 'dashboards',
      available: appConfig.customer.modules.dashboards?.available === 'true',
      requiresLogin: appConfig.customer.modules.dashboards?.requiresLogin === 'true',
      order: appConfig.customer.modules.dashboards?.order,
      ...useIconKeys('src/assets/icons/LayoutActive.svg', 'src/assets/icons/Layout.svg', 'dashboards'),
      route: '/app/dashboards',
      title: t('navigation.dashboards'),
    },
    {
      name: 'dataCatalog',
      available: appConfig.customer.modules.dataCatalog?.available === 'true',
      requiresLogin: appConfig.customer.modules.dataCatalog?.requiresLogin === 'true',
      order: appConfig.customer.modules.dataCatalog?.order,
      ...useIconKeys('src/assets/icons/LayerActive.svg', 'src/assets/icons/Layer.svg', 'dataCatalog'),
      route: '/app/data-catalog',
      title: t('navigation.data-catalog'),
    },
    {
      name: 'organisationSites',
      available: appConfig.customer.modules.organisationSites?.available === 'true',
      requiresLogin: appConfig.customer.modules.organisationSites?.requiresLogin === 'true',
      order: appConfig.customer.modules.organisationSites?.order,
      ...useIconKeys('src/assets/icons/CompassActive.svg', 'src/assets/icons/Compass.svg', 'organisationSites'),
      route: '/app/organisation-sites',
      title: t('navigation.organisation-sites'),
    },
    {
      name: 'dksrApps',
      available: appConfig.customer.modules.dksrApps?.available === 'true',
      requiresLogin: appConfig.customer.modules.dksrApps?.requiresLogin === 'true',
      order: appConfig.customer.modules.dksrApps?.order,
      ...useIconKeys('src/assets/icons/StatsActive.svg', 'src/assets/icons/Stats.svg', 'dksrApps'),
      route: '/app/data-analytics',
      title: t('navigation.dksr-apps'),
    },
    {
      name: 'analytics',
      available: appConfig.customer.modules?.analytics?.available === 'true',
      requiresLogin: appConfig.customer.modules?.analytics?.requiresLogin === 'true',
      order: appConfig.customer.modules?.analytics?.order,
      ...useIconKeys('src/assets/icons/analytics.svg', 'src/assets/icons/analytics.svg', 'analytics'),
      route: '/app/analytics',
      title: t('navigation.analytics'),
    },
    ...(appConfig.customer.modules.customIframeModule ? [{
      name: appConfig.customer.modules.customIframeModule?.name,
      available: appConfig.customer.modules.customIframeModule?.available === 'true',
      requiresLogin: appConfig.customer.modules.customIframeModule?.requiresLogin === 'true',
      order: appConfig.customer.modules.customIframeModule?.order,
      ...useIconKeys(
        appConfig.customer.modules.customIframeModule?.iconActive,
        appConfig.customer.modules.customIframeModule?.icon
      ),
      route: appConfig.customer.modules.customIframeModule?.route,
      title: t(appConfig.customer.modules.customIframeModule?.title)
    }] : []),
    ...(appConfig.customer.modules.customIframeModule2 ? [{
      name: appConfig.customer.modules.customIframeModule2?.name,
      available: appConfig.customer.modules.customIframeModule2?.available === 'true',
      requiresLogin: appConfig.customer.modules.customIframeModule2?.requiresLogin === 'true',
      order: appConfig.customer.modules.customIframeModule2?.order,
      ...useIconKeys(
        appConfig.customer.modules.customIframeModule2?.iconActive,
        appConfig.customer.modules.customIframeModule2?.icon
      ),
      route: appConfig.customer.modules.customIframeModule2?.route,
      title: t(appConfig.customer.modules.customIframeModule2?.title)
    }] : []),
    ...(appConfig.customer.modules.customIframeModule3 ? [{
      name: appConfig.customer.modules.customIframeModule3?.name,
      available: appConfig.customer.modules.customIframeModule3?.available === 'true',
      requiresLogin: appConfig.customer.modules.customIframeModule3?.requiresLogin === 'true',
      order: appConfig.customer.modules.customIframeModule3?.order,
      ...useIconKeys(
        appConfig.customer.modules.customIframeModule3?.iconActive,
        appConfig.customer.modules.customIframeModule3?.icon
      ),
      route: appConfig.customer.modules.customIframeModule3?.route,
      title: t(appConfig.customer.modules.customIframeModule3?.title)
    }] : []),
  ]

  return modules
    .filter((m) => m.available)
    .filter((m) => !m.requiresLogin || auth.authenticated)
    .sort((a, b) => a.order - b.order)
  })

  return { orderedModules }
}
