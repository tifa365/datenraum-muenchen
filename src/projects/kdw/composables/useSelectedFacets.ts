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

import { useDatasetsSearch } from '../sdk/index'

export function useSelectedFacets() {
  const { refSyncedWithRouteQueryFacet } = useDatasetsSearch()

  return {
    is_soft_data: refSyncedWithRouteQueryFacet('is_soft_data', [] as string[]),
    is_hvd: refSyncedWithRouteQueryFacet('is_hvd', [] as string[]),
    periodicity: refSyncedWithRouteQueryFacet('periodicity', [] as string[]),
    categories: refSyncedWithRouteQueryFacet('categories', [] as string[]),
    publisher: refSyncedWithRouteQueryFacet('publisher', [] as string[]),
    format: refSyncedWithRouteQueryFacet('format', [] as string[]),
    license: refSyncedWithRouteQueryFacet('license', [] as string[]),
    catalog: refSyncedWithRouteQueryFacet('catalog', [] as string[]),
  }
}
