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

import './assets/stylesheets/reset.css'
import './assets/stylesheets/fonts.css'
import './assets/stylesheets/cookie-consent.css'
import './projects/kdw/assets/tailwind.css'
import './projects/kdw/assets/base.css'
import '@fontsource-variable/inter'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createStore } from 'vuex'
import PrimeVue from 'primevue/config'
import { plugin as FormKitPlugin, defaultConfig } from '@formkit/vue'
import { de, en, cs } from '@formkit/i18n'
import '@formkit/themes/genesis'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { plugin as piveauSdkPlugin } from '@piveau/sdk-vue'
import { store as dpiStore} from '@piveau/piveau-hub-ui-modules/dataProviderInterface'
import { registerComponents } from '@piveau/piveau-hub-ui-modules/dataProviderInterface'

import appConfig from "../config/appConfig"
import router from './router'
import i18n from '@/i18n.js'
import authStore from './projects/data-provider-interface/store/authStore'
import snackbarStore from './projects/data-provider-interface/store/snackbarStore'
import config from './formkit.config.js'
import { userConfigShimPlugin } from '@config/userConfigShimPlugin'
import { overrideBaseStyles } from "@/utils/overrideStyles.js"
import { useAuthStore } from './stores/authStore.js'
import KDW from '../src/projects/kdw/components/base/preset/index.js'
import App from './App.vue'
import Tooltip from 'primevue/tooltip';
import type { KeycloakInitOptions } from 'keycloak-js'

document.title = appConfig.customer.metaTitle ?? appConfig.customer.appTitle ?? "CIVORA"

const description = appConfig.customer.metaDescription
if(description) {
  const meta = document.createElement("meta")
  meta.setAttribute("name", "description")
  meta.setAttribute("content", description)
  document.head.appendChild(meta)
}

const customer = appConfig.customer.name;
overrideBaseStyles(customer);

const app = createApp(App)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
    }
  }
})

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

const keycloakOptions: KeycloakInitOptions = {
  onLoad: (appConfig?.keycloakOptions?.checkSso === 'false')
    ? undefined
    : 'check-sso',
  silentCheckSsoRedirectUri: (appConfig?.keycloakOptions?.checkSso === 'false')
    ? undefined
    : `${location.origin}/silent-check-sso.html`,
  checkLoginIframe: (appConfig?.keycloakOptions?.checkLoginIframe === 'false')
    ? false
    : true,
  messageReceiveTimeout: appConfig?.keycloakOptions?.timeout
    ? parseInt(appConfig.keycloakOptions.timeout)
    : 10000
}

const piniaAuthStore = useAuthStore()
piniaAuthStore.init(keycloakOptions).then(() => {
  app.use(userConfigShimPlugin)
  const vuexStore = createStore({
    modules: {
      auth: authStore,
      dpiStore,
      snackbar: snackbarStore,
    },
  })
  app.use(vuexStore)

  const browserLocale = navigator.language.split('-')[0]
  const fallbackLocale = appConfig.languages.fallbackLocale || 'en'
  app.use(FormKitPlugin, defaultConfig({
    ...config,
    locales: { de, en, cs },
    locale: browserLocale || fallbackLocale,
  }))

  app.use(router)

  app.use(VueQueryPlugin, { queryClient })
  app.use(piveauSdkPlugin, { queryClient })
  app.use(PrimeVue, {
    unstyled: true,
    pt: KDW,
  })
  app.directive('tooltip', Tooltip);

  app.use(i18n, {
    allowComposition: true,
    globalInjection: true,
  })

  registerComponents(app)

  app.mount('#app')
},
  (err) => console.error('failed to load app', err)
)
