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

import { test, expect } from './integration.setup'
import type { Page } from '@playwright/test'

/**
 * End-to-end coverage of the cookie-consent stack (CIVCookieConsentManager,
 * CIVCookieConsentBanner, CIVCookieConsentDialog and useTarteAuCitron) against
 * the real tarteaucitron engine: banner rendering in "banner" mode, granting
 * consent via the personalize toggle, persistence across reloads and
 * revoking consent again, all driven purely through the UI.
 */

// DataNotices is the only route rendering CIVCookieConsentManager in "banner" mode (see App.vue).
const DATA_NOTICES_PATH = '/app/data-notices'
// Set by config.dev.js's trackingEmbedCode once the usageAnalytics service is allowed.
const TRACKING_COOKIES = ['TAC_TEST', 'TAC_ANALYTICS']

async function getCookieNames(page: Page) {
  const cookies = await page.context().cookies()
  return cookies.map((cookie) => cookie.name)
}

test('cookie consent: dialog', async ({ page }) => {
  await page.goto('/app/home')

  const dialog = page.locator('.cookie-consent-dialog')

  await test.step('dialog is shown on first visit with accept/reject all, customize, and privacy-policy buttons, until choice is made', async () => {
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Accept all' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Reject all' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Customize' })).toBeVisible()
    await expect(dialog.getByRole('link', { name: 'Privacy policy' })).toBeVisible()

    await page.goto('/app/data-catalog')

    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Accept all' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Reject all' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Customize' })).toBeVisible()
    await expect(dialog.getByRole('link', { name: 'Privacy policy' })).toBeVisible()
  })

  await test.step('dialog is hidden and banner is shown when navigating to data privacy', async () => {
    await dialog.getByRole('link', { name: 'Privacy policy' }).click()

    await expect(dialog).toBeHidden()
    await expect(page.getByRole('region', { name: 'Cookie consent' })).toBeVisible()
  })

  await test.step('dialog is shown again when navigating back to home', async () => {
    await page.goto('/app/home')

    await expect(dialog).toBeVisible()
    await expect(page.getByRole('region', { name: 'Cookie consent' })).toBeHidden()
  })

  await test.step('customize opens the personalize view with usage analytics toggle', async () => {
    await dialog.getByRole('button', { name: 'Customize' }).click()

    await expect(dialog.getByRole('switch', { name: 'Usage analytics' })).toBeVisible()
    await expect(dialog.getByRole('switch', { name: 'Usage analytics' })).toHaveAttribute('aria-checked', 'false')
    await expect(dialog.getByRole('button', { name: 'Accept all' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Reject all' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Customize' })).not.toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeVisible()
  })

  await test.step('accepting usage analytics injects the tracking script and sets its cookies', async () => {
    await dialog.getByRole('switch', { name: 'Usage analytics' }).click()
    await dialog.getByRole('button', { name: 'Close' }).click()

    await expect(dialog).toBeHidden()
    await expect(page.locator('script[data-testid="usage-analytics-tracking-node-1"]')).toHaveCount(1)
    await expect.poll(() => getCookieNames(page)).toEqual(expect.arrayContaining(TRACKING_COOKIES))
  })

  await test.step('consent is persisted across reloads without re-prompting', async () => {
    await page.reload()

    await expect(dialog).toBeHidden()
    await expect(page.locator('script[data-testid="usage-analytics-tracking-node-1"]')).toHaveCount(1)
    await expect.poll(() => getCookieNames(page)).toEqual(expect.arrayContaining(TRACKING_COOKIES))
  })

  await test.step('dialog is not shown when navigating after decision has been made', async () => {
    await page.goto('/app/home')
    await expect(dialog).toBeHidden()
    await page.goto('/app/data-catalog')
    await expect(dialog).toBeHidden()
  })

  await test.step('banner is not shown when navigating after decision has been made', async () => {
    await page.goto('/app/data-notices')
    await expect(page.getByRole('region', { name: 'Cookie consent' })).toBeHidden()
  })

  await test.step('cookie settings can be reopened and the usage analytics toggle is still on', async () => {
    await page.getByRole('button', { name: 'Cookie settings' }).click()

    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('switch', { name: 'Usage analytics' })).toHaveAttribute('aria-checked', 'true')
  })

  await test.step('revoking usage analytics consent reloads the page on dialog close, removes the tracking script and its cookies', async () => {
    await dialog.getByRole('switch', { name: 'Usage analytics' }).click()
    await Promise.all([
      page.waitForEvent('load'),
      dialog.getByRole('button', { name: 'Close' }).click()
    ])

    await expect(dialog).toBeHidden()
    await expect(page.locator('script[data-testid="usage-analytics-tracking-node-1"]')).toHaveCount(0)
    await expect.poll(() => getCookieNames(page)).not.toEqual(expect.arrayContaining(TRACKING_COOKIES))
  })

  await test.step('reopening the dialog shows the usage analytics toggle off again', async () => {
    await page.getByRole('button', { name: 'Cookie settings' }).click()

    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('switch', { name: 'Usage analytics' })).toHaveAttribute('aria-checked', 'false')
  })

  await test.step('accepting all injects the tracking script and sets its cookies', async () => {
    await dialog.getByRole('button', { name: 'Accept all' }).click()

    await expect(dialog).toBeHidden()
    await expect(page.locator('script[data-testid="usage-analytics-tracking-node-1"]')).toHaveCount(1)
    await expect.poll(() => getCookieNames(page)).toEqual(expect.arrayContaining(TRACKING_COOKIES))
  })

  await test.step('rejecting all removes the tracking script and its cookies', async () => {
    await page.getByRole('button', { name: 'Cookie settings' }).click()
    await Promise.all([
      page.waitForEvent('load'),
      dialog.getByRole('button', { name: 'Reject all' }).click()
    ])

    await expect(dialog).toBeHidden()
    await expect(page.locator('script[data-testid="usage-analytics-tracking-node-1"]')).toHaveCount(0)
    await expect.poll(() => getCookieNames(page)).not.toEqual(expect.arrayContaining(TRACKING_COOKIES))
  })
})

