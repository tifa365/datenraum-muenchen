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

import appConfig from '@config/appConfig'

const oupUrl: string | undefined = appConfig.oup.url
const middlewareUrl: string | undefined = appConfig.middlewareUrl

export function isOUPUrl(url: string | null | undefined): boolean {
  return !!url && !!oupUrl && url.startsWith(oupUrl)
}

export function isMiddlewareUrl(url: string | null | undefined): boolean {
  return !!url && !!middlewareUrl && url.startsWith(middlewareUrl)
}