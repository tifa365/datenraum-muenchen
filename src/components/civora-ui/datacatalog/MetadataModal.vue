<!--
  ~ This file is part of Civora UI.
  ~
  ~ Copyright (C) 2025 DKSR GmbH.
  ~
  ~ Civora UI is free software: you can redistribute it and/or modify
  ~ it under the terms of the GNU Affero General Public License as published by
  ~ the Free Software Foundation, version 3.
  ~
  ~ This program is distributed in the hope that it will be useful,
  ~ but WITHOUT ANY WARRANTY; without even the implied warranty of
  ~ MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  ~ GNU Affero General Public License for more details.
  ~
  ~ You should have received a copy of the GNU Affero General Public License
  ~ along with this program. If not, see <https://www.gnu.org/licenses/>.
-->

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import DynamicOverlay from '@/projects/kdw/components/DynamicOverlay.vue'
import CIVIcon from '../CIVIcon.vue'
import CIVTag from '../CIVTag.vue'
import CIVMetadataTimeInfoCard from './CIVMetadataTimeInfoCard.vue'
import CIVMetadata from './CIVMetadata.vue'
import { getTranslationFor } from '@/projects/kdw/sdk/utils/helpers'
import { formatTemporalValue } from '@/utils/formatTemporalValue'
import { resolveMetadataQualityMaxScore } from '@/utils/metadataQualityScore'
import appConfig from '@config/appConfig'

const { locale, t, te } = useI18n()

const isOpen = defineModel<boolean>()
const props = defineProps<{
  metadata: any
}>()

const metadataQualityMaxScore = resolveMetadataQualityMaxScore(
  appConfig.customer?.modules?.dataCatalog?.metadataQualityMaxScore
)

const onClose = () => {
  isOpen.value = false
}

// Type detection utilities
const isDateString = (value: any): boolean => {
  if (typeof value !== 'string') return false
  const date = new Date(value)
  return (
    !isNaN(date.getTime()) && (value.includes('-') || value.includes('/') || value.includes('T')) && value.length >= 8
  )
}

const isEmail = (value: string): boolean => {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.replace('mailto:', ''))
}

const isPhoneNumber = (value: string): boolean => {
  return typeof value === 'string' && /^[\d\s+()-]+$/.test(value) && value.replace(/\D/g, '').length >= 7
}

const isURL = (value: string): boolean => {
  return (
    typeof value === 'string' &&
    (value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('www.') ||
      /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(value))
  )
}

const isCoordinate = (value: any): boolean => {
  return (
    typeof value === 'object' &&
    value !== null &&
    (('lat' in value && 'lon' in value) ||
      ('latitude' in value && 'longitude' in value) ||
      ('x' in value && 'y' in value))
  )
}

const formatCoordinates = (spatial: any): string => {
  if (!spatial || !spatial.coordinates) return ''

  if (spatial.type === 'Polygon' && Array.isArray(spatial.coordinates)) {
    // For polygon, show all coordinates
    const coords = spatial.coordinates[0] // Get outer ring
    if (!coords || coords.length === 0) return ''

    return coords.map((coord: number[]) => `${coord[1].toFixed(4)}°N, ${coord[0].toFixed(4)}°E`).join(' | ')
  }

  if (spatial.type === 'Point' && Array.isArray(spatial.coordinates)) {
    // For point, show single coordinate
    const [lon, lat] = spatial.coordinates
    return `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`
  }

  return JSON.stringify(spatial.coordinates)
}

const formatDate = (dateString: string): string => {
  return formatTemporalValue(dateString, { locale: locale.value, fallback: '/' })
}

const getLocalizedText = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ''

  return getTranslationFor(value as Record<string, string>, locale.value) || ''
}

