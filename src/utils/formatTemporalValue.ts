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

export interface FormatTemporalValueOptions {
  locale?: string | string[]
  fallback?: string
}

const YEAR_PATTERN = /^(\d{4})$/
const YEAR_MONTH_PATTERN = /^(\d{4})-(\d{2})$/
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function createUtcDate(year: number, month: number, day: number) {
  const date = new Date(0)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCFullYear(year, month - 1, day)
  return date
}

/**
 * Formats DCAT temporal literals without inventing missing precision.
 *
 * The piveau search API exposes xsd:gYear, xsd:gYearMonth, xsd:date and
 * xsd:dateTime values as strings, so their lexical form is used to retain the
 * precision selected by the data provider.
 */
export function formatTemporalValue(
  value: unknown,
  { locale = 'de-DE', fallback = '-' }: FormatTemporalValueOptions = {},
): string {
  if (typeof value !== 'string' || !value.trim()) return fallback

  const normalizedValue = value.trim()

  if (YEAR_PATTERN.test(normalizedValue)) return normalizedValue

  const yearMonthMatch = normalizedValue.match(YEAR_MONTH_PATTERN)
  if (yearMonthMatch) {
    const year = Number(yearMonthMatch[1])
    const month = Number(yearMonthMatch[2])
    if (month < 1 || month > 12) return fallback

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'numeric',
      timeZone: 'UTC',
    }).format(createUtcDate(year, month, 1))
  }

  const dateMatch = normalizedValue.match(DATE_PATTERN)
  if (dateMatch) {
    const year = Number(dateMatch[1])
    const month = Number(dateMatch[2])
    const day = Number(dateMatch[3])
    const date = createUtcDate(year, month, day)

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return fallback
    }

    return new Intl.DateTimeFormat(locale, { timeZone: 'UTC' }).format(date)
  }

  const date = new Date(normalizedValue)
  if (Number.isNaN(date.getTime())) return fallback

  return new Intl.DateTimeFormat(locale).format(date)
}
