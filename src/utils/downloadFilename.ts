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

function sanitizeFilename(fileName: string | null | undefined) {
  if (!fileName) return null

  const sanitizedFileName = fileName.trim().replace(/[\\/]/g, '_')
  return sanitizedFileName || null
}

function stripWrappingQuotes(value: string) {
  const trimmedValue = value.trim()

  if (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) {
    return trimmedValue.slice(1, -1)
  }

  return trimmedValue
}

function decodeFilenameValue(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function getFilenameFromContentDisposition(contentDisposition: string | null) {
  if (!contentDisposition) return null

  const parameters = contentDisposition
    .split(/;\s*(?=(?:[^"]*"[^"]*")*[^"]*$)/)
    .slice(1)

  let fallbackFilename: string | null = null

  for (const parameter of parameters) {
    const separatorIndex = parameter.indexOf('=')
    if (separatorIndex === -1) continue

    const key = parameter.slice(0, separatorIndex).trim().toLowerCase()
    const rawValue = parameter.slice(separatorIndex + 1).trim()
    const value = stripWrappingQuotes(rawValue)

    if (key === 'filename*') {
      const encodedValueMatch = value.match(/^(?:[^']*)'(?:[^']*)'(.*)$/)
      const encodedFilename = encodedValueMatch?.[1] ?? value
      const decodedFilename = sanitizeFilename(
        decodeFilenameValue(encodedFilename).replace(/\\"/g, '"')
      )

      if (decodedFilename) {
        return decodedFilename
      }

      continue
    }

    if (key === 'filename') {
      fallbackFilename = sanitizeFilename(value.replace(/\\"/g, '"'))
    }
  }

  return fallbackFilename
}

export function getFilenameFromUrl(url: string, contentDisposition: string | null = null) {
  const filenameFromHeader = getFilenameFromContentDisposition(contentDisposition)

  if (filenameFromHeader) {
    return filenameFromHeader
  }

  try {
    const parsedUrl = new URL(url)
    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean)
    return sanitizeFilename(decodeFilenameValue(pathSegments.at(-1) || 'download')) || 'download'
  } catch {
    return 'download'
  }
}
