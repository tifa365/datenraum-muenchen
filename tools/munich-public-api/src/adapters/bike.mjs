// /public/bike/sites and /public/bike/traffic for Munich.
// Sites: city WFS mor_wfs:raddauerzaehlstellen (6 counters, DL-DE-BY-2.0).
// Counts: monthly 15-minute CSVs "Daten der Raddauerzählstellen München <year>"
// on opendata.muenchen.de, ingested into sqlite. Publication lags by weeks, so
// traffic windows are anchored to the last complete published day ("dataThrough"),
// not to today.
//
// CSV time semantics (verified 2026-10-24): local Berlin wall clock, always 96
// slots per day. On spring-forward days the 02:xx slots do not exist and are
// skipped; on fall-back days the repeated hour appears once and is mapped to its
// standard-time occurrence, so the summer-time occurrence is missing (null).
import { fetchJson, fetchText } from '../fetch.mjs'
import { provenance, LICENCES } from '../provenance.mjs'
import { berlinToUtc, berlinLocal, berlinDate, addDays, berlinMidnightUtc } from '../time.mjs'

export const WFS_URL = 'https://geoportal.muenchen.de/geoserver/mor_wfs/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=mor_wfs:raddauerzaehlstellen&outputFormat=application/json'
const CKAN = 'https://opendata.muenchen.de/api/3/action/package_show?id='
export const packageId = year => `daten-der-raddauerzaehlstellen-muenchen-${year}`
const SLOTS_PER_DAY = 96

// ---------- sites ----------
export function parseSites(geojson) {
  if (!Array.isArray(geojson?.features)) throw new Error('WFS: features missing')
  return geojson.features.map(f => {
    const p = f.properties
    return { siteId: p.zaehlstelle, name: p.zaehlstelle_lang ?? p.zaehlstelle, description: p.info ?? '', lat: Number(p.latitude), lon: Number(p.longitude), directions: [p.richtung_1, p.richtung_2].filter(Boolean) }
  })
}
export const loadSites = async () => parseSites(await fetchJson(WFS_URL))

// ---------- csv ----------
export function parseCsv(text) {
  const lines = text.replace(/^﻿/, '').trim().split(/\r?\n/)
  const head = lines.shift().split(',')
  const ix = Object.fromEntries(head.map((h, i) => [h.trim(), i]))
  for (const k of ['datum', 'uhrzeit_start', 'zaehlstelle', 'gesamt']) if (!(k in ix)) throw new Error(`bike csv: column ${k} missing`)
  const out = []
  let skipped = 0
  for (const line of lines) {
    const c = line.split(',')
    const local = `${c[ix.datum].replace(/\./g, '-')} ${c[ix.uhrzeit_start]}`
    const n = Number(c[ix.gesamt])
    if (!Number.isFinite(n)) { skipped++; continue }
    const ts = berlinToUtc(`${local}:00`)
    if (!ts || berlinLocal(ts) !== local) { skipped++; continue } // non-existent local time (spring forward)
    out.push({ site: c[ix.zaehlstelle].trim(), ts, count: n })
  }
  return { rows: out, skipped }
}

