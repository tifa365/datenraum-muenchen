// /public/parking — facility master list for Munich.
// Static source: infranode.dev (mirror of opendata.muenchen.de "Parkhäuser München",
// DL-DE-BY-2.0): name, address, lat, lon only. Known upstream errors are fixed by
// parking-overrides.json. Occupancy is not part of this source: total/occupied/free
// stay null and state is "unknown" unless an occupancy adapter fills them in.
import { readFileSync } from 'node:fs'
import { fetchJson } from '../fetch.mjs'
import { provenance, LICENCES } from '../provenance.mjs'

export const URL_ = 'https://infranode.dev/api/v1/cities/muenchen/parking'

export function slug(name) {
  return name.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function loadOverrides(file) {
  const raw = JSON.parse(readFileSync(file, 'utf8'))
  return Object.fromEntries(Object.entries(raw).filter(([k]) => !k.startsWith('_')))
}

export function parseFacilities(infranodeJson, overrides = {}) {
  const facilities = infranodeJson?.data?.payload?.facilities
  if (!Array.isArray(facilities)) throw new Error('infranode: data.payload.facilities missing')
  const seen = new Set()
  const sites = facilities.map(f => {
    const o = overrides[f.name] ?? {}
    const pick = k => (o[k] !== undefined && o[k] !== null ? o[k] : f[k])
    const id = slug(f.name)
    if (seen.has(id)) throw new Error(`duplicate parking id ${id}`)
    seen.add(id)
    return {
      id,
      name: pick('name'),
      address: pick('address') ?? null,
      lat: Number(pick('lat')),
      lon: Number(pick('lon')),
      type: /tiefgarage/i.test(f.name) ? 'undergroundGarage' : 'parkingGarage',
      total: o.total ?? null,
      corrected: Object.keys(o).some(k => !k.startsWith('_')),
    }
  })
  const unused = Object.keys(overrides).filter(n => !facilities.some(f => f.name === n))
  if (unused.length) console.warn(`[parking] overrides without matching facility: ${unused.join(', ')}`)
  return {
    sites,
    upstream: {
      licence: infranodeJson.data.license_id ?? null,
      attribution: infranodeJson.data.attribution?.text ?? null,
      retrievedAt: infranodeJson.data.retrieved_at ?? null,
    },
  }
}

export const makeLoader = overrides => async () => parseFacilities(await fetchJson(URL_), overrides)

// Image for the parking tile. CC BY-SA 4.0: the credit in `attribution` MUST be shown
// next to the image (see config/munich/assets/images/CREDITS.md).
const BASE = '/config/munich/assets/images/muenchen-parking-salvatorgarage'
export const PARKING_IMAGE = {
  localPath: `${BASE}.jpg`,
  localPath2x: `${BASE}@2x.jpg`,
  width: 600,
  height: 400,
  alt: 'Südfassade der Salvatorgarage mit Stahlgitter-Aufstockung',
  title: 'Salvatorgarage 7174 (crop)',
  author: 'Henning Schlottmann (H-stt)',
  licence: { id: 'CC-BY-SA-4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0' },
  sourcePage: 'https://commons.wikimedia.org/wiki/File:Salvatorgarage_7174.jpg',
  attributionRequired: true,
  attribution: 'Foto: Henning Schlottmann (H-stt), CC BY-SA 4.0, via Wikimedia Commons, zugeschnitten',
}

// occupancy: optional map id -> { total, free, observedAt } from an occupancy adapter
export function buildParkingResponse(data, { retrievedAt, stale, occupancy = null, occupancyProvenance = null }) {
  const results = data.sites.map(s => {
    const o = occupancy?.[s.id]
    const total = o?.total ?? s.total
    const free = o?.free ?? null
    return {
      id: s.id, name: s.name, address: s.address, type: s.type, lat: s.lat, lon: s.lon,
      state: o ? o.state : 'unknown',
      total,
      occupied: o && total != null && free != null ? total - free : null,
      free,
      timestamp: o?.observedAt ?? null,
    }
  })
  return {
    image: PARKING_IMAGE,
    updatedAt: retrievedAt,
    count: results.length,
    withOccupancy: results.filter(r => r.free != null).length,
    results,
    provenance: provenance({
      source: URL_,
      licence: LICENCES.dlDeBy2,
      attribution: data.upstream.attribution ?? 'Landeshauptstadt München',
      retrievedAt,
      stale,
      notes: 'Locations from opendata.muenchen.de via infranode.dev, with manual corrections. Occupancy only where an occupancy source is enabled.',
    }),
    ...(occupancyProvenance ? { occupancyProvenance } : {}),
  }
}
