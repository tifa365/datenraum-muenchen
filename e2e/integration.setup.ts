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

import { test as base, expect } from '@playwright/test'

type IntegrationFixtures = {
  isolatedConsentState: void
}

export const test = base.extend<IntegrationFixtures>({
  isolatedConsentState: [
    async ({ context, page }, use) => {
      await context.clearCookies()

      await page.addInitScript(() => {
        window.localStorage.clear()
        window.sessionStorage.clear()
        window.localStorage.setItem('locale', 'en')
      })

      await use()
    },
    { auto: true }
  ]
})

export { expect }