// /public/transport/stations — static stop registry for the City of Munich.
// Source: MVV "Haltestellen Report" CSV (CC BY, MVV), filtered to DHIDs de:09162:*
// (municipality München). Static only: no vehicle types (needs a GTFS join) and
// no live delay (needs a realtime source; see source assessment, section 3).
// Note: in this CSV "WGS84 X" is latitude and "WGS84 Y" longitude.
import { fetchText } from '../fetch.mjs'
import { provenance } from '../provenance.mjs'

export const URL_ = 'https://www.mvv-muenchen.de/fileadmin/mediapool/developer/opendata/MVV_Haltestellen_Report_s26.csv'
export const CITY_PREFIX = 'de:09162:'
const inMunich = (lat, lon) => lat > 47.9 && lat < 48.35 && lon > 11.2 && lon < 11.9
const num = s => (s && s.trim() ? Number(s.replace(',', '.')) : NaN)

export function parseStops(text, prefix = CITY_PREFIX) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter(Boolean)
  const head = lines.shift().split(';')
  const ix = Object.fromEntries(head.map((h, i) => [h.trim(), i]))
  for (const k of ['Globale ID', 'Name ohne Ort', 'WGS84 X', 'WGS84 Y']) if (!(k in ix)) throw new Error(`MVV csv: column ${k} missing`)
  const stations = []
  const skipped = []
  for (const line of lines) {
    const c = line.split(';')
    const ref = c[ix['Globale ID']]?.trim()
    if (!ref?.startsWith(prefix)) continue
    let lat = num(c[ix['WGS84 X']]), lon = num(c[ix['WGS84 Y']])
    if (inMunich(lon, lat)) [lat, lon] = [lon, lat] // tolerate a future column-order fix
    if (!inMunich(lat, lon)) { skipped.push(ref); continue }
    stations.push({ id: ref, stationRef: ref, name: c[ix['Name ohne Ort']].trim(), lat, lon })
  }
  return { stations, skipped }
}

export const load = async () => parseStops(await fetchText(URL_, { timeoutMs: 60000 }))

// Image for the public-transport tile (CC0, see config/munich/assets/images/CREDITS.md).
const BASE = '/config/munich/assets/images/muenchen-transport-marienplatz-sbahn'
export const TRANSPORT_IMAGE = {
  localPath: `${BASE}.jpg`,
  localPath2x: `${BASE}@2x.jpg`,
  width: 600,
  height: 400,
  alt: 'S- und U-Bahn-Eingang Marienplatz vor dem Neuen Rathaus',
  title: 'Marienplatz (München) 2 (crop)',
  author: 'Wilfredor',
  licence: { id: 'CC0-1.0', url: 'http://creativecommons.org/publicdomain/zero/1.0/' },
  sourcePage: 'https://commons.wikimedia.org/wiki/File:Marienplatz_(M%C3%BCnchen)_2.jpg',
  attributionRequired: false,
  attribution: 'Foto: Wilfredor, CC0, via Wikimedia Commons',
}

export function buildStationsResponse(data, { retrievedAt, stale }) {
  return {
    image: TRANSPORT_IMAGE,
    updatedAt: retrievedAt,
    count: data.stations.length,
    results: data.stations.map(s => ({ ...s, status: 'no-data', maxDelay: null, types: null, updatedAt: retrievedAt })),
    skipped: data.skipped,
    provenance: provenance({
      source: URL_,
      licence: { id: 'CC-BY', url: 'https://www.mvv-muenchen.de/index.php?L=0&id=446', note: 'MVV states CC BY without a version.' },
      attribution: 'Münchner Verkehrs- und Tarifverbund (MVV)',
      retrievedAt,
      stale,
      notes: 'Static stop registry. maxDelay and types are null until a licensed realtime source and a GTFS join are added. skipped = stops without usable coordinates.',
    }),
  }
}
