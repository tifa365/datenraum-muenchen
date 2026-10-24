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
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore.js'
import appConfig from '@config/appConfig'

export interface DatasetPermissions {
  canView: boolean
  canCreate: boolean
  canUpdate: boolean
  canPublish: boolean
  canDelete: boolean
}

export interface CatalogPermissions {
  canView: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

interface PermissionMap {
  organizations: Map<string, Set<string>>
  catalogs: Map<string, Set<string>>
  datasets: Map<string, Set<string>>
  global: Set<string>
}

interface ParsedPermission {
  organization?: string
  catalog?: string
  dataset?: string
  scopes: string[]
  level: 'global' | 'organization' | 'catalog' | 'dataset'
}

export interface CatalogVisibilityResource {
  id?: string
  is_part_of?: string
  has_part?: string[]
}

const ALLOW_ALL: DatasetPermissions = {
  canView: true,
  canCreate: true,
  canUpdate: true,
  canPublish: true,
  canDelete: true,
}

const DENY_ALL: DatasetPermissions = {
  canView: false,
  canCreate: false,
  canUpdate: false,
  canPublish: false,
  canDelete: false,
}

const DATASET_VIEW_SCOPES = ['dataset:view_draft', 'dataset:view_published', 'dataset:update', 'dataset:publish']
const CATALOG_VIEW_SCOPES = ['catalog:view']

/**
 * Whether access control is enabled at all.
 * Only true when config is exactly true or the string 'true'.
 */
const accessControlEnabled =
  appConfig.customer?.enableDataSetLevelAccessControl === true ||
  appConfig.customer?.enableDataSetLevelAccessControl === 'true'

/**
 * Whether rsnames use the new hierarchical format: "org/catalog" or "org/catalog/dataset".
 * When false, rsnames are treated as flat catalog IDs (legacy format: just "greenpeace").
 */
const useDatasetLevelRsNames = accessControlEnabled

export function getVisibilityFlags(accessRightVal: string) {
  const val = (accessRightVal || '').toLowerCase()
  return {
    isPublic: val === 'public' || val.endsWith('/public'),
    isConfidential:
      val === 'internal' || val.endsWith('/internal') || val === 'confidential' || val.endsWith('/confidential'),
  }
}

function parseRsName(rsname: string): ParsedPermission | null {
  if (rsname === '0_global') return { level: 'global', scopes: [] }

  // Legacy flat structure: rsname is just the catalog ID (e.g. "greenpeace")
  if (!useDatasetLevelRsNames) {
    return { catalog: rsname, scopes: [], level: 'catalog' }
  }

  // New hierarchical structure: "org", "org/catalog", or "org/catalog/dataset"
  const parts = rsname.split('/')
  if (parts.some((part) => !part)) return null
  if (parts.length === 1) return { organization: parts[0], scopes: [], level: 'organization' }
  if (parts.length === 2) return { organization: parts[0], catalog: parts[1], scopes: [], level: 'catalog' }
  if (parts.length === 3)
    return { organization: parts[0], catalog: parts[1], dataset: parts[2], scopes: [], level: 'dataset' }

  // Unsupported resource names must never grant global permissions.
  return null
}

export function usePermissions() {
  const authStore = useAuthStore()
  const { rptPermissions, authenticated } = storeToRefs(authStore)

  // Cache identity for permission-dependent results, independent of RPT refreshes
  // or the order in which Keycloak returns grants and scopes.
  const permissionsKey = computed(() =>
    JSON.stringify(
      (rptPermissions.value ?? [])
        .map(({ rsname, scopes }) => [rsname, [...scopes].sort()])
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
    )
  )

  const isAdmin = computed(
    () =>
      authStore.user?.groupMemberships.some(
        (g: string) => g === 'Administrator' || g === '/Administrator' || g === '/Piveau/Civora Piveau Administrator'
      ) ?? false
  )

  const permissionMap = computed<PermissionMap>(() => {
    const map: PermissionMap = {
      organizations: new Map(),
      catalogs: new Map(),
      datasets: new Map(),
      global: new Set(),
    }

    for (const perm of rptPermissions.value) {
      const { rsname, scopes } = perm
      const parsed = parseRsName(rsname)
      if (!parsed) continue

      if (parsed.level === 'global') {
        scopes.forEach((s) => map.global.add(s))
      } else if (parsed.level === 'organization' && parsed.organization) {
        if (!map.organizations.has(parsed.organization)) map.organizations.set(parsed.organization, new Set())
        scopes.forEach((s) => map.organizations.get(parsed.organization!)!.add(s))
      } else if (parsed.level === 'catalog' && parsed.catalog) {
        const key = useDatasetLevelRsNames ? `${parsed.organization}/${parsed.catalog}` : parsed.catalog
        if (!map.catalogs.has(key)) map.catalogs.set(key, new Set())
        scopes.forEach((s) => map.catalogs.get(key)!.add(s))
      } else if (parsed.level === 'dataset' && parsed.organization && parsed.catalog && parsed.dataset) {
        const key = `${parsed.organization}/${parsed.catalog}/${parsed.dataset}`
        if (!map.datasets.has(key)) map.datasets.set(key, new Set())
        scopes.forEach((s) => map.datasets.get(key)!.add(s))
      }
    }

    return map
  })

  function getScopesFor(datasetId: string, organization: string, catalog: string): Set<string> {
    const scopes = new Set<string>()
    permissionMap.value.global.forEach((s) => scopes.add(s))
    permissionMap.value.organizations.get(organization)?.forEach((s) => scopes.add(s))
    // Single-segment RPT resources can also identify a catalogue, including
    // a child catalogue with its own editor/publisher grants.
    permissionMap.value.organizations.get(catalog)?.forEach((s) => scopes.add(s))
    const catalogKey = useDatasetLevelRsNames ? `${organization}/${catalog}` : catalog
    permissionMap.value.catalogs.get(catalogKey)?.forEach((s) => scopes.add(s))
    // Dataset-level lookup only makes sense with the new rsname structure
    if (useDatasetLevelRsNames) {
      permissionMap.value.datasets.get(`${organization}/${catalog}/${datasetId}`)?.forEach((s) => scopes.add(s))
    }
    return scopes
  }

  function getCatalogScopes(catalog: CatalogVisibilityResource): Set<string> {
    const scopes = new Set<string>()

    permissionMap.value.global.forEach((s) => scopes.add(s))

    if (catalog.is_part_of) {
      permissionMap.value.organizations.get(catalog.is_part_of)?.forEach((s) => scopes.add(s))
    }

    if (catalog.id) {
      if (catalog.is_part_of) {
        permissionMap.value.catalogs.get(`${catalog.is_part_of}/${catalog.id}`)?.forEach((s) => scopes.add(s))
      } else {
        permissionMap.value.organizations.get(catalog.id)?.forEach((s) => scopes.add(s))
      }
    }

    return scopes
  }

  function getDatasetPermissions(datasetId: string, organization: string, catalog: string): DatasetPermissions {
    if (!accessControlEnabled) return ALLOW_ALL
    // If no RPT token yet (e.g. user not logged in), deny everything
    if (!authenticated.value) return DENY_ALL
    const scopes = Array.from(getScopesFor(datasetId, organization, catalog))
    return {
      canView: scopes.some((s) => DATASET_VIEW_SCOPES.includes(s)),
      canCreate: scopes.includes('dataset:create'),
      canUpdate: scopes.includes('dataset:update'),
      canPublish: scopes.includes('dataset:publish'),
      canDelete: scopes.includes('dataset:delete'),
    }
  }

  function getCatalogPermissions(catalog: CatalogVisibilityResource): CatalogPermissions {
    if (!accessControlEnabled) {
      return {
        canView: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true,
      }
    }

    if (!authenticated.value) {
      return {
        canView: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
      }
    }

    const scopes = getCatalogScopes(catalog)

    return {
      canView: canSeeCatalog(catalog),
      canCreate: scopes.has('catalog:create'),
      canUpdate: scopes.has('catalog:update'),
      canDelete: scopes.has('catalog:delete'),
    }
  }

  function canEditCatalog(catalog: CatalogVisibilityResource): boolean {
    return getCatalogPermissions(catalog).canUpdate
  }

  function canManageCatalog(catalog: CatalogVisibilityResource): boolean {
    const permissions = getCatalogPermissions(catalog)
    return permissions.canCreate || permissions.canUpdate
  }

  function canCreateInAnyCatalog(): boolean {
    return hasScopeInAnyCatalog('dataset:create')
  }

  function canCreateCatalog(): boolean {
    return hasScopeInAnyCatalog('catalog:create')
  }

  function hasScopeInAnyCatalog(scope: string): boolean {
    if (!accessControlEnabled) return true
    if (!authenticated.value) return false
    if (permissionMap.value.global.has(scope)) return true
    for (const scopes of permissionMap.value.organizations.values()) {
      if (scopes.has(scope)) return true
    }
    for (const scopes of permissionMap.value.catalogs.values()) {
      if (scopes.has(scope)) return true
    }
    return false
  }

  function hasScope(scope: string): boolean {
    if (!accessControlEnabled) return true
    return permissionMap.value.global.has(scope)
  }

  function hasOrganizationScope(organizationId: string, scope: string): boolean {
    if (!accessControlEnabled) {
      return true
    }
    if (permissionMap.value.global.has(scope)) {
      return true
    }
    return permissionMap.value.organizations.get(organizationId)?.has(scope) ?? false
  }

  function hasCatalogScope(catalogId: string, scope: string, partOfId?: string): boolean {
    if (!accessControlEnabled) {
      return true
    }
    if (permissionMap.value.global.has(scope)) {
      return true
    }
    if (partOfId) {
      return permissionMap.value.catalogs.get(`${partOfId}/${catalogId}`)?.has(scope) ?? false
    }

    return permissionMap.value.catalogs.get(catalogId)?.has(scope) ?? false
  }

  function canSeeCatalog(catalog: CatalogVisibilityResource): boolean {
    if (!accessControlEnabled) {
      return true
    }

    const scopes = getCatalogScopes(catalog)
    if (CATALOG_VIEW_SCOPES.some((scope) => scopes.has(scope))) {
      return true
    }

    return (
      catalog.has_part?.some((catalogId: string) => {
        const catalogKey = catalog.id ? `${catalog.id}/${catalogId}` : catalogId
        const catalogScopes = permissionMap.value.catalogs.get(catalogKey)
        return catalogScopes ? CATALOG_VIEW_SCOPES.some((scope) => catalogScopes.has(scope)) : false
      }) ?? false
    )
  }

  return {
    authenticated,
    accessControlEnabled,
    useDatasetLevelRsNames,
    isAdmin,
    permissionsKey,
    permissionMap,
    getDatasetPermissions,
    getCatalogPermissions,
    canEditCatalog,
    canManageCatalog,
    canCreateCatalog,
    canCreateInAnyCatalog,
    hasScope,
    hasOrganizationScope,
    hasCatalogScope,
    canSeeCatalog,
    getVisibilityFlags,
  }
}
