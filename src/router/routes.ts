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

import appConfig from '@config/appConfig'
import HomeView from '@/views/app/HomeView.vue'
import UserProfileView from '@/views/app/UserProfileView.vue'
import OrganisationSitesView from '@/views/app/OrganisationSitesView.vue'
import OrganisationSitesDetailView from '@/views/app/OrganisationSitesDetailView.vue'
import OrganisationDataView from '@/views/app/OrganisationDataView.vue'
import DataExchangeView from '@/views/app/DataExchangeView.vue'
import EmptyView from '@/views/app/EmptyView.vue'
import DatasetSearchView from '@/projects/kdw/views/DatasetSearchView.vue'
import DatasetDetailsView from '@/projects/kdw/views/DatasetDetailsView.vue'
import AppView from '@/views/app/AppView.vue'
import PublicDataCatalogView from '@/views/public/PublicDataCatalogView.vue'
import PublicDatasetDetailsView from '@/views/public/PublicDatasetDetailsView.vue'
import PublicView from '@/views/public/PublicView.vue'
import LandingPageView from '@/views/public/LandingPageView.vue'
import DashboardsView from '@/views/app/DashboardsView.vue'
import DashboardView from '@/views/app/DashboardView.vue'
import DataFetchingComponent from '../projects/data-provider-interface/components/DataFetchingComponent.vue'
// import InputPage from '../projects/data-provider-interface/views/InputPage.vue'
import DataNoticesView from '@/views/app/DataNoticesView.vue'
import DKSRAppsView from '@/views/app/DKSRAppsView.vue'
import DKSRAppView from '@/views/app/DKSRAppView.vue'
import PublicDataNoticesView from '@/views/public/PublicDataNoticesView.vue'
import CustomIframeView from "@/views/app/CustomIframeView.vue";
import CIVIframeView from "@/views/app/CIVIframeView.vue";

import { InputPage } from '@piveau/piveau-hub-ui-modules/dataProviderInterface'
import InfoPageView from "@/views/app/InfoPageView.vue";
import AdminView from "@/views/admin/AdminView.vue"
import { useAdminCards } from '@/composables/useAdminCards.js'
import CivoraAnalyticsMainView from '@/modules/civora-analytics/CivoraAnalyticsMainView.vue'
import CivoraAnalyticsModelsView from '@/modules/civora-analytics/CivoraAnalyticsModelsView.vue'
import CivoraAnalyticsExecuteView from '@/modules/civora-analytics/CivoraAnalyticsExecuteView.vue'


const routes: any[] = []
const publicSubRoutes: any[] = []
const subRoutes: any[] = []

publicSubRoutes.push(
  {
    path: '/',
    component: LandingPageView,
    meta: {
      requiresAuth: false,
      accessible: appConfig.customer.landingPagePublic === 'true',
    },
  },
  {
    path: '/data-notices',
    component: PublicDataNoticesView,
    meta: {
      requiresAuth: false,
      accessible: appConfig.customer.isDataNoticesDisabled !== 'true'
    },
  },
  {
    path: '/data-catalog',
    meta: {
      requiresAuth: false,
      accessible: appConfig.customer.modules.dataCatalog.available === 'true',
    },
    children: [
      {
        path: '',
        component: PublicDataCatalogView,
        meta: {
          requiresAuth: false,
        },
      },
      {
        path: '/data-catalog/:datasetId',
        name: 'public-datasets-detail',
        component: PublicDatasetDetailsView,
        meta: {
          requiresAuth: false,
        },
      },
    ],
  },
  {
    path: '/info',
    component: InfoPageView,
    meta: {
      requiresAuth: false,
    },
  }
)

if (appConfig.customer.landingPagePublic === 'true') {
  routes.push({
    path: '/',
    component: PublicView,
    meta: {
      requiresAuth: false,
    },
    children: publicSubRoutes,
  })
}

