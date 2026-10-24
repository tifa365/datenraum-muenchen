// /public/transport/departures from the official MVV timetable (GTFS, CC BY, MVV).
// Scheduled times only (no realtime): results carry timetabledTime = estimatedTime,
// delayMinutes null and the response says realtime: false.
//
// Ingest: the feed (~17 MB zip, 265 MB stop_times.txt) is downloaded once per feed
// version (Last-Modified) and reduced to departures at stations inside the City of
// Munich (DHID prefix de:09162:), stored in sqlite with trips, routes and calendar.
// Needs the `unzip` command (present on GitHub's ubuntu runners).
import { spawn } from 'node:child_process'
import { createWriteStream, mkdirSync } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { createInterface } from 'node:readline'
import { dirname } from 'node:path'
import { fetchOk } from '../fetch.mjs'
import { provenance } from '../provenance.mjs'
import { berlinToUtc, berlinLocal, addDays } from '../time.mjs'

export const URL_ = 'https://www.mvv-muenchen.de/fileadmin/mediapool/developer/opendata/gesamt_gtfs.zip'
export const CITY_PREFIX = 'de:09162:'

// ---------- csv ----------
export function splitCsv(line) {
  if (!line.includes('"')) return line.split(',')
  const out = []; let cur = '', q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += c }
    else if (c === '"') q = true
    else if (c === ',') { out.push(cur); cur = '' }
    else cur += c
  }
  out.push(cur); return out
}
async function* csvRows(zip, file) {
  const p = spawn('unzip', ['-p', zip, file], { stdio: ['ignore', 'pipe', 'inherit'] })
  const rl = createInterface({ input: p.stdout, crlfDelay: Infinity })
  let head = null
  for await (const raw of rl) {
    const line = head ? raw : raw.replace(/^﻿/, '')
    if (!line) continue
    const cells = splitCsv(line)
    if (!head) { head = cells; continue }
    const row = {}; for (let i = 0; i < head.length; i++) row[head[i]] = cells[i]
    yield row
  }
  const code = await new Promise(r => p.on('close', r))
  if (code !== 0) throw new Error(`unzip ${file} exited with ${code}`)
}

export const secs = t => { const [h, m, s] = t.split(':').map(Number); return h * 3600 + m * 60 + (s || 0) }
// MVV puts S-Bahn lines under route_type 0 (same as tram), so rail lines are told apart by name.
// Buses stay buses even when named after a rail line (replacement service "U3", "SEV S1").
export function vehicleType(route) {
  const t = String(route.route_type), name = String(route.route_short_name ?? '').trim()
  if (t === '3' || t === '700' || t === '715') return 'bus'
  if (/^S\s?\d/i.test(name)) return 'sbahn'
  if (/^U\s?\d/i.test(name)) return 'ubahn'
  if (t === '1' || t === '400' || t === '401') return 'ubahn'
  if (t === '0' || t === '900') return 'tram'
  if (t === '2' || t === '106' || t === '109') return 'regional-train'
  return 'other'
}

