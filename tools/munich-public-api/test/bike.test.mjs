import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { parseCsv, parseSites, initBikeTables, ingestRows, summary, dataThrough, traffic, buildSitesResponse } from '../src/adapters/bike.mjs'

const fx = f => readFileSync(new URL(`./fixtures/${f}`, import.meta.url), 'utf8')

test('DST: spring-forward skips 4 non-existent slots, fall-back keeps 96 distinct instants', () => {
  const { rows, skipped } = parseCsv(fx('bike-dst-days.csv'))
  const spring = rows.filter(r => r.ts.startsWith('2026-03-2'))
  const autumn = rows.filter(r => r.ts.startsWith('2025-10-2'))
  assert.equal(skipped, 4)
  assert.equal(spring.length, 92)
  assert.equal(new Set(autumn.map(r => r.ts)).size, 96)
  assert.equal(spring[0].ts, '2026-03-28T23:00:00.000Z') // local 00:00 CET
})

test('sites come from WFS lat/lon properties, not the projected geometry', () => {
  const sites = parseSites(JSON.parse(fx('bike-wfs.json')))
  assert.equal(sites.length, 6)
  const a = sites.find(s => s.siteId === 'Arnulf')
  assert.deepEqual([a.lat, a.lon], [48.14205, 11.55534])
})

function seeded() {
  const db = new DatabaseSync(':memory:')
  initBikeTables(db)
  ingestRows(db, parseCsv(fx('bike-2026-09-two-sites.csv')).rows)
  return db
}

test('anchors to the last complete day and aggregates 7d hourly with previous week', () => {
  const db = seeded()
  const through = dataThrough(summary(db).lastTs)
  assert.equal(through, '2026-09-30')
  const t = traffic(db, { period: '7d', through })
  assert.equal(t.bucket, 'hour')
  assert.equal(t.chart.length, 168)
  assert.deepEqual([t.current.from, t.current.to, t.previous.from, t.previous.to], ['2026-09-24', '2026-09-30', '2026-09-17', '2026-09-23'])
  assert.equal(t.chart.reduce((a, b) => a + b.count, 0), t.current.count)
  assert.equal(t.completeness, 1)
  assert.equal(typeof t.changePercent, 'number')
  assert.equal(t.sites.length, 2)
})

test('30d: previous window outside ingested data gives changePercent null', () => {
  const db = seeded()
  const t = traffic(db, { period: '30d', through: '2026-09-30' })
  assert.equal(t.bucket, 'day')
  assert.equal(t.chart.length, 30)
  assert.equal(t.chart[0].bucket, '2026-09-01')
  assert.equal(t.previous.count, 0)
  assert.equal(t.changePercent, null)
})

test('single-site filter and unknown period fallback', () => {
  const db = seeded()
  const t = traffic(db, { period: 'xyz', siteId: 'arnulf', through: '2026-09-30', sitesMeta: [{ siteId: 'Arnulf', name: 'Arnulfstr.' }] })
  assert.equal(t.period, '7d')
  assert.deepEqual(t.sites.map(s => s.siteId), ['Arnulf'])
})

test('sites response marks counters without data as inactive', () => {
  const db = seeded()
  const r = buildSitesResponse(parseSites(JSON.parse(fx('bike-wfs.json'))), summary(db).bySite, { retrievedAt: 't', stale: false })
  assert.equal(r.sites.filter(s => s.active).length, 2)
  assert.equal(r.sites.find(s => s.siteId === 'Margareten').lastData, null)
})
