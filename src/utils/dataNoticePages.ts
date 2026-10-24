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

export const supportedDataNoticePages = [
  {
    id: 'LegalNotice',
    translationKey: 'views.public.PublicDataNoticesView.legal.tabs.impressum',
  },
  {
    id: 'PrivacyPolicy',
    translationKey: 'views.public.PublicDataNoticesView.legal.tabs.datenschutz',
  },
  {
    id: 'TermsOfUse',
    translationKey: 'views.public.PublicDataNoticesView.legal.tabs.nutzungsbedingungen',
    requiresAuth: true,
  },
  {
    id: 'AccessibilityInfo',
    translationKey: 'views.public.PublicDataNoticesView.legal.tabs.barrierefreiheit',
  },
]

export const availableDataNoticeComponents =
  import.meta.glob('/config/*/components/data-notices/*.vue')

export const getDataNoticeComponentPath = (customerName: string, pageId: string) =>
  `/config/${customerName}/components/data-notices/${pageId}.vue`

export const getDataNoticeRoute = (pageId: string) => ({
  path: '/app/data-notices',
  query: { tab: pageId },
})
