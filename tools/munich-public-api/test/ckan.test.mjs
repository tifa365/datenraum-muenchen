import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseOpenData, windowUrl } from '../src/adapters/ckan.mjs'

const fx = f => JSON.parse(readFileSync(new URL(`./fixtures/${f}`, import.meta.url), 'utf8'))

test('combines total, window count and latest datasets', () => {
  const r = parseOpenData(fx('ckan-latest3.json'), fx('ckan-30d.json'), { windowDays: 30 })
  assert.equal(r.count, 337)
  assert.equal(r.modifiedInWindow, 86)
  assert.equal(r.latest.length, 3)
  assert.equal(r.latest[0].title, 'Grundwasserpotential')
  assert.match(r.latest[0].modified, /Z$/)
  assert.equal(r.latest[0].url, 'https://opendata.muenchen.de/dataset/enp_baublock_grundwasserpotential_einteilig_25832')
})

test('builds a Solr range filter without milliseconds', () => {
  const u = new URL(windowUrl(new Date('2026-09-24T17:00:00.123Z'), new Date('2026-10-24T17:00:00Z')))
  assert.equal(u.searchParams.get('fq'), 'metadata_modified:[2026-09-24T17:00:00Z TO 2026-10-24T17:00:00Z]')
  assert.equal(u.searchParams.get('rows'), '0')
})

test('rejects unsuccessful CKAN responses', () => {
  assert.throws(() => parseOpenData({ success: false }, fx('ckan-30d.json'), { windowDays: 30 }), /success=false/)
})
