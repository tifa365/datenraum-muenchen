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

import { useAuthStore } from '../../../stores/authStore.js'
import { computed, watch } from 'vue'
import { useStore } from 'vuex'
import appConfig from '../../../../config/appConfig.js'

/**
 * Bridges the Pinia authStore (Keycloak + RPT) with the Vuex-based DPI auth store.
 *
 * RPT acquisition is now fully owned by authStore. This composable simply watches
 * for rptToken changes and forwards the relevant auth data to the DPI via Vuex.
 */
export function useAuthToDpiBridge() {
  const dpiAuthStore = useStore()
  const authStore = useAuthStore()

  const computedAuthToken = computed(() => authStore.authToken)

  function updateUserData(payload: Object) {
    dpiAuthStore.dispatch('auth/updateUserData', payload)
  }

  // Whenever authStore resolves a new RPT, push the combined auth data to DPI
  watch(
    () => authStore.rptToken,
    (newRpt) => {
      if (newRpt) {
        updateUserData({
          authToken: computedAuthToken.value,
          rtpToken: newRpt,
          hubUrl: appConfig!.piveauHubRepoUrl as string,
        })
      }
    }
  )
}