// ---------- ingest ----------
export function initTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS gtfs_meta (key TEXT PRIMARY KEY, value TEXT);
    CREATE TABLE IF NOT EXISTS gtfs_routes (route_id TEXT PRIMARY KEY, line TEXT, type TEXT, color TEXT);
    CREATE TABLE IF NOT EXISTS gtfs_trips (trip_id TEXT PRIMARY KEY, route_id TEXT, service_id TEXT, headsign TEXT, direction TEXT, origin TEXT, last_seq INTEGER);
    CREATE TABLE IF NOT EXISTS gtfs_calendar (service_id TEXT PRIMARY KEY, days TEXT, start TEXT, end TEXT);
    CREATE TABLE IF NOT EXISTS gtfs_calendar_dates (service_id TEXT, date TEXT, type INTEGER);
    CREATE TABLE IF NOT EXISTS gtfs_departures (station TEXT, stop_id TEXT, trip_id TEXT, dep INTEGER, seq INTEGER, headsign TEXT);
  `)
}

export async function ingest(db, zip, version) {
  // recreate (schema may have changed between versions); old data is replaced anyway
  for (const t of ['gtfs_routes', 'gtfs_trips', 'gtfs_calendar', 'gtfs_calendar_dates', 'gtfs_departures']) db.exec(`DROP TABLE IF EXISTS ${t}`)
  initTables(db)
  const stops = new Map() // stop_id -> { name, station }
  for await (const s of csvRows(zip, 'stops.txt')) stops.set(s.stop_id, { name: s.stop_name, station: s.parent_station || s.stop_id })
  const stationName = id => stops.get(id)?.name ?? id

  db.exec('BEGIN')
  try {
    const insR = db.prepare('INSERT INTO gtfs_routes VALUES (?, ?, ?, ?)')
    for await (const r of csvRows(zip, 'routes.txt')) insR.run(r.route_id, r.route_short_name || r.route_long_name, vehicleType(r), r.route_color || null)
    const insC = db.prepare('INSERT INTO gtfs_calendar VALUES (?, ?, ?, ?)')
    for await (const c of csvRows(zip, 'calendar.txt')) insC.run(c.service_id, [c.monday, c.tuesday, c.wednesday, c.thursday, c.friday, c.saturday, c.sunday].join(''), c.start_date, c.end_date)
    const insCD = db.prepare('INSERT INTO gtfs_calendar_dates VALUES (?, ?, ?)')
    for await (const c of csvRows(zip, 'calendar_dates.txt')) insCD.run(c.service_id, c.date, Number(c.exception_type))

    // one pass over stop_times: keep Munich departures, remember each trip's first stop (origin)
    const insD = db.prepare('INSERT INTO gtfs_departures VALUES (?, ?, ?, ?, ?, ?)')
    const first = new Map() // trip_id -> [seq, stop_id]
    const last = new Map()  // trip_id -> seq of the final stop (arrival only, not a departure)
    let kept = 0
    for await (const st of csvRows(zip, 'stop_times.txt')) {
      const seq = Number(st.stop_sequence)
      const f = first.get(st.trip_id)
      if (!f || seq < f[0]) first.set(st.trip_id, [seq, st.stop_id])
      if (!(last.get(st.trip_id) >= seq)) last.set(st.trip_id, seq)
      const station = stops.get(st.stop_id)?.station ?? st.stop_id
      if (!station.startsWith(CITY_PREFIX) || st.pickup_type === '1' || !st.departure_time) continue
      insD.run(station, st.stop_id, st.trip_id, secs(st.departure_time), seq, st.stop_headsign || null)
      kept++
    }
    const insT = db.prepare('INSERT INTO gtfs_trips VALUES (?, ?, ?, ?, ?, ?, ?)')
    for await (const t of csvRows(zip, 'trips.txt')) {
      const o = first.get(t.trip_id)
      insT.run(t.trip_id, t.route_id, t.service_id, t.trip_headsign || null, t.direction_id ?? null, o ? stationName(stops.get(o[1])?.station ?? o[1]) : null, last.get(t.trip_id) ?? null)
    }
    db.exec('CREATE INDEX gtfs_dep_station ON gtfs_departures (station, dep)')
    const meta = db.prepare('INSERT OR REPLACE INTO gtfs_meta VALUES (?, ?)')
    meta.run('version', version); meta.run('ingestedAt', new Date().toISOString()); meta.run('departures', String(kept))
    const stationNames = Object.fromEntries([...stops].filter(([id, s]) => s.station === id && id.startsWith(CITY_PREFIX)).map(([id, s]) => [id, s.name]))
    meta.run('stationNames', JSON.stringify(stationNames))
    db.exec('COMMIT')
    return { version, departures: kept }
  } catch (e) { db.exec('ROLLBACK'); throw e }
}

// Downloads and ingests only when the feed's Last-Modified differs from the ingested version.
export function makeLoader(db, zipPath) {
  initTables(db)
  return async () => {
    const res = await fetchOk(URL_, { method: 'HEAD', timeoutMs: 30000 })
    const version = res.headers.get('last-modified') ?? res.headers.get('etag') ?? 'unknown'
    const have = db.prepare("SELECT value FROM gtfs_meta WHERE key = 'version'").get()?.value
    if (have === version) return status(db)
    mkdirSync(dirname(zipPath), { recursive: true })
    const dl = await fetchOk(URL_, { timeoutMs: 300000 })
    await pipeline(Readable.fromWeb(dl.body), createWriteStream(zipPath))
    const t0 = Date.now()
    const r = await ingest(db, zipPath, version)
    console.log(`[gtfs] ingested ${r.departures} Munich departures in ${Math.round((Date.now() - t0) / 1000)} s (feed ${version})`)
    return status(db)
  }
}

export function status(db) {
  const get = k => db.prepare('SELECT value FROM gtfs_meta WHERE key = ?').get(k)?.value ?? null
  return { version: get('version'), ingestedAt: get('ingestedAt'), departures: Number(get('departures') ?? 0) }
}

// ---------- queries ----------
const ymd = date => date.replace(/-/g, '')
// GTFS times count from "noon minus 12 h" of the service day (equals local midnight except on DST days).
const serviceZero = date => Date.parse(berlinToUtc(`${date} 12:00:00`)) - 12 * 3600000

function activeServices(db, date) {
  const d = ymd(date), dow = (new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7 // Monday = 0
  const on = new Set(db.prepare('SELECT service_id, days FROM gtfs_calendar WHERE start <= ? AND end >= ?').all(d, d).filter(r => r.days[dow] === '1').map(r => r.service_id))
  for (const r of db.prepare('SELECT service_id, type FROM gtfs_calendar_dates WHERE date = ?').all(d)) (r.type === 1 ? on.add(r.service_id) : on.delete(r.service_id))
  return on
}

// Next departures at a station (parent DHID) between now and now + horizon hours.
export function departures(db, stationRef, { now = Date.now(), horizonHours = 2, limit = 60 } = {}) {
  const today = berlinLocal(now).slice(0, 10)
  const q = db.prepare(`SELECT d.stop_id, d.trip_id, d.dep, d.seq, d.headsign AS stopHeadsign, t.headsign, t.direction, t.origin, t.service_id, r.line, r.type, r.route_id
    FROM gtfs_departures d JOIN gtfs_trips t ON t.trip_id = d.trip_id JOIN gtfs_routes r ON r.route_id = t.route_id
    WHERE d.station = ? AND d.dep >= ? AND d.dep < ? AND (t.last_seq IS NULL OR d.seq < t.last_seq) ORDER BY d.dep`)
  const out = []
  for (const date of [addDays(today, -1), today, addDays(today, 1)]) {
    const zero = serviceZero(date), from = Math.floor((now - zero) / 1000), to = from + horizonHours * 3600
    if (to < 0) continue
    const active = activeServices(db, date)
    for (const r of q.all(stationRef, Math.max(0, from), to)) {
      if (!active.has(r.service_id)) continue
      const t = new Date(zero + r.dep * 1000).toISOString()
      out.push({
        id: `${r.trip_id}|${date}`, line: r.line, lineRef: r.route_id, directionCode: r.direction ?? '', type: r.type, rawType: r.type,
        origin: r.origin, destination: r.stopHeadsign || r.headsign || '', stopPointRef: r.stop_id,
        timetabledTime: t, estimatedTime: t, delayMinutes: null, realtime: false,
        minutesUntil: Math.max(0, Math.round((zero + r.dep * 1000 - now) / 60000)),
      })
    }
  }
  out.sort((a, b) => a.timetabledTime.localeCompare(b.timetabledTime))
  return out.slice(0, limit)
}

export function stationName(db, stationRef) {
  const names = JSON.parse(db.prepare("SELECT value FROM gtfs_meta WHERE key = 'stationNames'").get()?.value ?? '{}')
  return names[stationRef] ?? null
}

export function buildDeparturesResponse(db, stationRef, { now = Date.now(), horizonHours, limit, retrievedAt, stale } = {}) {
  const st = status(db)
  const results = stationRef ? departures(db, stationRef, { now, horizonHours, limit }) : []
  const feedDate = st.version && !Number.isNaN(Date.parse(st.version)) ? new Date(st.version).toISOString().slice(0, 10) : null
  return {
    updatedAt: new Date(now).toISOString(), stationRef: stationRef ?? null, stopName: stationRef ? stationName(db, stationRef) : null,
    count: results.length, results, available: true, realtime: false,
    provenance: provenance({
      source: URL_,
      licence: { id: 'CC-BY', url: 'https://www.mvv-muenchen.de/index.php?L=0&id=446', note: 'MVV states CC BY without a version.' },
      attribution: `Münchner Verkehrs- und Tarifverbund (MVV), Fahrplandaten${feedDate ? ` Stand ${feedDate}` : ''}`,
      retrievedAt: retrievedAt ?? st.ingestedAt, observedAt: null, stale: Boolean(stale),
      notes: 'Scheduled times from the MVV GTFS timetable; no realtime, delays unknown.',
    }),
  }
}