// ---------- store ----------
export function initBikeTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bike_counts (site TEXT NOT NULL, ts TEXT NOT NULL, count INTEGER NOT NULL, PRIMARY KEY (site, ts));
    CREATE TABLE IF NOT EXISTS bike_ingested (url TEXT PRIMARY KEY, last_modified TEXT, rows INTEGER, ingested_at TEXT);
  `)
}

export function ingestRows(db, rows) {
  const ins = db.prepare('INSERT OR REPLACE INTO bike_counts (site, ts, count) VALUES (?, ?, ?)')
  db.exec('BEGIN')
  try { for (const r of rows) ins.run(r.site, r.ts, r.count); db.exec('COMMIT') } catch (e) { db.exec('ROLLBACK'); throw e }
}

// Loader: list 15-minute resources for the configured years and ingest new or changed ones.
export function makeIngestLoader(db, { years }) {
  initBikeTables(db)
  return async () => {
    const seen = db.prepare('SELECT last_modified FROM bike_ingested WHERE url = ?')
    const mark = db.prepare('INSERT OR REPLACE INTO bike_ingested (url, last_modified, rows, ingested_at) VALUES (?, ?, ?, ?)')
    const report = { ingested: [], unchanged: 0, missingYears: [] }
    for (const year of years()) {
      let pkg
      try { pkg = (await fetchJson(CKAN + packageId(year))).result } catch { report.missingYears.push(year); continue }
      for (const r of pkg.resources.filter(r => /_15min\.csv$/i.test(r.url))) {
        const lm = r.last_modified ?? r.metadata_modified ?? r.created
        if (seen.get(r.url)?.last_modified === lm) { report.unchanged++; continue }
        const { rows, skipped } = parseCsv(await fetchText(r.url, { timeoutMs: 120000 }))
        ingestRows(db, rows)
        mark.run(r.url, lm, rows.length, new Date().toISOString())
        report.ingested.push({ file: r.url.split('/').pop(), rows: rows.length, skipped })
      }
    }
    return { ...summary(db), report }
  }
}

export function summary(db) {
  const bySite = db.prepare('SELECT site, MIN(ts) AS first, MAX(ts) AS last, COUNT(*) AS n FROM bike_counts GROUP BY site').all()
  const last = db.prepare('SELECT MAX(ts) AS last FROM bike_counts').get()?.last ?? null
  return { bySite, lastTs: last }
}

// Last local day whose final slot (23:45) is present for at least one site.
export function dataThrough(lastTs) {
  if (!lastTs) return null
  const localDay = berlinDate(lastTs)
  return berlinLocal(lastTs).endsWith('23:45') ? localDay : addDays(localDay, -1)
}

// ---------- traffic ----------
export const PERIODS = { '7d': { days: 7, bucket: 'hour' }, '30d': { days: 30, bucket: 'day' } }

export function traffic(db, { period = '7d', siteId = 'all', through, sitesMeta = [] }) {
  const p = PERIODS[period] ? period : '7d'
  const { days, bucket } = PERIODS[p]
  if (!through) return null
  const curFrom = addDays(through, -(days - 1)), prevFrom = addDays(curFrom, -days), prevTo = addDays(curFrom, -1)
  const all = siteId === 'all' || !siteId
  const site = all ? null : (sitesMeta.find(s => s.siteId.toLowerCase() === String(siteId).toLowerCase())?.siteId ?? siteId)
  const q = db.prepare(`SELECT site, ts, count FROM bike_counts WHERE ts >= ? AND ts < ? ${all ? '' : 'AND site = ?'} ORDER BY ts`)
  const range = (from, to) => q.all(...[berlinMidnightUtc(from), berlinMidnightUtc(addDays(to, 1)), ...(all ? [] : [site])])

  const cur = range(curFrom, through), prev = range(prevFrom, prevTo)
  const sitesInData = new Set(cur.map(r => r.site))
  const expected = days * SLOTS_PER_DAY * Math.max(sitesInData.size, 1)
  const sum = rows => rows.reduce((a, r) => a + r.count, 0)
  const curCount = sum(cur), prevCount = sum(prev)

  const chart = new Map()
  for (const r of cur) {
    const key = bucket === 'hour' ? `${r.ts.slice(0, 13)}:00:00.000Z` : berlinDate(r.ts)
    chart.set(key, (chart.get(key) ?? 0) + r.count)
  }
  const perSite = new Map()
  for (const r of cur) perSite.set(r.site, (perSite.get(r.site) ?? 0) + r.count)
  const nameOf = id => sitesMeta.find(s => s.siteId === id)?.name ?? id

  const completeness = cur.length / expected
  const prevCompleteness = prev.length / expected
  return {
    period: p,
    bucket,
    updatedUntil: through,
    dataThrough: through,
    lastTimestamp: cur.at(-1)?.ts ?? null,
    current: { from: curFrom, to: through, count: curCount },
    previous: { from: prevFrom, to: prevTo, count: prevCount },
    changePercent: prevCount > 0 && completeness > 0.95 && prevCompleteness > 0.95 ? Math.round(((curCount - prevCount) / prevCount) * 1000) / 10 : null,
    completeness: Math.round(completeness * 1000) / 1000,
    chart: [...chart].map(([b, count]) => ({ bucket: b, count })),
    sites: [...perSite].map(([id, count]) => ({ siteId: id, name: nameOf(id), count })),
  }
}

export function buildSitesResponse(sites, bySite, { retrievedAt, stale }) {
  const stats = Object.fromEntries((bySite ?? []).map(s => [s.site, s]))
  return {
    sites: sites.map(s => ({
      ...s,
      firstData: stats[s.siteId]?.first ?? null,
      lastData: stats[s.siteId]?.last ?? null,
      granularity: 'PT15M',
      active: Boolean(stats[s.siteId]),
    })),
    provenance: provenance({
      source: WFS_URL, licence: LICENCES.dlDeBy2, attribution: 'Landeshauptstadt München, Mobilitätsreferat', retrievedAt, stale,
      notes: 'firstData/lastData are the earliest/latest ingested observations, not the sensor installation date.',
    }),
  }
}

export function trafficProvenance({ retrievedAt, stale, through }) {
  return provenance({
    source: `${CKAN}${packageId('<year>')}`, licence: LICENCES.dlDeBy2, attribution: 'Landeshauptstadt München, Mobilitätsreferat',
    retrievedAt, observedAt: through, stale,
    notes: 'Published monthly; windows end at dataThrough, not today. changePercent is null unless both windows are >95% complete.',
  })
}