const translateMetadataValue = (key: string, value: string): string => {
  const normalizedKey = key
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
  const normalizedValue = value.toLowerCase().split('/').filter(Boolean).pop()

  if (!normalizedValue) return value

  const valueGroups: Record<string, string> = {
    access_level: 'accessLevelValues',
    access_right: 'accessRightValues',
    publication_status: 'publicationStatusValues',
  }
  const valueGroup = valueGroups[normalizedKey]

  if (!valueGroup) return value

  const translationKey = `datasetDetails.metadataModal.${valueGroup}.${normalizedValue}`
  if (!te(translationKey)) return value

  const translated = t(translationKey)

  return translated
}

const translateKey = (key: string): string => {
  // Convert key to snake_case for lookup
  const snakeKey = key
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')

  // Try to get translation from i18n
  const translationKey = `datasetDetails.metadataModal.${snakeKey}`
  const translated = t(translationKey)

  // If translation exists and is different from the key, use it
  if (translated && translated !== translationKey) {
    return translated
  }

  // Fallback to humanized key
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim()
}

const getIcon = (key: string, value: any): string | undefined => {
  const lowerKey = key.toLowerCase()

  if (lowerKey.includes('email') || lowerKey.includes('contact') || lowerKey.includes('publisher')) {
    return '/src/assets/icons/Email.svg'
  }
  if (
    lowerKey.includes('date') ||
    lowerKey.includes('time') ||
    lowerKey.includes('issued') ||
    lowerKey.includes('modified')
  ) {
    return '/src/assets/icons/calendar.svg'
  }
  if (
    lowerKey.includes('geo') ||
    lowerKey.includes('location') ||
    lowerKey.includes('country') ||
    lowerKey.includes('region')
  ) {
    return '/src/assets/icons/LeisureCard.svg'
  }
  if (
    lowerKey.includes('category') ||
    lowerKey.includes('theme') ||
    lowerKey.includes('topic') ||
    lowerKey.includes('tag') ||
    lowerKey.includes('keyword')
  ) {
    return '/src/assets/icons/label.svg'
  }
  if (lowerKey.includes('website') || lowerKey.includes('homepage') || lowerKey.includes('url')) {
    return '/src/assets/icons/globe_icon_2.svg'
  }

  return undefined
}

const shouldExcludeKey = (key: string): boolean => {
  const lowerKey = key.toLowerCase().replace(/[_\s]/g, '')
  const excludedKeys = ['id', 'title', 'identifier', 'description', 'translationmeta']

  return excludedKeys.includes(lowerKey)
}

const processValue = (value: any, parentKey: string = ''): any => {
  if (value === null || value === undefined) {
    return { type: 'text', value: '/' }
  }

  // Handle objects with label/title properties
  if (typeof value === 'object' && !Array.isArray(value)) {
    if (value.label) {
      // If it's already a string, use it. If it's an object, translate it.
      const labelValue = getLocalizedText(value.label)

      return {
        type: 'text',
        value: labelValue ? translateMetadataValue(parentKey, labelValue) : '/',
      }
    }
    if (value.title) {
      //SDK helper for localized titles
      const title = getTranslationFor(value.title, locale.value)
      return { type: 'text', value: title || '/' }
    }
    if (value.name) {
      return { type: 'text', value: value.name }
    }
    if (isCoordinate(value)) {
      const lat = value.lat || value.latitude
      const lon = value.lon || value.longitude
      return { type: 'text', value: `${lat}, ${lon}` }
    }

    // Handle nested objects recursively
    const entries = Object.entries(value).filter(
      ([k, v]) =>
        v !== null &&
        v !== undefined &&
        v !== '' &&
        !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) &&
        !(Array.isArray(v) && v.length === 0)
    )

    if (entries.length > 0) {
      return {
        type: 'nested',
        entries: entries.map(([k, v]) => ({
          rawKey: k,
          key: translateKey(k),
          ...processValue(v, k),
        })),
      }
    }

    return { type: 'text', value: '/' }
  }

  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) return { type: 'tags', values: ['/'] }

    const processedValues = value
      .map((item) => {
        if (typeof item === 'string') return translateMetadataValue(parentKey, item)
        if (typeof item === 'object' && item !== null) {
          // Check for label/title/name inside array items
          const labelTarget = item.label || item.title
          if (labelTarget) {
            const label = getLocalizedText(labelTarget)
            return label ? translateMetadataValue(parentKey, label) : ''
          }
          if (item.name) return item.name
          if (item.id && Object.keys(item).length === 1) return item.id
        }
        return null
      })
      .filter((val) => val !== null && val !== '')

    return { type: 'tags', values: processedValues.length > 0 ? processedValues : ['/'] }
  }

  // Handle strings (Dates, Emails, URLs, etc.)
  if (typeof value === 'string') {
    if (value.trim() === '') return { type: 'text', value: '/' }

    if (isDateString(value)) {
      return { type: 'date', value: formatDate(value) }
    }
    if (isEmail(value)) {
      const cleanEmail = value.replace('mailto:', '')
      return {
        type: 'link',
        value: cleanEmail,
        link: value.startsWith('mailto:') ? value : `mailto:${cleanEmail}`,
        icon: '/src/assets/icons/Email.svg',
      }
    }
    if (isPhoneNumber(value)) {
      return {
        type: 'link',
        value: value,
        link: `tel:${value.replace(/\s/g, '')}`,
      }
    }
    if (isURL(value)) {
      return {
        type: 'link',
        value: value,
        link: value.startsWith('http') ? value : `https://${value}`,
        icon: '/src/assets/icons/globe_icon_2.svg',
      }
    }

    return { type: 'text', value: translateMetadataValue(parentKey, value) }
  }

  return { type: 'text', value: String(value) }
}

