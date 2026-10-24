// /public/machmit-projects from unser.muenchen.de (CONSUL by demokratie.today).
// Project metadata is curated in projects.json; the live part is the proposal
// count, read from the phase tab label "Ideensammlung (N)" on the project page.
// The REST API (GET /api/projekt_phases/{phaseId}/proposals) would replace the
// scrape once a public_data token exists; see docs/reverse-engineering/munich/sources.md.
import { readFileSync } from 'node:fs'
import { fetchText } from '../fetch.mjs'
import { provenance } from '../provenance.mjs'

export const SOURCE = 'unser.muenchen.de'
const COUNT_RE = /js-projekt-phase-title'> *Ideensammlung *\((\d+)\)/

export function loadProjects(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

export function parseProposalsCount(html) {
  const m = html.replace(/\s+/g, ' ').match(COUNT_RE)
  if (!m) throw new Error('count label "Ideensammlung (N)" not found; markup changed?')
  return Number(m[1])
}

// Loader for the cache: one page fetch per project.
export function makeCountsLoader(projects) {
  return async () => {
    const counts = {}
    for (const p of projects) {
      try { counts[p.id] = parseProposalsCount(await fetchText(p.url, { headers: { accept: 'text/html' } })) }
      catch (e) { console.error(`[unserMuenchen] project ${p.id}: ${e.message}`); counts[p.id] = null }
    }
    return counts
  }
}

const dayDiff = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000)

export function buildMachmitResponse(projects, counts, { today, retrievedAt, stale = false, cacheSeconds }) {
  const items = projects.map(p => ({
    id: p.id,
    title: p.title,
    subtitle: p.subtitle ?? null,
    url: p.url,
    image: p.image ?? null,
    startDate: p.startDate ?? null,
    endDate: p.endDate ?? null,
    daysLeft: p.endDate ? Math.max(0, dayDiff(today, p.endDate)) : null,
    proposalsCount: counts?.[p.id] ?? null,
    status: !p.startDate || !p.endDate ? 'unknown' : today < p.startDate ? 'upcoming' : today > p.endDate ? 'ended' : 'running',
  }))
  return {
    title: 'Aktuell mitmachen',
    source: SOURCE,
    count: items.length,
    totalRunningCount: items.filter(p => p.status === 'running').length,
    projects: items,
    fetchedAt: retrievedAt,
    cacheSeconds,
    provenance: provenance({
      source: 'https://unser.muenchen.de',
      licence: { id: 'unknown', url: 'https://unser.muenchen.de/conditions', note: 'Content is not under an open-data licence; permission requested.' },
      attribution: 'Landeshauptstadt München, unser.muenchen.de',
      retrievedAt,
      stale,
      notes: 'proposalsCount is read from the public project page; project metadata is curated.',
    }),
  }
}
