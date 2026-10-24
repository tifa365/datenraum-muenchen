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

import { createI18n } from 'vue-i18n'
import { config } from '@vue/test-utils'

export const i18n = createI18n({
  legacy: false, 
  locale: 'de', 
  fallbackLocale: 'en',
  messages: {
    en: {
      'digital-twin': {
        title: 'Digital Twin',
        subtitle: 'The digital twin of a city offers a virtual representation of its entire ecosystem.',
        footer: 'Test footer content for the digital twin view.<br/>It can contain markdown.'
      },
      'datasetDetails': {
        'previewViews': {
          "chart-type-line-label": "Line chart with data from distribution {distributionName}",
          "chart-type-bar-label": "Bar chart with data from distribution {distributionName}",
          "chart-type-doughnut-label": "Doughnut chart with data from distribution {distributionName}",
        }
      },
      'views': {
        'civ-iframe-view': {
          'openFullscreen': 'Open Fullscreen',
          'closeFullscreen': 'Close Fullscreen'
        }
      },
      'component': {
        'dropdown-select': {
          placeholder: 'Select options...',
        },
      },
      navigation: {
        'go-back': 'Back to dashboards',
        'dashboards-context': 'Dashboards',
      },
      dashboard: {
        loading: 'Loading dashboard…',
        'export-failed': 'Export failed',
        'embedding-bad-request': 'Bad request',
        'embedding-unauthorized': 'Unauthorized',
        'embedding-forbidden': 'Forbidden',
        'embedding-not-found': 'Not found',
        'embedding-internal-error': 'Internal error',
        'embedding-unknown-error': 'Unknown error',
      },
      dashboards: {
        embed: 'Embed',
        download: 'Download',
        'export-pdf': 'Export as PDF',
        'download-image': 'Download image',
        share: 'Share',
      },
      common: {
        maximize: 'Maximize',
        minimize: 'Minimize',
      },
    },
    de: {
      'digital-twin': {
        title: 'Der digitale Zwilling',
        subtitle: 'Der digitale Zwilling einer Stadt bietet eine virtuelle Repräsentation ihres gesamten Ökosystems.',
        footer: 'Test footer Inhalt für den digitalen Zwilling.<br/>Es kann Markdown enthalten.'
      },
      'datasetDetails': {
        'previewViews': {
          "chart-type-line-label": "Liniendiagramm mit Daten der Distribution {distributionName}",
          "chart-type-bar-label": "Balkendiagramm mit Daten der Distribution {distributionName}",
          "chart-type-doughnut-label": "Ringdiagramm mit Daten der Distribution {distributionName}",
        }
      },
      'views': {
        'civ-iframe-view': {
          'openFullscreen': 'Vollbild öffnen',
          'closeFullscreen': 'Vollbild schließen'
        }
      },
      'component': {
        'dropdown-select': {
          placeholder: 'Optionen auswählen...',
        },
      },
    },
  },
})

config.global.plugins = [i18n]