// Helper function to format address object
const formatAddress = (address: any): string => {
  if (!address || typeof address !== 'object') return ''

  const parts: string[] = []
  if (address.street) parts.push(address.street)
  if (address.locality) parts.push(address.locality)
  if (address.postalCode) parts.push(address.postalCode)

  return parts.join(', ')
}

const formatAgentType = (type: string): string => {
  return (
    type
      .split('/')
      .pop()
      ?.replace(/([A-Z])/g, ' $1')
      .trim() || type
  )
}

const pushAgentDetails = (list: any[], agent: any) => {
  if (!agent) return

  if (typeof agent === 'string') {
    list.push({ text: agent })
    return
  }

  if (typeof agent !== 'object') return

  if (agent.type) {
    list.push({ text: `${t('datasetDetails.metadataModal.type')}: ${formatAgentType(agent.type)}` })
  }

  if (agent.name) {
    list.push({ text: agent.name })
  }

  if (agent.email) {
    const cleanEmail = agent.email.replace('mailto:', '')
    list.push({
      text: cleanEmail,
      link: agent.email.startsWith('mailto:') ? agent.email : `mailto:${cleanEmail}`,
      icon: '/src/assets/icons/Email.svg',
    })
  }

  if (agent.homepage) {
    list.push({
      label: t('datasetDetails.metadataModal.website'),
      text: agent.homepage,
      link: agent.homepage,
      icon: '/src/assets/icons/globe_icon_2.svg',
    })
  }

  if (agent.resource) {
    list.push({
      label: t('datasetDetails.metadataModal.resourceIdentifier'),
      text: agent.resource,
      link: agent.resource,
      icon: '/src/assets/icons/globe_icon_2.svg',
    })
  }

  if (agent.address) {
    const addressText = formatAddress(agent.address)
    if (addressText) {
      list.push({ text: `${t('datasetDetails.metadataModal.address')}: ${addressText}` })
    }
  }

  if (agent.publishertype) {
    list.push({ text: `${t('datasetDetails.metadataModal.publishertype')}: ${agent.publishertype}` })
  }
}

