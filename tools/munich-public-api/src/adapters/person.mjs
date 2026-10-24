// /public/person/sites and /public/person/traffic for Munich, served from the
// frozen pedestrian-count archive (data/passanten.sqlite).
// Copy to civora-ui tools/munich-public-api/src/adapters/person.mjs; see
// USING-IN-CIVORA.md in the archive repo.
//
// The archive ends at dataThrough (2026-10-23) and is never refreshed, so
// windows are anchored there, like bike traffic. Archive conventions: hourly
// rows are keyed by UTC hour start ("2026-10-23T22:00:00.000Z"), daily rows by
// Berlin date; a null count means "no data", never zero.
import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { provenance } from '../provenance.mjs'
import { addDays, berlinMidnightUtc } from '../time.mjs'

export const PERIODS = { '7d': { days: 7, bucket: 'hour' }, '30d': { days: 30, bucket: 'day' } }

// dir: the archive's data/ directory (env PERSON_DATA_DIR in server.mjs)
export function openArchive(dir) {
  const db = new DatabaseSync(join(dir, 'passanten.sqlite'), { readOnly: true })
  const meta = JSON.parse(readFileSync(join(dir, 'locations.json'), 'utf8'))
  const prov = JSON.parse(readFileSync(join(dir, 'provenance.json'), 'utf8'))
  return { db, sites: meta.sites, through: meta.dataThrough, prov }
}

// Dashboard shape ({ Location }) plus the Munich site fields.
export function sitesResponse({ sites, prov }) {
  return {
    sites: sites.map(s => ({
      Location: s.name, siteId: s.siteId, name: s.name, directions: s.directions,
      firstData: s.firstData, lastData: s.lastData, granularity: s.granularity, active: s.active,
    })),
    provenance: personProvenance(prov),
  }
}

// siteName (sent by the dashboard) or siteId; `all` or empty means every site.
export function resolveSite(sites, { siteName, siteId } = {}) {
  const key = String(siteName ?? siteId ?? 'all').toLowerCase()
  if (key === 'all' || key === '') return null
  return sites.find(s => s.name.toLowerCase() === key || s.siteId === key) ?? { siteId: '__none__' }
}

export function traffic({ db, sites, through, prov }, { period = '7d', siteName, siteId } = {}) {
  const p = PERIODS[period] ? period : '7d'
  const { days, bucket } = PERIODS[p]
  const curFrom = addDays(through, -(days - 1)), prevFrom = addDays(curFrom, -days), prevTo = addDays(curFrom, -1)
  const site = resolveSite(sites, { siteName, siteId })
  const filter = site ? 'AND site_id = ?' : ''
  const args = site ? [site.siteId] : []

  const range = bucket === 'hour'
    ? (from, to) => db.prepare(`SELECT site_id, hour_utc AS b, pedestrians_count AS n FROM hourly
        WHERE hour_utc >= ? AND hour_utc < ? ${filter} ORDER BY hour_utc`)
      .all(berlinMidnightUtc(from), berlinMidnightUtc(addDays(to, 1)), ...args)
    : (from, to) => db.prepare(`SELECT site_id, date AS b, pedestrians_count AS n FROM daily
        WHERE date BETWEEN ? AND ? ${filter} ORDER BY date`)
      .all(from, to, ...args)

  // expected slots: hours between local midnights (23/25 on DST days) or days, per site
  const slots = (from, to) => bucket === 'hour'
    ? (Date.parse(berlinMidnightUtc(addDays(to, 1))) - Date.parse(berlinMidnightUtc(from))) / 3600000
    : days
  const nSites = site ? 1 : sites.length
  const cur = range(curFrom, through), prev = range(prevFrom, prevTo)
  const present = rows => rows.filter(r => r.n !== null)
  const sum = rows => present(rows).reduce((a, r) => a + r.n, 0)
  const completeness = present(cur).length / (slots(curFrom, through) * nSites)
  const prevCompleteness = present(prev).length / (slots(prevFrom, prevTo) * nSites)
  const curCount = sum(cur), prevCount = sum(prev)

  const chart = new Map(), perSite = new Map()
  for (const r of present(cur)) {
    chart.set(r.b, (chart.get(r.b) ?? 0) + r.n)
    perSite.set(r.site_id, (perSite.get(r.site_id) ?? 0) + r.n)
  }
  const nameOf = id => sites.find(s => s.siteId === id)?.name ?? id
  const last = present(cur).at(-1)?.b ?? null

  return {
    period: p,
    bucket,
    updatedUntil: through,
    dataThrough: through,
    lastTimestamp: bucket === 'hour' ? last : (last && berlinMidnightUtc(last)),
    current: { from: curFrom, to: through, count: curCount },
    previous: { from: prevFrom, to: prevTo, count: prevCount },
    changePercent: prevCount > 0 && completeness > 0.95 && prevCompleteness > 0.95
      ? Math.round(((curCount - prevCount) / prevCount) * 1000) / 10 : null,
    completeness: Math.round(completeness * 1000) / 1000,
    chart: [...chart].map(([b, count]) => ({ bucket: b, count })),
    sites: [...perSite].map(([id, count]) => ({ siteId: id, name: nameOf(id), count })),
    provenance: personProvenance(prov),
  }
}

export function personProvenance(prov) {
  return provenance({
    source: prov.source, licence: prov.licence, attribution: prov.attribution,
    retrievedAt: prov.retrievedAt, observedAt: prov.dataThrough, stale: false,
    notes: 'Frozen archive; windows end at dataThrough, not today. changePercent is null unless both windows are >95% complete.',
  })
}
