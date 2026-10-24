import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseOccupancy, loadCrosswalk } from '../src/adapters/parkraumwende.mjs'
import { parseFacilities, loadOverrides, buildParkingResponse } from '../src/adapters/parking.mjs'
import { berlinToUtc } from '../src/time.mjs'

const fx = f => JSON.parse(readFileSync(new URL(`./fixtures/${f}`, import.meta.url), 'utf8'))
const crosswalk = loadCrosswalk(new URL('../src/adapters/parking-crosswalk.json', import.meta.url))
const latest = fx('parkraumwende-latest.json')
const fresh = Date.parse(berlinToUtc(latest.timestamp)) + 10 * 60000

test('Berlin wall clock converts to UTC across DST', () => {
  assert.equal(berlinToUtc('2026-10-24 19:02:02'), '2026-10-24T17:02:02.000Z') // CEST
  assert.equal(berlinToUtc('2026-12-24 19:02:02'), '2026-12-24T18:02:02.000Z') // CET
  assert.equal(berlinToUtc('nonsense'), null)
})

test('maps PLS garages through the crosswalk and validates counts', () => {
  const r = parseOccupancy(latest, crosswalk, { now: fresh })
  assert.equal(Object.keys(r.bySite).length, 21)
  assert.equal(r.unmapped.length, 3)
  assert.equal(r.bySite['carpark-cristal'].state, 'invalid')          // frei 428 > kap 220
  assert.equal(r.bySite['tiefgarage-hotel-ibis-city'].state, 'invalid') // kap 0
  assert.equal(r.bySite['carpark-cristal'].free, null)
  const ok = Object.values(r.bySite).filter(s => s.state === 'ok')
  assert.ok(ok.length > 0 && ok.every(s => s.free <= s.total))
})

test('old snapshots are flagged stale but keep their numbers', () => {
  const r = parseOccupancy(latest, crosswalk, { now: fresh + 5 * 3600000 })
  const s = Object.values(r.bySite).find(x => x.state === 'stale')
  assert.ok(s && s.free !== null)
})

test('occupancy merges into the parking response', () => {
  const sites = parseFacilities(fx('infranode-parking.json'), loadOverrides(new URL('../src/adapters/parking-overrides.json', import.meta.url)))
  const occ = parseOccupancy(latest, crosswalk, { now: fresh })
  const r = buildParkingResponse(sites, { retrievedAt: 't', stale: false, occupancy: occ.bySite })
  const f = r.results.find(x => x.id === 'city-parkhaus-faerbergraben')
  assert.equal(f.state, 'ok')
  assert.equal(f.occupied, f.total - f.free)
  assert.equal(f.timestamp, '2026-10-24T17:02:02.000Z')
  assert.ok(r.withOccupancy >= 1 && r.withOccupancy <= 21)
})
