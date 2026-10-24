// /public/opendata from the City of Munich CKAN (opendata.muenchen.de).
// Replaces Augsburg's three direct hub-search calls to open.bydata.de: bydata
// harvests Munich (facet catalog:["muenchen"]) but its modified dates lag CKAN
// (30-day count 0 vs 86 on 2026-10-24), so the city's own catalogue is used.
import { fetchJson } from '../fetch.mjs'
import { provenance, LICENCES } from '../provenance.mjs'

export const PORTAL = 'https://opendata.muenchen.de'
const API = `${PORTAL}/api/3/action/package_search`

// CKAN returns naive UTC timestamps ("2026-10-24T05:45:14.978651").
const utc = t => (t ? (/[zZ]|[+-]\d\d:\d\d$/.test(t) ? t : `${t}Z`) : null)

export function latestUrl(rows = 3) {
  return `${API}?${new URLSearchParams({ rows: String(rows), sort: 'metadata_modified desc' })}`
}
export function windowUrl(from, to) {
  const iso = d => d.toISOString().replace(/\.\d{3}Z$/, 'Z')
  return `${API}?${new URLSearchParams({ rows: '0', fq: `metadata_modified:[${iso(from)} TO ${iso(to)}]` })}`
}

export function parseOpenData(latestJson, windowJson, { windowDays }) {
  if (!latestJson.success || !windowJson.success) throw new Error('CKAN returned success=false')
  return {
    count: latestJson.result.count,
    modifiedInWindow: windowJson.result.count,
    windowDays,
    latest: latestJson.result.results.map(d => ({
      id: d.id,
      name: d.name,
      title: d.title,
      modified: utc(d.metadata_modified),
      created: utc(d.metadata_created),
      url: `${PORTAL}/dataset/${d.name}`,
      licence: d.license_id ?? null,
      publisher: d.organization?.title ?? null,
    })),
  }
}

export function makeLoader({ windowDays = 30, rows = 3, now = () => new Date() } = {}) {
  return async () => {
    const to = now()
    const from = new Date(to.getTime() - windowDays * 86400000)
    const [latest, win] = await Promise.all([fetchJson(latestUrl(rows)), fetchJson(windowUrl(from, to))])
    return parseOpenData(latest, win, { windowDays })
  }
}

export function buildOpenDataResponse(data, { retrievedAt, stale }) {
  return {
    ...data,
    portalUrl: PORTAL,
    fetchedAt: retrievedAt,
    provenance: provenance({
      source: API,
      licence: { ...LICENCES.dlDeBy2, note: 'Catalogue metadata; individual datasets carry their own licence.' },
      attribution: 'Landeshauptstadt München, Open Data Portal',
      retrievedAt,
      stale,
      notes: '"modified" is CKAN metadata_modified; it does not prove the data itself changed.',
    }),
  }
}
