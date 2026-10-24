import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseFacilities, loadOverrides, slug, buildParkingResponse } from '../src/adapters/parking.mjs'

const fx = JSON.parse(readFileSync(new URL('./fixtures/infranode-parking.json', import.meta.url), 'utf8'))
const overrides = loadOverrides(new URL('../src/adapters/parking-overrides.json', import.meta.url))

test('slugs are ascii and stable', () => {
  assert.equal(slug('Parkhaus Färbergraben / Süd'), 'parkhaus-faerbergraben-sued')
  assert.equal(slug('Maximilian’s'), 'maximilian-s')
})

test('parses 72 unique facilities and applies the Salvatorplatz correction', () => {
  const { sites } = parseFacilities(fx, overrides)
  assert.equal(sites.length, 72)
  const s = sites.find(x => x.name === 'Parkgarage am Salvatorplatz')
  assert.deepEqual({ address: s.address, lat: s.lat, lon: s.lon, total: s.total, corrected: s.corrected },
    { address: 'Jungfernturmstr. 1', lat: 48.1420916615, lon: 11.5739753267, total: 452, corrected: true })
  assert.equal(sites.filter(x => x.corrected).length, 1)
})

test('without occupancy every garage is state unknown with null counts', () => {
  const r = buildParkingResponse(parseFacilities(fx, overrides), { retrievedAt: 't', stale: false })
  assert.equal(r.count, 72)
  assert.equal(r.withOccupancy, 0)
  assert.ok(r.results.every(x => x.state === 'unknown' && x.free === null && x.timestamp === null))
  assert.equal(r.image.licence.id, 'CC-BY-SA-4.0')
  assert.equal(r.image.attributionRequired, true)
  assert.match(r.image.attribution, /Henning Schlottmann.*CC BY-SA 4\.0/)
})

test('rejects a malformed upstream payload', () => {
  assert.throws(() => parseFacilities({ data: {} }), /facilities missing/)
})
