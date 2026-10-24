import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseProposalsCount, buildMachmitResponse } from '../src/adapters/unserMuenchen.mjs'

const fx = f => readFileSync(new URL(`./fixtures/${f}`, import.meta.url), 'utf8')

test('parses the proposal count across line breaks', () => {
  assert.equal(parseProposalsCount(fx('unser-opendata-phase-tab.html')), 0)
  assert.equal(parseProposalsCount("<h2 class='js-projekt-phase-title'>\n  Ideensammlung\n  (42)\n</h2>"), 42)
})

test('throws when the label is missing', () => {
  assert.throws(() => parseProposalsCount('<html></html>'), /not found/)
})

test('builds the Augsburg-compatible response with Munich extensions', () => {
  const projects = [{ id: 89, title: 'T', url: 'https://x', startDate: '2026-10-26', endDate: '2026-12-06' }]
  const r = buildMachmitResponse(projects, { 89: 3 }, { today: '2026-10-24', retrievedAt: '2026-10-24T00:00:00Z', cacheSeconds: 600 })
  assert.equal(r.count, 1)
  assert.equal(r.totalRunningCount, 0)
  assert.deepEqual(
    { daysLeft: r.projects[0].daysLeft, status: r.projects[0].status, proposalsCount: r.projects[0].proposalsCount, subtitle: r.projects[0].subtitle },
    { daysLeft: 43, status: 'upcoming', proposalsCount: 3, subtitle: null })
  assert.equal(r.provenance.stale, false)
  const running = buildMachmitResponse(projects, {}, { today: '2026-11-01', retrievedAt: 'x', cacheSeconds: 600 })
  assert.equal(running.projects[0].status, 'running')
  assert.equal(running.projects[0].proposalsCount, null)
})