subRoutes.push(
  {
    path: '/app/home',
    component: HomeView,
    meta: {
      requiresAuth: appConfig.customer.modules.home?.requiresLogin === 'true',
    },
  },
  {
    name: 'DataNotices',
    path: '/app/data-notices',
    component: DataNoticesView,
    meta: {
      requiresAuth: false,
      accessible: appConfig.customer.isDataNoticesDisabled !== 'true'
    },
  },
  {
    path: '/app/data-analytics',
    meta: {
      requiresAuth: appConfig.customer.modules.dksrApps?.requiresLogin === 'true',
      accessible: appConfig.customer.modules.dksrApps?.available === 'true',
    },
    children: [
      {
        path: '',
        component: DKSRAppsView,
        meta: {
          requiresAuth: appConfig.customer.modules.dksrApps?.requiresLogin === 'true',
        },
      },
      {
        path: '/app/data-analytics/:id',
        component: DKSRAppView,
        meta: {
          requiresAuth: appConfig.customer.modules.dksrApps?.requiresLogin === 'true',
        },
      },
    ],
  },
  {
    path: '/app/dashboards',
    meta: {
      requiresAuth: appConfig.customer.modules.dashboards?.requiresLogin === 'true',
      accessible: appConfig.customer.modules.dashboards?.available === 'true',
    },
    children: [
      {
        path: '',
        component: DashboardsView,
        meta: {
          requiresAuth: appConfig.customer.modules.dashboards?.requiresLogin === 'true',
        },
      },
      {
        path: '/app/dashboards/:dashboardId',
        component: DashboardView,
        meta: {
          requiresAuth: appConfig.customer.modules.dashboards?.requiresLogin === 'true',
        },
      },
    ],
  },
  {
    path: '/app/digital-twin',
    component: CIVIframeView,
    props: {
      titleKey: 'digital-twin.title',
      subtitleKey: 'digital-twin.subtitle',
      footerKey: 'digital-twin.footer',
      url: appConfig.digitalTwinUrl,
      authenticatedUrl: appConfig.digitalTwinUrlAuthenticated,
      showFullscreenButton: appConfig.customer.modules.digitalTwin?.showFullscreenButton === 'true',
      maximize: appConfig.customer.modules.digitalTwin?.maximize === 'true',
      isPluginEnabled: appConfig.customer.modules.digitalTwin?.isPluginEnabled === 'true',
    },
    meta: {
      requiresAuth: appConfig.customer.modules.digitalTwin?.requiresLogin === 'true',
      accessible: appConfig.customer.modules.digitalTwin?.available === 'true',
    },
  },
  {
    path: '/app/user-profile',
    component: UserProfileView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/app/organisation-sites',
    children: [
      {
        path: '',
        component: OrganisationSitesView,
        meta: {
          requiresAuth: appConfig.customer.modules.organisationSites?.requiresLogin === 'true',
          accessible: appConfig.customer.modules.organisationSites?.available === 'true',
        },
      },
      {
        path: '/app/organisation-sites/:organisationId',
        name: 'organisations-detail',
        // TODO
        component: OrganisationSitesDetailView,
        meta: {
          requiresAuth: appConfig.customer.modules.organisationSites?.requiresLogin === 'true',
          accessible: appConfig.customer.modules.organisationSites?.available === 'true',
        },
      },
    ],
  },
  {
    // TODO
    path: '/app/catalogs',
    meta: {
      accessible: false,
    },
    children: [
      {
        path: '',
        component: EmptyView,
        meta: {
          requiresAuth: appConfig?.requiresLogin === 'true',
        },
      },
      {
        path: 'app/catalogs/:catalogId',
        component: EmptyView,
        meta: {
          requiresAuth: appConfig?.requiresLogin === 'true',
        },
      },
    ],
  },
  {
    path: '/app/tbd',
    component: EmptyView,
    meta: {
      requiresAuth: appConfig?.requiresLogin === 'true',
      accessible: false,
    },
  },
  {
    path: '/app/data-catalog',
    meta: {
      requiresAuth: appConfig.customer.modules.dataCatalog?.requiresLogin === 'true',
      accessible: appConfig.customer.modules.dataCatalog?.available === 'true',
    },
    children: [
      {
        path: '',
        component: DatasetSearchView,
        meta: {
          requiresAuth: appConfig.customer.modules.dataCatalog?.requiresLogin === 'true',
        },
      },
      {
        path: '/app/data-catalog/:datasetId',
        name: 'datasets-detail',
        component: DatasetDetailsView,
        meta: {
          requiresAuth: appConfig.customer.modules.dataCatalog?.requiresLogin === 'true',
        },
      },
      {
        // Necessary for DPI to work since it uses this route as hardcoded destination on successful submission
        // Just redirect to the dataset detail page including datasetId
        name: 'DatasetDetailsDataset',
        path: '/app/data-catalog/redirect-dataset/:ds_id',
        redirect: (to: any) => {
          return { name: 'datasets-detail', params: { datasetId: to.params.ds_id }, replace: true }
        }
      },
      {
        path: '/app/data-catalog/organisation-data',
        component: OrganisationDataView,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/app/data-catalog/data-exchange',
        component: DataExchangeView,
        meta: {
          requiresAuth: appConfig.customer.modules.dataCatalog?.requiresLogin === 'true',
        },
      }
    ],
  },
  {
    path: '/app/info',
    component: InfoPageView,
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/app/admin-cockpit',
    component: AdminView,
    meta: {
      requiresAuth: true,
      accessible: appConfig.customer.modules?.adminCockpit?.available === 'true',
      canAccess: () => useAdminCards().value.length > 0
    },
  },
  {
    path: '/app/analytics',
    meta: {
      accessible: appConfig.customer.modules?.analytics?.available === 'true',
      requiresAuth: appConfig.customer.modules?.analytics?.requiresLogin === 'true',
    },
    children: [
      {
        path: '',
        component: CivoraAnalyticsMainView,
        meta: {
          requiresAuth: appConfig.customer.modules?.analytics?.requiresLogin === 'true',
        }
      },
      {
        path: '/app/analytics/models',
        component: CivoraAnalyticsModelsView,
        meta: {
          requiresAuth: appConfig.customer.modules?.analytics?.requiresLogin === 'true',
        }
      },
      {
        path: '/app/analytics/models/execute/:modelId',
        component: CivoraAnalyticsExecuteView,
        meta: {
          requiresAuth: appConfig.customer.modules?.analytics?.requiresLogin === 'true',
        }
      },
    ]
  },
)

