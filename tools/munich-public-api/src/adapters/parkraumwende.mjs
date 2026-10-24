// Optional parking occupancy from data.parkraumwende.de (community mirror of the
// Munich Parkleitsystem, pls-muc-z.com). DEV ONLY: refreshed every 2 hours
// upstream, and republication rights for the PLS data are unconfirmed.
// Enable with PARKING_OCCUPANCY=parkraumwende.
import { readFileSync } from 'node:fs'
import { fetchJson } from '../fetch.mjs'
import { provenance, LICENCES } from '../provenance.mjs'
import { berlinToUtc } from '../time.mjs'

export const URL_ = 'https://data.parkraumwende.de/data/latest.json'
export const MAX_AGE_MINUTES = 180 // upstream cadence is 2 h; older than this counts as stale

export function loadCrosswalk(file) {
  const raw = JSON.parse(readFileSync(file, 'utf8'))
  return Object.fromEntries(Object.entries(raw).filter(([k]) => !k.startsWith('_')).map(([k, v]) => [k, v.id]))
}

// Returns { observedAt, bySite: { [siteId]: { state, total, free, observedAt } }, unmapped: [...] }
export function parseOccupancy(latest, crosswalk, { now = Date.now() } = {}) {
  if (!Array.isArray(latest?.parkhaeuser)) throw new Error('parkraumwende: parkhaeuser missing')
  const observedAt = berlinToUtc(latest.timestamp)
  const ageMin = observedAt ? (now - Date.parse(observedAt)) / 60000 : Infinity
  const bySite = {}
  const unmapped = []
  for (const g of latest.parkhaeuser) {
    const id = crosswalk[`${g.sn}/${g.ph}`]
    if (!id) { unmapped.push(`${g.sn}/${g.ph} ${g.parkhaus}`); continue }
    const valid = Number.isInteger(g.kap) && Number.isInteger(g.frei) && g.kap > 0 && g.frei >= 0 && g.frei <= g.kap
    let state = 'ok'
    if (!valid) state = 'invalid'
    else if (!g.aktiv) state = 'inactive'
    else if (ageMin > MAX_AGE_MINUTES) state = 'stale'
    const usable = state === 'ok' || state === 'stale'
    bySite[id] = { state, total: usable ? g.kap : null, free: usable ? g.frei : null, observedAt }
  }
  return { observedAt, bySite, unmapped }
}

export const makeLoader = crosswalk => async () => parseOccupancy(await fetchJson(URL_), crosswalk)

export function occupancyProvenance({ retrievedAt, stale, observedAt }) {
  return provenance({
    source: URL_,
    licence: { ...LICENCES.unknown, note: 'parkraumwende compilations are CC BY 4.0; the underlying PLS data has no confirmed licence. Not for production.' },
    attribution: 'data.parkraumwende.de, Parkleitsystem München',
    retrievedAt,
    observedAt,
    stale,
    notes: 'Upstream refresh every 2 hours. States: ok, stale (>3 h old), inactive (marked inactive upstream), invalid (free > capacity or capacity 0).',
  })
}
