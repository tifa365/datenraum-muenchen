import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseStops, buildStationsResponse } from '../src/adapters/mvv.mjs'

const csv = readFileSync(new URL('./fixtures/mvv-stops.csv', import.meta.url), 'utf8')

test('keeps only Munich DHIDs and reads X as latitude', () => {
  const { stations, skipped } = parseStops(csv)
  assert.ok(stations.every(s => s.stationRef.startsWith('de:09162:')))
  const m = stations.find(s => s.stationRef === 'de:09162:2')
  assert.deepEqual([m.name, m.lat, m.lon], ['Marienplatz', 48.1364359, 11.577658])
  assert.ok(skipped.length >= 1)
})

test('swaps coordinates if the columns are ever corrected upstream', () => {
  const swapped = 'HstNummer;Name ohne Ort;Ort;Globale ID;WGS84 X;WGS84 Y\n2;Marienplatz;München;de:09162:2;11,577658;48,1364359\n'
  assert.deepEqual(parseStops(swapped).stations[0].lat, 48.1364359)
})

test('static response has no delay and says so', () => {
  const r = buildStationsResponse(parseStops(csv), { retrievedAt: 't', stale: false })
  assert.ok(r.results.every(s => s.status === 'no-data' && s.maxDelay === null))
  assert.equal(r.count, r.results.length)
  assert.deepEqual([r.image.width, r.image.height, r.image.licence.id], [600, 400, 'CC0-1.0'])
})