test('cookie consent: banner', async ({ page }) => {
  await page.goto(DATA_NOTICES_PATH)

  const banner = page.getByRole('region', { name: 'Cookie consent' })

  await test.step('banner is shown on data-notice page if not decided yet with accept/reject all, and customize buttons', async () => {
    await expect(banner).toBeVisible()
    await expect(banner.getByRole('button', { name: 'Accept all' })).toBeVisible()
    await expect(banner.getByRole('button', { name: 'Reject all' })).toBeVisible()
    await expect(banner.getByRole('button', { name: 'Manage preferences' })).toBeVisible()
    await expect(banner.getByRole('link', { name: 'Privacy policy' })).not.toBeVisible()
  })

  await test.step('customize opens the personalize view with usage analytics toggle', async () => {
    await banner.getByRole('button', { name: 'Manage preferences' }).click()

    const dialog = page.locator('.cookie-consent-dialog')

    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('switch', { name: 'Usage analytics' })).toBeVisible()
    await expect(dialog.getByRole('switch', { name: 'Usage analytics' })).toHaveAttribute('aria-checked', 'false')
    await expect(dialog.getByRole('button', { name: 'Accept all' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Reject all' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Manage preferences' })).not.toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeVisible()
  })

  await test.step('closing the dialog without explicit selection does not show the banner again, keeps the usage analytics toggle off and does not inject the tracking script or set its cookies', async () => {
    const dialog = page.locator('.cookie-consent-dialog')
    await dialog.getByRole('button', { name: 'Close' }).click()

    await expect(dialog).toBeHidden()
    await expect(page.getByRole('region', { name: 'Cookie consent' })).toBeHidden()
    await expect(page.locator('script[data-testid="usage-analytics-tracking-node-1"]')).toHaveCount(0)
    await expect.poll(() => getCookieNames(page)).not.toEqual(expect.arrayContaining(TRACKING_COOKIES))

    await page.getByRole('button', { name: 'Cookie settings' }).click()
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('switch', { name: 'Usage analytics' })).toHaveAttribute('aria-checked', 'false')
  })
  
  await test.step('navigating to another page and back does not show the banner again', async () => {
    await page.goto('/app/home')
    await expect(page.getByRole('region', { name: 'Cookie consent' })).toBeHidden()

    await page.goto(DATA_NOTICES_PATH)
    await expect(page.getByRole('region', { name: 'Cookie consent' })).toBeHidden()
  })

  await test.step('navigating to another page does not show the dialog after closing it', async () => {
    await page.goto('/app/home')
    await expect(page.locator('.cookie-consent-dialog')).toBeHidden()
  })
})