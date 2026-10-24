import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { openArchive, sitesResponse, traffic, resolveSite } from '../src/adapters/person.mjs'
import { addDays, berlinMidnightUtc } from '../src/time.mjs'

// Builds a tiny Passantendaten archive: 2 sites, 14 days ending 2026-10-23, 100 per hour,
// one missing hour (null) at site B on the last day.
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'passanten-'))
  const db = new DatabaseSync(join(dir, 'passanten.sqlite'))
  db.exec('CREATE TABLE hourly (site_id TEXT, hour_utc TEXT, hour_local TEXT, pedestrians_count INTEGER); CREATE TABLE daily (site_id TEXT, date TEXT, pedestrians_count INTEGER)')
  const ins = db.prepare('INSERT INTO hourly VALUES (?, ?, ?, ?)'), insD = db.prepare('INSERT INTO daily VALUES (?, ?, ?)')
  db.exec('BEGIN')
  for (const site of ['1', '2']) {
    for (let d = 0; d < 60; d++) {
      const date = addDays('2026-10-23', -d)
      const from = Date.parse(berlinMidnightUtc(date)), to = Date.parse(berlinMidnightUtc(addDays(date, 1)))
      let day = 0
      for (let t = from; t < to; t += 3600000) {
        const missing = site === '2' && d === 0 && t === from
        ins.run(site, new Date(t).toISOString(), '', missing ? null : 100); if (!missing) day += 100
      }
      insD.run(site, date, day)
    }
  }
  db.exec('COMMIT')
  db.close()
  writeFileSync(join(dir, 'locations.json'), JSON.stringify({ dataThrough: '2026-10-23', sites: [
    { siteId: '1', name: 'Kaufingerstraße', directions: ['A', 'B'], firstData: '2026-08-25', lastData: '2026-10-23', granularity: 'PT1H', active: true },
    { siteId: '2', name: 'Tal (Mitte)', directions: ['C', 'D'], firstData: '2026-08-25', lastData: '2026-10-23', granularity: 'PT1H', active: true }] }))
  writeFileSync(join(dir, 'provenance.json'), JSON.stringify({ source: 'local archive', licence: { id: 'proprietary', url: null }, attribution: null, retrievedAt: '2026-10-24T00:00:00Z', dataThrough: '2026-10-23' }))
  return openArchive(dir)
}

test('sites carry the dashboard field Location', () => {
  const r = sitesResponse(fixture())
  assert.deepEqual(r.sites.map(s => s.Location), ['Kaufingerstraße', 'Tal (Mitte)'])
  assert.equal(r.provenance.licence.id, 'proprietary')
})

test('7d: hourly buckets, windows end at dataThrough, null hours skipped not zero', () => {
  const t = traffic(fixture(), { period: '7d' })
  assert.equal(t.bucket, 'hour')
  assert.deepEqual([t.current.from, t.current.to, t.previous.from, t.previous.to], ['2026-10-17', '2026-10-23', '2026-10-10', '2026-10-16'])
  assert.equal(t.chart.length, 168) // 17.–23.10. has no DST change (that is 25.10.)
  assert.equal(t.current.count, 2 * 168 * 100 - 100)
  assert.equal(t.previous.count, 2 * 168 * 100)
  assert.ok(t.completeness < 1 && t.completeness > 0.99)
  assert.equal(t.changePercent, -0.3)
})

test('30d daily, site filter by name (case-insensitive) or id, unknown site gives zero rows', () => {
  const a = fixture()
  const t = traffic(a, { period: '30d', siteName: 'kaufingerstraße' })
  assert.equal(t.bucket, 'day'); assert.equal(t.chart.length, 30); assert.deepEqual(t.sites.map(s => s.siteId), ['1'])
  assert.equal(resolveSite(a.sites, { siteId: '2' }).name, 'Tal (Mitte)')
  assert.equal(traffic(a, { siteName: 'Nirgendwo' }).current.count, 0)
})
