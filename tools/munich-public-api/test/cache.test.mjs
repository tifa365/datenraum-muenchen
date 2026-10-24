import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createSource } from '../src/cache.mjs'
import { openStore } from '../src/store.mjs'

test('loads once per TTL and serves stale on failure', async () => {
  const store = openStore(':memory:')
  let calls = 0, fail = false
  const s = createSource({ name: 't', ttlSeconds: 0, store, load: async () => { calls++; if (fail) throw new Error('down'); return { n: calls } } })
  const a = await s.get()
  assert.equal(a.payload.n, 1); assert.equal(a.stale, false)
  fail = true
  await s.refresh()
  const b = await s.get()
  assert.equal(b.payload.n, 1); assert.equal(b.stale, true)
  assert.equal(store.latest('t').payload.n, 1)
})

test('restores the last snapshot from the store after restart', async () => {
  const store = openStore(':memory:')
  store.save('r', '2026-01-01T00:00:00Z', { v: 'old' })
  const s = createSource({ name: 'r', ttlSeconds: 3600, store, load: async () => { throw new Error('down') } })
  const v = await s.get()
  assert.equal(v.payload.v, 'old')
})
