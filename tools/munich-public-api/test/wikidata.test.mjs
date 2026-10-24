import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseCityInfo, pickClaim, buildCityInfoResponse } from '../src/adapters/wikidata.mjs'

const fx = JSON.parse(readFileSync(new URL('./fixtures/wikidata-Q1726.json', import.meta.url), 'utf8'))

test('picks the preferred, latest population and the km2 area', () => {
  assert.deepEqual(parseCityInfo(fx), {
    city: 'München', population: 1505036, populationDate: '2025-12-31', areaKm2: 310.71, source: 'Wikidata Q1726',
  })
})

test('falls back to the most recent normal-rank claim when none is preferred', () => {
  const claims = fx.entities.Q1726.claims.P1082.map(c => ({ ...c, rank: 'normal' }))
  assert.equal(Number(pickClaim(claims).mainsnak.datavalue.value.amount), 1505036)
})

test('ignores deprecated claims', () => {
  const claims = fx.entities.Q1726.claims.P1082.map(c => (c.rank === 'preferred' ? { ...c, rank: 'deprecated' } : c))
  assert.equal(Number(pickClaim(claims).mainsnak.datavalue.value.amount), 1505005)
})

test('response carries the CC0 header image with its small rendition', () => {
  const r = buildCityInfoResponse(parseCityInfo(fx), { retrievedAt: 't', stale: false })
  assert.equal(r.image.width, 1280)
  assert.match(r.image.url, /1280px-Munich_Marienplatz_Town_Hall_Virgin_Mary\.jpg$/)
  assert.equal(r.image.licence.id, 'CC0-1.0')
})
