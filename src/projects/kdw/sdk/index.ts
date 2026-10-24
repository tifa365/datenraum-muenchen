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

/**
 * Create feature project specific SDK.
 * @piveau/sdk-vue and @piveau/sdk-core provide the necessary tools
 * to create a feature project specific SDK.
 */

import { createUseResourceSearch } from '@piveau/sdk-vue'
import { SchemaDataset, schemaCatalog } from '@piveau/sdk-core'
import { toValue } from 'vue'
import { formatDatetime, getLicenseLabelShort, getLocalizedValue, getTranslationFor } from './utils/helpers.js'
import type { PropertyTableEntryNode } from '@/projects/kdw/utils/types'
import type { DistributionViewModel } from '@/projects/kdw/components/dsitribution-data-info-box/shared.js'
import appConfig from "../../../../config/appConfig";
import { useI18n } from 'vue-i18n';

interface DatasetHvd {
  is_hvd?: boolean
}

export function useDatasetsSearch() {
  const { t, locale } = useI18n(); 
  return createUseResourceSearch({
    resourceSearchOptions: {
      baseUrl: appConfig.piveauHubSearchUrl,
      index: 'dataset',
      indexDetails: 'datasets',
      schema: SchemaDataset,
      facets: ['categories', 'publisher', 'catalog', 'format', 'license', 'is_hvd', 'is_soft_data', 'periodicity'],
      locale,
    },
    getters: {
      getTitle({ title }, ctx) {
        const { locale = 'de' } = ctx || {}

        const localizedTitle = getTranslationFor(title, toValue(locale))
        return localizedTitle || title?.[toValue(locale)] || ''
      },
      getDescription({ description }, ctx) {
        const { locale = 'de' } = ctx || {}

        const localizedDescription = getTranslationFor(description, toValue(locale))
        return localizedDescription || description?.[toValue(locale)] || ''
      },
      getCategories: (dataset) => dataset.categories || [],
      getPublisher: (dataset) => dataset.publisher,
      getId: (dataset) => dataset.id,
      getDistributions: (dataset) => {
        const distributionList = dataset.distributions
        const distributionFormatIds = Array.from(
          new Set(distributionList?.map((distribution) => distribution.format?.id || ''))
        )

        return {
          list: distributionList || [],
          getFormats: distributionList?.map((distribution) => distribution.format) || [],
          getFormatsUnique: distributionFormatIds.map(
            (formatId) => distributionList?.find((distribution) => distribution.format?.id === formatId)?.format || {}
          ),
        }
      },

      getLocalizedProperties(dataset, ctx) {
        const { locale = 'de' } = ctx || {}
        return {
          title: getLocalizedValue({ obj: dataset.title, fallbackLocale: locale }),
          description: getLocalizedValue({ obj: dataset.description, fallbackLocale: locale }),
          categories: dataset.categories
            ? dataset.categories.map((category) => ({
                resource: category.resource,
                id: category.id,
                label: getLocalizedValue({ obj: category.label, fallbackLocale: locale }),
              }))
            : [],
          version_notes: getLocalizedValue({ obj: dataset.version_notes, fallbackLocale: locale }),
          issued: dataset.issued ? formatDatetime(dataset.issued) : '',
          modified: dataset.modified ? formatDatetime(dataset.modified) : '',
        }
      },

      getPropertyTable(dataset, ctx) {
        const table: PropertyTableEntryNode[] = [
          {
            type: 'node',
            id: 'formats',
            label: t('kdw.sdk.formats'),
            data: [
              {
                type: 'value',
                id: 'formatVal',
                // get unique formats
                data: [...new Set(dataset.distributions?.map((distribution) => distribution.format?.label || distribution.format?.id || distribution.format?.resource || '').filter(Boolean) || [])],
              },
            ],
          },
          {
            type: 'node',
            id: 'author',
            label: t('kdw.sdk.author'),
            data: [
              {
                type: 'value',
                id: 'authorVal',
                data: dataset?.publisher?.name || dataset?.catalog?.publisher?.name,
              },
            ],
          },
           {
            type: 'node',
            id: 'accessRight',
            label: t('datasets.access-right'),
            data: [
              {
                type: 'value',
                id: 'accessRightVal',
                data: dataset?.access_right?.label || '',
              },
            ],
          },
          {
            type: 'node',
            id: 'accessRight',
            label: t('datasets.accrual-periodicity'),
            data: [
              {
                type: 'value',
                id: 'accrualPeriodicityVal',
                data: dataset?.accrual_periodicity?.label || '',
              },
            ],
          },
          {
            type: 'node',
            id: 'isHvd',
            label: t('datasets.is_hvd'),
            data: [
              {
                type: 'value',
                id: 'isHvd',
                data: (dataset as DatasetHvd)?.is_hvd ?? false
              },
            ],
          },
          {
            type: 'node',
            id: 'createdAt',
            label: t('kdw.sdk.created-date'),
            data: [
              {
                type: 'value',
                id: 'createdAtVal',
                // dataset.issued (iso) to dd.mm.yyyy
                data: dataset.issued ? formatDatetime(dataset.issued) : '-',
              },
            ],
          },
          {
            type: 'node',
            id: 'updatedAt',
            label: t('kdw.sdk.last-update'),
            data: [
              {
                type: 'value',
                id: 'updatedAtVal',
                data: dataset.modified ? formatDatetime(dataset.modified) : '-',
              },
            ],
          },
          {
            type: 'node',
            id: 'categories',
            label: t('kdw.sdk.topics'),
            data: [
              {
                type: 'value',
                id: 'categoriesVal',
                data: dataset.categories?.map((category) => {
                  return getLocalizedValue({ obj: category.label, fallbackLocale: ctx?.locale || 'de'})
                }) || [],
              },
            ],
          },
          {
            type: 'node',
            id: 'license',
            label: t('kdw.sdk.license'),
            data: [{
              type: 'value',
              id: 'licenseVal',
              data: [...new Set(dataset.distributions?.map((d) => getLicenseLabelShort({
                label: d.license?.id || d.license?.label,
                href: d.license?.resource,
              })).filter((license) => license !== '-'))] || '-',
            }],
          }
        ]

        return table
      },
      getFormattedDistributions(dataset, ctx) {
        const { locale = 'de' } = ctx || {}
        const distributionList = dataset.distributions

        if (!distributionList || !Array.isArray(distributionList) || distributionList.length === 0) return []

        const distributions: DistributionViewModel[] = distributionList.map((d) => {
          return {
            id: d.id,
            title: getLocalizedValue({ obj: d.title, fallbackLocale: locale }),
            description: getLocalizedValue({ obj: d.description, fallbackLocale: locale }),
            format: d.format?.id || undefined,
            accessUrls: d.access_url || [],
            downloadUrls: d.download_url || [],
            compressFormat: d.compress_format,
            properties: [
              {
                type: 'node',
                id: 'updatedAt',
                label: 'Aktualisiert',
                data: [
                  {
                    type: 'value',
                    id: 'updatedAtVal',
                    data: d.modified ? formatDatetime(d.modified) : '',
                  },
                ],
              },
              // license
              ...(d.license
                ? [
                    {
                      type: 'node',
                      id: 'license',
                      label: 'Lizenz',
                      data: [
                        {
                          type: 'href',
                          id: 'licenseVal',
                          data: {
                            href: d.license?.resource || '',
                            label: d.license?.label || '',
                          },
                        },
                      ],
                    } satisfies PropertyTableEntryNode,
                  ]
                : []),
            ],
          }
        })

        return distributions
      },
    },
  })
}

export function useCatalogsSearch() {
  return createUseResourceSearch({
    resourceSearchOptions: {
      baseUrl: `/search`,
      index: 'catalog',
      indexDetails: 'datasets',
      schema: schemaCatalog,
      facets: ['country', 'superCatalog'],
    },
    getters: {
      getId: ({ id }) => id,
      getTitle: ({ title }) => title || '',
      getDescription: ({ description }) => description || '',
      getPublisher: ({ publisher }) => publisher || '',
      getCountryCode: ({ country }) => country?.id || '',
      getLocalizedProperties: (catalog, ctx) => {
        const { locale = 'de' } = ctx || {}
        return {
          title: getLocalizedValue({ obj: catalog.title, fallbackLocale: locale }),
          description: getLocalizedValue({ obj: catalog.description, fallbackLocale: locale }),
        }
      },
    },
  })
}
