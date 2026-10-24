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

import { computed } from 'vue'
import { useCssVar } from '@vueuse/core'
import appConfig from '@config/appConfig.js'
import { useAuthStore, type AuthStoreUser } from '@/stores/authStore.js'


export function useAdminCards() {
    const userMgmtIcon = useCssVar('--user-management-icon')
    const realmMgmtIcon = useCssVar('--realm-management-icon')
    const alertsIcon = useCssVar('--civora-alerts-icon')
    const connectorsIcon = useCssVar('--civora-connectors-icon')
    const airflowIcon = useCssVar('--civora-airflow-icon')
    const matomoIcon = useCssVar('--civora-matomo-icon')
    const thingsboardIcon = useCssVar('--civora-thingsboard-icon')

    const allAdminCards = computed(() => [
        {
            id: 'user-management',
            key: '/Administrator',
            textKey: 'administrator',
            link: appConfig?.keycloakUrl ? `${appConfig.keycloakUrl}/admin/${appConfig.keycloakRealm}/console` : '',
            icon: userMgmtIcon.value,
            translationKey: 'admin-tools.user-management',
            canAccess: (user: AuthStoreUser) => user.groupMemberships.includes('/Administrator'),
        },
        {
            id: 'realm-management',
            key: '/Super-Administrator',
            textKey: 'super-administrator',
            link: appConfig?.keycloakUrl ? `${appConfig.keycloakUrl}/admin/${appConfig.keycloakRealm}/console` : '',
            icon: realmMgmtIcon.value,
            translationKey: 'admin-tools.realm-management',
            canAccess: (user: AuthStoreUser) => user.groupMemberships.includes('/Super-Administrator'),
        },
        {
            id: 'civora-alerts',
            key: '/Civora Alerts',
            textKey: 'alerts',
            link: appConfig?.alertsUrl,
            icon: alertsIcon.value,
            translationKey: 'admin-tools.alerts',
            canAccess: (user: AuthStoreUser) => user.groupMemberships.some(group => group.startsWith('/Civora Alerts/')),
        },
        {
            id: 'civora-connectors',
            key: '/Civora Connectors',
            textKey: 'connectors',
            link: appConfig?.connectorsUrl,
            icon: connectorsIcon.value,
            translationKey: 'admin-tools.connectors',
            canAccess: (user: AuthStoreUser) => user.groupMemberships.some(group => group.startsWith('/Civora Connectors/')),
        },
        {
            id: 'civora-airflow',
            key: '/Airflow',
            textKey: 'airflow',
            link: appConfig?.airflowUrl,
            icon: airflowIcon.value,
            translationKey: 'admin-tools.airflow',
            canAccess: (user: AuthStoreUser) => user.groupMemberships.some(group => group.startsWith('/Airflow/')),
        },
        {
            id: 'civora-matomo',
            key: '/Matomo',
            textKey: 'matomo',
            link: appConfig?.matomoUrl,
            icon: matomoIcon.value,
            translationKey: 'admin-tools.matomo',
            canAccess: (user: AuthStoreUser) => user.groupMemberships.some(group => group.startsWith('/Matomo/')),
        },
        {
            id: 'thingsboard',
            key: '/Asset Management IoT',
            textKey: 'thingsboard',
            link: appConfig?.thingsboardUrl,
            icon: thingsboardIcon.value,
            translationKey: 'admin-tools.thingsboard',
            canAccess: (user: AuthStoreUser) => [
                '/Administrator',
                '/Super-Administrator',
                '/Asset Management IoT/Asset Management IoT Admin',
            ].some(group => user.groupMemberships.includes(group)),
        }
    ])

    const authStore = useAuthStore()
    const adminCards = computed(() => allAdminCards.value
        .filter(({ link, canAccess }) =>
            !!link
            && canAccess(authStore.user))
        )
    return adminCards
}