const customIframeModuleConfig = appConfig.customer.modules.customIframeModule

if (customIframeModuleConfig &&
    customIframeModuleConfig.available === 'true' &&
    customIframeModuleConfig.route)
{
  const route =
    {
      path: customIframeModuleConfig.route,
      component: CIVIframeView,
      props: {
        titleKey: customIframeModuleConfig?.iframeTitle,
        url: customIframeModuleConfig?.url,
        authenticatedUrl: customIframeModuleConfig?.authenticatedUrl,
        showFullscreenButton: customIframeModuleConfig?.showFullscreenButton === 'true',
        maximize: customIframeModuleConfig?.maximize === 'true',
        isPluginEnabled: customIframeModuleConfig?.isPluginEnabled === 'true',
      },
      meta: {
        requiresAuth: customIframeModuleConfig.requiresLogin === 'true',
      }
    }
  subRoutes.push(route)
}

const customIframeModuleConfig2 = appConfig.customer.modules.customIframeModule2

if (customIframeModuleConfig2 &&
    customIframeModuleConfig2.available === 'true' &&
    customIframeModuleConfig2.route)
{
  const route =
    {
      path: customIframeModuleConfig2.route,
      component: CIVIframeView,
      props: {
        titleKey: customIframeModuleConfig2?.iframeTitle,
        url: customIframeModuleConfig2?.url,
        authenticatedUrl: customIframeModuleConfig2?.authenticatedUrl,
        showFullscreenButton: customIframeModuleConfig2?.showFullscreenButton === 'true',
        maximize: customIframeModuleConfig2?.maximize === 'true',
        isPluginEnabled: customIframeModuleConfig2?.isPluginEnabled === 'true',
      },
      meta: {
        requiresAuth: customIframeModuleConfig2.requiresLogin === 'true',
      }
    }
  subRoutes.push(route)
}

const customIframeModuleConfig3 = appConfig.customer.modules.customIframeModule3

if (customIframeModuleConfig3 &&
    customIframeModuleConfig3.available === 'true' &&
    customIframeModuleConfig3.route)
{
  const route =
    {
      path: customIframeModuleConfig3.route,
      component: CIVIframeView,
      props: {
        titleKey: customIframeModuleConfig3?.iframeTitle,
        url: customIframeModuleConfig3?.url,
        authenticatedUrl: customIframeModuleConfig3?.authenticatedUrl,
        showFullscreenButton: customIframeModuleConfig3?.showFullscreenButton === 'true',
        maximize: customIframeModuleConfig3?.maximize === 'true',
        isPluginEnabled: customIframeModuleConfig3?.isPluginEnabled === 'true',
      },
      meta: {
        requiresAuth: customIframeModuleConfig3.requiresLogin === 'true',
      }
    }
  subRoutes.push(route)
}

routes.push({
  path: '/app',
  component: AppView,
  redirect: '/app/home',
  meta: {
    requiresAuth: false,
  },
  children: subRoutes,
})

routes.push({
  path: '/dpi',
  name: 'DataProviderInterface',
  component: () => import('../projects/data-provider-interface/KDWDataProviderInterface.vue'),
  meta: {
    requiresAuth: true,
    accessible: appConfig.customer.modules.dataCatalog?.available === 'true',
  },
  children: [
    {
      path: ':property',
      name: 'DataProviderInterface-Input',
      component: InputPage,
      props: true,
    },
  ],
})

routes.push({
  path: '/dpi/draft',
  name: 'DataProviderInterface-Draft',
  redirect: { path: '/app/data-catalog/organisation-data', replace: true }
}),

routes.push({
  path: '/dpi/edit/:catalog/:property/:id',
  name: "DataProviderInterface-Edit",
  component: DataFetchingComponent,
  props: true
})

routes.push({
  path: '/civora-dpi',
  name: 'CivoraDPI',
  component: () => import('../components/civora-dpi/CivoraDPIFrame.vue'),
  meta: {
    requiresAuth: true,
    accessible: appConfig.customer.modules.dataCatalog?.available === 'true',
  },
})

export default routes