const metadataItems = computed(() => {
  if (!props.metadata || typeof props.metadata !== 'object') {
    return []
  }

  const items: any[] = []
  const processedKeys = new Set<string>()

  const createAgentHandler = (key: string) => () => {
    processedKeys.add(key)
    const agentValue = props.metadata?.[key]
    if (!agentValue) return null

    const agents = Array.isArray(agentValue) ? agentValue : [agentValue]
    const list: any[] = []

    agents.forEach((agent) => pushAgentDetails(list, agent))

    return {
      title: t(`datasetDetails.metadataModal.${key}`),
      icon: '/src/assets/icons/Email.svg',
      list: list.length > 0 ? list : [{ text: '/' }],
    }
  }

  // -------------------------------------------------------------------------
  // KNOWN FIELDS HANDLERS
  // -------------------------------------------------------------------------
  const knownFieldsHandlers: Record<string, () => any> = {
    // Publisher follows the agent definition.
    publisher: () => {
      processedKeys.add('publisher')
      const publisher = props.metadata?.publisher
      if (!publisher) return null

      const list: any[] = []
      pushAgentDetails(list, publisher)

      return {
        title: t('datasetDetails.metadataModal.publisher'),
        icon: '/src/assets/icons/Email.svg',
        list: list.length > 0 ? list : [{ text: '/' }],
      }
    },

    creator: createAgentHandler('creator'),
    contributor: createAgentHandler('contributor'),
    maintainer: createAgentHandler('maintainer'),
    originator: createAgentHandler('originator'),

    // Contact Point now includes all fields
    contact_point: () => {
      processedKeys.add('contact_point')
      const contacts = props.metadata?.contact_point
      if (!Array.isArray(contacts) || contacts.length === 0) return null

      const list: any[] = []

      contacts.forEach((contact) => {
        // Add organization name
        if (contact.name) {
          list.push({ text: contact.name })
        }

        // Add address
        if (contact.address) {
          list.push({ text: `${t('datasetDetails.metadataModal.address')}: ${contact.address}` })
        }

        // Add email
        if (contact.email) {
          const cleanEmail = contact.email.replace('mailto:', '')
          list.push({ text: cleanEmail, link: contact.email, icon: '/src/assets/icons/Email.svg' })
        }

        // Add phone number (if it exists as a separate field or within address)
        if (contact.phone || contact.telephone) {
          const phone = contact.phone || contact.telephone
          list.push({ text: phone, link: `tel:${phone.replace(/\s/g, '')}` })
        }

        // Add URLs
        if (contact.url) {
          const urls = Array.isArray(contact.url) ? contact.url : [contact.url]
          urls.forEach((url) => {
            if (url) {
              list.push({ text: url, link: url, icon: '/src/assets/icons/globe_icon_2.svg' })
            }
          })
        }
      })

      return {
        title: t('datasetDetails.metadataModal.contact_point'),
        icon: '/src/assets/icons/Email.svg',
        list: list.length > 0 ? list : [{ text: '/' }],
      }
    },

    temporal: () => {
      processedKeys.add('temporal')
      const temporal = props.metadata?.temporal
      if (!Array.isArray(temporal) || temporal.length === 0) return null

      const timeItems: any[] = []

      temporal.forEach((period) => {
        if (period.gte) {
          timeItems.push({
            text: t('datasetDetails.metadataModal.start'),
            date: formatDate(period.gte),
          })
        }
        if (period.lte) {
          timeItems.push({
            text: t('datasetDetails.metadataModal.end'),
            date: formatDate(period.lte),
          })
        }
      })

      return {
        title: t('datasetDetails.metadataModal.temporalCoverage'),
        icon: '/src/assets/icons/calendar.svg',
        items: timeItems.length > 0 ? timeItems : undefined,
      }
    },

    issued: () => {
      processedKeys.add('issued')
      processedKeys.add('modified')

      const issued = props.metadata?.issued
      const modified = props.metadata?.modified

      if (!issued && !modified) return null

      const timeItems: any[] = []

      if (issued) {
        timeItems.push({
          text: t('datasetDetails.metadataModal.issued'),
          date: formatDate(issued),
        })
      }
      if (modified) {
        timeItems.push({
          text: t('datasetDetails.metadataModal.modified'),
          date: formatDate(modified),
        })
      }

      return {
        title: t('datasetDetails.metadataModal.publicationInfo'),
        icon: '/src/assets/icons/calendar.svg',
        items: timeItems,
      }
    },

    keywords: () => {
      processedKeys.add('keywords')
      const keywords = props.metadata?.keywords
      if (!Array.isArray(keywords) || keywords.length === 0) return null

      const tags = keywords
        .map((kw) => {
          if (typeof kw === 'string') return kw
          return kw.label || kw.id || ''
        })
        .filter((tag) => tag !== '')

      return {
        title: t('datasetDetails.metadataModal.keywords'),
        icon: '/src/assets/icons/label.svg',
        tags: tags.length > 0 ? tags : ['/'],
      }
    },

    categories: () => {
      processedKeys.add('categories')
      const categories = props.metadata?.categories
      if (!Array.isArray(categories) || categories.length === 0) return null

      const tags = categories
        .map((cat) => {
          if (typeof cat === 'string') return cat
          const label = cat.label ? getTranslationFor(cat.label, locale.value) : null
          return label || cat.id || ''
        })
        .filter((tag) => tag !== '')

      return {
        title: t('datasetDetails.metadataModal.categories'),
        icon: '/src/assets/icons/label.svg',
        tags: tags.length > 0 ? tags : ['/'],
      }
    },

    catalog: () => {
      processedKeys.add('catalog')
      const catalog = props.metadata?.catalog
      if (!catalog) return null

      const catalogTitle = getTranslationFor(catalog.title, locale.value) || catalog.id || '/'

      return [
        {
          title: t('datasetDetails.metadataModal.catalog'),
          icon: '/src/assets/icons/label.svg',
          list: [{ text: catalogTitle }],
        },
      ]
    },

    // Spatial coverage now shows actual coordinate information
    country: () => {
      processedKeys.add('country')
      processedKeys.add('political_geocoding_level_uri')
      processedKeys.add('spatial')
      processedKeys.add('spatial_resource')

      const geoList: any[] = []

      // Check for country labels and resource links. Labels can either be
      // localized objects or plain strings, depending on the source catalog.
      const countries = Array.isArray(props.metadata?.country)
        ? props.metadata.country
        : props.metadata?.country
          ? [props.metadata.country]
          : []

      countries.forEach((country: any) => {
        if (typeof country === 'string') {
          geoList.push({ text: country })
          return
        }

        const countryLabel = getLocalizedText(country?.label)
        if (countryLabel) {
          geoList.push({ text: countryLabel })
        }

        if (country?.resource) {
          geoList.push({
            text: country.resource,
            link: country.resource,
            icon: '/src/assets/icons/globe_icon_2.svg',
          })
        }
      })

      // Check for spatial resources
      if (props.metadata?.spatial_resource?.length > 0 && Array.isArray(props.metadata.spatial_resource)) {
        props.metadata.spatial_resource.forEach((level: any) => {
          const label = typeof level.label === 'string' ? level.label : getTranslationFor(level.label, locale.value)

          if (label) {
            geoList.push({
              text: `${t('datasetDetails.metadataModal.spatial_resource')}: ${label}`,
            })
          }

          if (level.resource) {
            geoList.push({
              text: level.resource,
              link: level.resource,
              icon: '/src/assets/icons/globe_icon_2.svg',
            })
          }
        })
      }

      // Check for political geocoding level
      if (props.metadata?.political_geocoding_level_uri?.length > 0) {
        props.metadata.political_geocoding_level_uri.forEach((level: any) => {
          const label = typeof level.label === 'string' ? level.label : getTranslationFor(level.label, locale.value)

          if (label) {
            geoList.push({
              text: `${t('datasetDetails.metadataModal.political_geocoding_level_uri')}: ${label}`,
            })
          }

          if (level.resource) {
            geoList.push({
              text: level.resource,
              link: level.resource,
              icon: '/src/assets/icons/globe_icon_2.svg',
            })
          }
        })
      }

      // shows coordinate information from spatial array
      if (Array.isArray(props.metadata?.spatial) && props.metadata.spatial.length > 0) {
        props.metadata.spatial.forEach((s) => {
          if (typeof s === 'string') {
            geoList.push({ text: s })
            return
          }

          const spatialLabel = getLocalizedText(s?.label)
          if (spatialLabel) {
            geoList.push({ text: spatialLabel })
          }

          if (s.resource) {
            geoList.push({
              text: s.resource,
              link: s.resource,
              icon: '/src/assets/icons/globe_icon_2.svg',
            })
          }

          if (s.type) {
            geoList.push({ text: `${t('datasetDetails.metadataModal.type')}: ${s.type}` })
          }

          // Add formatted coordinates
          const coordsText = formatCoordinates(s)
          if (coordsText) {
            geoList.push({ text: coordsText })
          }
        })
      }

      return {
        title: t('datasetDetails.metadataModal.spatial'),
        icon: '/src/assets/icons/LeisureCard.svg',
        list: geoList.length > 0 ? geoList : [{ text: '/' }],
      }
    },

    // Ignored / Handled elsewhere
    modified: () => null,
    political_geocoding_level_uri: () => null,
    spatial: () => null,
    spatial_resource: () => null,
    title: () => {
      processedKeys.add('title')
      return null
    },
    is_hvd: () => {
      processedKeys.add('is_hvd')
      processedKeys.add('hvd_category')
      return null
    },
    resource: () => {
      processedKeys.add('resource')
      return null
    },
    language: () => {
      processedKeys.add('language')
      return null
    },
  }

  // -------------------------------------------------------------------------
  // ORDER DEFINITION
  // -------------------------------------------------------------------------
  const knownFieldsOrder = [
    'publisher',
    'creator',
    'contributor',
    'maintainer',
    'originator',
    'contact_point',
    'keywords',
    'temporal', // Temporal Coverage (Start/End)
    'issued', // Publication Dates (Issued/Modified)
    'categories',
    'catalog',
    'country',
    'is_hvd',
  ]

  // Process known fields in order
  knownFieldsOrder.forEach((key) => {
    const handler = knownFieldsHandlers[key]
    if (handler) {
      const result = handler()
      if (result) {
        if (Array.isArray(result)) {
          items.push(...result)
        } else {
          items.push(result)
        }
      }
    }
  })

  // -------------------------------------------------------------------------
  // DYNAMIC FALLBACK FOR UNKNOWN FIELDS
  // -------------------------------------------------------------------------
  Object.keys(props.metadata).forEach((key) => {
    if (processedKeys.has(key) || shouldExcludeKey(key)) return

    const value = props.metadata[key]

    // Basic validation
    if (value === null || value === undefined) return
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return
    if (Array.isArray(value) && value.length === 0) return
    if (typeof value === 'string' && value.trim() === '') return

    const processed = processValue(value, key)
    const icon = getIcon(key, value)

    if (processed.type === 'tags') {
      items.push({
        title: translateKey(key),
        icon,
        tags: processed.values,
      })
    } else if (processed.type === 'nested') {
      const list = processed.entries.map((entry: any) => {
        if (entry.type === 'link') {
          return { text: entry.value, link: entry.link, icon: entry.icon }
        }
        if (key === 'quality_meas' && entry.rawKey === 'scoring') {
          return {
            text: t('datasetDetails.metadataModal.metadataQualityScoring', {
              score: entry.value,
              total: metadataQualityMaxScore,
            }),
          }
        }
        return { text: `${entry.key}: ${entry.value}` }
      })

      const explanationKey = 'datasetDetails.metadataModal.metadataQualityExplanation'
      if (
        key === 'quality_meas' &&
        processed.entries.some((entry: any) => entry.rawKey === 'scoring') &&
        te(explanationKey)
      ) {
        list.push({
          markdown: t(explanationKey),
        })
      }

      items.push({ title: translateKey(key), icon, list })
    } else if (processed.type === 'date') {
      items.push({
        title: translateKey(key),
        icon: icon || '/src/assets/icons/calendar.svg',
        items: [{ text: translateKey(key), date: processed.value }],
      })
    } else if (processed.type === 'link') {
      items.push({
        title: translateKey(key),
        icon: processed.icon || icon,
        list: [{ text: processed.value, link: processed.link, icon: processed.icon }],
      })
    } else {
      items.push({ title: translateKey(key), icon, list: [{ text: processed.value }] })
    }
  })

  return items
})

