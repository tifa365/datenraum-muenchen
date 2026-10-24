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
import { getLicenseLabelShort } from '@/projects/kdw/sdk/utils/helpers'

export type OrganisationDatasetPublicationStatus = 'draft' | 'published'

export interface OrganisationDatasetItem {
  id: string
  catalogId: string
  organizationId?: string
  name: string | Record<string, string>
  status: OrganisationDatasetPublicationStatus
  accessRight: string
  modified: string
  url: string
  distributions: string[]
  license: string
  licenseTitle?: string
}

export function mapOrganisationDataset(
  dataset: any,
  accessControlEnabled: boolean
): OrganisationDatasetItem {
  return {
    id: dataset.id,
    catalogId: dataset.catalog?.id ?? '',
    organizationId:
      dataset.catalog?.organisation?.id ??
      dataset.catalog?.is_part_of ??
      dataset.organisation?.id,
    name: dataset.title,
    status:
      accessControlEnabled &&
      String(dataset.catalog_record?.publication_status ?? '').toLowerCase() === 'draft'
        ? 'draft'
        : 'published',
    accessRight:
      dataset.catalog_record?.access_level ??
      dataset.access_right?.resource ??
      dataset.access_right?.label ??
      '',
    modified:
      dataset.modified ??
      dataset.catalog_record?.modified ??
      dataset.catalog_record?.issued ??
      dataset.issued ??
      '',
    url: `/app/data-catalog/${dataset.id}`,
    distributions: [
      ...new Set<string>(
        dataset.distributions
          ?.map((distribution: any) => distribution.format?.label)
          .filter(Boolean) ?? []
      ),
    ],
    license:
      getLicenseLabelShort({
        label: dataset.distributions?.[0]?.license?.label,
        href: dataset.distributions?.[0]?.license?.resource,
      }) ?? '',
    licenseTitle:
      dataset.distributions?.[0]?.license?.label ||
      dataset.distributions?.[0]?.license?.resource ||
      undefined,
  }
}

export function useOrganisationDatasetItems(
  queryData: MaybeRefOrGetter<any>,
  accessControlEnabled: MaybeRefOrGetter<boolean>
) {
  return computed<OrganisationDatasetItem[]>(() =>
    (toValue(queryData)?.result?.results ?? []).map((dataset: any) =>
      mapOrganisationDataset(dataset, toValue(accessControlEnabled))
    )
  )
}
