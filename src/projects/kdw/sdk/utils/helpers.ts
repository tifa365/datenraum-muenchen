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

import { toValue, type MaybeRefOrGetter } from 'vue'
import dayjs from 'dayjs'

/**
 * Returns the representative locale from the given candidates based on the priority list.
 * If none of the locales in the priority list are found in the candidates, the first candidate is returned.
 * @returns The representative locale.
 *
 * @example
 * ```ts
 * const candidates = ['en-US', 'en-GB', 'en']
 * const preferredLocale = ['en-GB', 'en-US']
 * const representativeLocale = getRepresentativeLocaleOf({ candidates, preferredLocale })
 * console.log(representativeLocale) // 'en-GB'
 * ```
 */
export function getRepresentativeLocaleOf({
  candidates = [],
  preferredLocale = [],
}: {
  candidates: string[]
  preferredLocale?: string | string[] | null
}) {
  if (candidates.length === 0) return ''
  if (!preferredLocale || preferredLocale.length === 0) return candidates[0]

  const priorityListArray = Array.isArray(preferredLocale) ? preferredLocale : [preferredLocale]
  for (const locale of priorityListArray) {
    if (candidates.includes(locale)) return locale
  }
  return candidates[0]
}

export function getTranslationFor(obj?: Record<string, string> | null, preferredLocale?: string | string[] | null) {
  if (!obj) return ''
  const locale = getRepresentativeLocaleOf({ candidates: Object.keys(obj), preferredLocale })
  return obj[locale]
}

export function getLocalizedValue({
  obj,
  fallbackLocale,
}: {
  obj?: Record<string, string> | null
  fallbackLocale: MaybeRefOrGetter<string>
}) {
  const localizedValue = getTranslationFor(obj, toValue(fallbackLocale))
  return localizedValue || obj?.[toValue(fallbackLocale)] || ''
}

const LICENSE_VERSION_PATTERN = /^(?:v(?:ersion)?[-_.]?)?\d+(?:[._-]\d+)*$/i
const LICENSE_DOCUMENT_EXTENSION_PATTERN = /\.(?:html?|xhtml|xml|json|jsonld|rdf|ttl)$/i
const GENERIC_LICENSE_PATH_SEGMENTS = new Set(['index', 'license', 'licence', 'licenses', 'licences'])

function normalizeLicenseValue(value?: string | null) {
  const normalized = value?.trim()
  return normalized || undefined
}

function decodeUriComponentSafely(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function cleanLicensePathSegment(segment: string) {
  return decodeUriComponentSafely(segment).replace(LICENSE_DOCUMENT_EXTENSION_PATTERN, '')
}

/**
 * Derives a concise license identifier from common URI structures.
 *
 * URI fragments commonly provide compact vocabulary identifiers and take
 * precedence in this best-effort display heuristic. For path identifiers, a
 * version-only final segment is combined with its preceding segment
 * (`dl-zero-de/2.0`), while self-contained codes (`CC_BY_4_0`, `MIT`,
 * `gpl-3.0.html`) use the final segment. If the URI has no useful identifier,
 * the supplied label or complete URI is retained.
 */
export function getLicenseLabelShort({
  label,
  href,
}: {
  label?: string | null
  href?: string | null
}) {
  const normalizedLabel = normalizeLicenseValue(label)
  const normalizedHref = normalizeLicenseValue(href)
  const fallback = normalizedLabel || normalizedHref || '-'

  if (!normalizedHref) return fallback

  try {
    const url = new URL(normalizedHref)
    const fragment = decodeUriComponentSafely(url.hash.slice(1)).trim()

    if (fragment) return fragment

    const pathSegments = url.pathname
      .split('/')
      .filter(Boolean)
      .map(cleanLicensePathSegment)
      .filter(Boolean)

    const lastSegment = pathSegments.at(-1)
    if (!lastSegment || GENERIC_LICENSE_PATH_SEGMENTS.has(lastSegment.toLowerCase())) {
      return fallback
    }

    if (LICENSE_VERSION_PATTERN.test(lastSegment) && pathSegments.length > 1) {
      const precedingSegment = pathSegments.at(-2)
      if (precedingSegment && !GENERIC_LICENSE_PATH_SEGMENTS.has(precedingSegment.toLowerCase())) {
        return `${precedingSegment}/${lastSegment}`
      }
    }

    return lastSegment
  } catch {
    return fallback
  }
}

export const DATE_FORMAT = 'DD.MM.YYYY' as const

/**
 * Formats to dd.mm.yyyy format
 */
export function formatDatetime(datetime: string) {
  // Format as DD.MM.YYYY, e.g. 11.03.2024
  return dayjs(datetime).format(DATE_FORMAT)
}