const isHvd = computed(() => props.metadata?.is_hvd)
const displayTitle = computed(() => {
  return getTranslationFor(props.metadata?.title, locale.value) || '/'
})

const hvdCategories = computed(() => {
  const categories = props.metadata?.hvd_category

  if (!Array.isArray(categories) || categories.length === 0) {
    return []
  }

  return categories.map((cat) => {
    const translation = getTranslationFor(cat.label, locale.value)
    return {
      label: translation || cat.id,
      resource: cat.resource,
    }
  })
})

const hvdTranslationParts = computed(() => {
  const fullTranslation = t('datasetDetails.metadataModal.hvdCategoryInfo', { categories: '{PLACEHOLDER}' })
  const parts = fullTranslation.split('{PLACEHOLDER}')
  return {
    before: parts[0] || '',
    after: parts[1] || '',
  }
})
</script>

<template>
  <Teleport to="body">
    <DynamicOverlay
      v-if="isOpen"
      width="medium">
      <div class="metadata-modal-container">
        <div class="modal-header">
          <div class="modal-header-actions">
            <div class="header-statuses">
              <!-- <CIVTag
              :has-close-icon="false"
              :text="$t('landing-page.open-data.chip-three')"
              tone="positive" /> -->
              <CIVTag
                v-if="isHvd"
                :has-close-icon="false"
                :has-dot-icon="false"
                text="HVD"
                tone="promote" />
            </div>
            <CIVIcon
              iconUrl="/src/assets/icons/Close.svg"
              :onClick="onClose" />
          </div>
          <p class="display-sm modal-header-title">{{ displayTitle }}</p>
        </div>

        <div
          v-if="isHvd && hvdCategories.length > 0"
          class="modal-tag-container">
          <p class="body-lg modal-tag-text">
            {{ hvdTranslationParts.before }}
            <template
              v-for="(cat, index) in hvdCategories"
              :key="index">
              <a
                v-if="cat.resource"
                :href="cat.resource"
                target="_blank"
                rel="noopener noreferrer"
                class="hvd-category-link"
                >{{ cat.label }}</a
              >
              <span v-else>{{ cat.label }}</span>
              <span v-if="index < hvdCategories.length - 1">, </span>
            </template>
            {{ hvdTranslationParts.after }}
          </p>
        </div>

        <CIVMetadata
          v-for="({ title, icon, list, items, tags }, key) in metadataItems"
          :key="key"
          :title="title"
          :icon="icon"
          :list="list">
          <template
            #content
            v-if="!list">
            <template v-if="items">
              <CIVMetadataTimeInfoCard :items="items" />
            </template>
            <template v-if="tags">
              <div class="tags-container">
                <CIVTag
                  v-for="(tag, i) in tags"
                  :key="i"
                  :has-close-icon="false"
                  :has-dot-icon="false"
                  :text="tag" />
              </div>
            </template>
          </template>
        </CIVMetadata>
      </div>
    </DynamicOverlay>
  </Teleport>
</template>

<style scoped>
.metadata-modal-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.metadata-modal-container .modal-header {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.metadata-modal-container .modal-header .modal-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header .modal-header-actions .header-statuses {
  display: flex;
  gap: 8px;
  align-items: center;
}
.metadata-modal-container .modal-header .modal-header-title {
  color: var(--color-neutral-700);
}

.metadata-modal-container .modal-tag-container {
  padding: 6px;
  border-radius: 4px;
  border: 1px solid var(--color-neutral-300);
  background-color: var(--color-promote-400);
}
.metadata-modal-container .modal-tag-container .modal-tag-text {
  color: var(--color-primary-800);
}

.metadata-modal-container .tags-container {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  color: var(--color-primary-800);
}

.hvd-category-link {
  color: var(--color-primary-800);
  text-decoration: underline;
  font-weight: 500;
}

.hvd-category-link:hover {
  color: var(--color-primary-900);
}
</style>
