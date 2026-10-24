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

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import routes from '@/router/routes'
import appConfig from '@config/appConfig'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
  scrollBehavior(to, from, savedPosition) {
    // Scroll to top if navigating to a new page
    if (to.path !== from.path) return { ...savedPosition, top: 0 }
    else if (savedPosition) return savedPosition
    else return false
  },
})

// configurable entrypoint interjector
router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()
  if (
    to.path !== '/' ||
    to.path === appConfig.customer?.entryPoint ||
    appConfig.customer.landingPagePublic === 'true'
  ) {
    return
  }
  if (!authStore.authenticated && appConfig.customer?.entryPoint) {
    return { path: appConfig.customer.entryPoint }
  } else {
    return { path: '/app/home' }
  }
})

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()

  // not accessible => redirect to home
  if (to.meta?.accessible !== undefined && to.meta?.accessible === false) {
    return { path: '/app/home' }
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const canAccessFns = [...to.matched.filter((record) => record.meta.canAccess).map((record) => record.meta.canAccess)]
  const hasCanAccess = canAccessFns.length > 0

  // does not require auth => go to route
  if (!requiresAuth) {
    return true
  }

  // requires auth and not authenticated => request login
  if (requiresAuth && !authStore.authenticated) {
    await authStore.login()
    return { path: '/app/home' }
  }

  // requires auth and authenticated and no canAccess method => go to route
  if (requiresAuth && authStore.authenticated && !hasCanAccess) {
    return true
  }

  // requires auth and authenticated and canAccess method => check canAccess method
  if (requiresAuth && authStore.authenticated && hasCanAccess) {
    const canAccessResult = await Promise.all(canAccessFns.map(async (fn) => {
      if (typeof fn !== 'function') {
        console.warn('router.beforeEach: invalid canAccess parameter - not a function', to.fullPath)
        return false
      }
      return fn()
    }))
    return canAccessResult.every(Boolean) ? true : { path: '/app/home' }
  }

  // fallback, should not happen, but just in case
  console.warn('router.beforeEach: unexpected route state', { to, from })
  return false
})

router.afterEach(async (to, from, failure) => {
  if (from.fullPath === to.fullPath) {
    return
  }
  window.dispatchEvent(new Event('vue-router-navigated', {bubbles: true, cancelable: true }))
})

export const appRoute: string = location.origin + '/app'
export default router
