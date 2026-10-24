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

import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import appConfig from '@config/appConfig'

export interface ToDpiEditModeOptions {
  /**
   * The ID of the dataset to edit
   */
  id: string;
  /**
   * The ID of the catalog the dataset belongs to
   */
  catalogId: string;
  /**
   * Whether the target dataset ID is a draft
   */
  isDraft?: boolean
}

export function useDpiUtils() {
  const router = useRouter()
  const route = useRoute()
  const store = useStore()
  const { locale, fallbackLocale } = useI18n()
  
  const computedLocale = computed<string>(() => (route.query.locale as string) || locale.value as string || fallbackLocale.value as string || 'en')
  const computedRpt = computed(() => 
    store.getters['auth/getUserData']?.rtpToken || ''
  )

  function cleanupDpi() {
    localStorage?.removeItem('dpi_duplicate')
    localStorage?.removeItem('dpi_catalogues')
    localStorage?.removeItem('dpi_editmode')
    localStorage?.removeItem('dpi_datasets')
    localStorage?.removeItem('dpi_draftmode')
  }

  /**
   * Fetches the dataset with the specified ID and navigates to DPI with pre-filled data for editing.
   * 
   * @example
   * ```ts
   * const { toEditMode } = useDpiUtils()
   * toEditMode({ id: 'kleeblatt10', catalogId: 'hof' })
   * ```
   *
   */
  function toEditMode(options: ToDpiEditModeOptions) {
    const { id, catalogId, isDraft = false } = options

    if (!computedRpt.value)
      console.warn('No rpt token found. DPI cannot be opened in edit mode.')

    cleanupDpi()

    if (isDraft)
      store.dispatch('auth/setIsDraft', true)

    localStorage?.removeItem('dpi_duplicate')

    // Route to external DPI if civoraDpiUrl is configured, otherwise use internal DPI
    if (appConfig.civoraDpiUrl) {
      router.push({
        name: 'CivoraDPI',
        query: {
          edit: 'true',
          id,
          catalog: catalogId,
          ...(isDraft && { fromDraft: 'true' })
        }
      })
    } else {
      router.push({
        name: 'DataProviderInterface-Input',
        params: { property: 'datasets' },
        query: {
          locale: computedLocale.value,
          edit: 'true',
          id,
          catalog: catalogId,
          ...(isDraft && { fromDraft: 'true' })
        }
      })
    }
  }

  return {
    toEditMode,
    cleanupDpi,
  }
}