// Builds a static copy of the dashboard for GitHub Pages (or any static host).
// Starts server.mjs on a free port, fetches every API answer the page can request
// (all period/site combinations), writes them as JSON snapshots and copies the page
// and images. Usage: node build-static.mjs [outDir]   (default: ../../dist-pages)
// Env passed through to the server: PERSON_DATA_DIR (optional), USER_AGENT, DB_FILE.
// Transport departures come from the MVV timetable (GTFS, ingested on first run).
// Parking occupancy: parkraumwende by default (STATIC_PARKING_OCCUPANCY=off to disable). Pedestrian data comes from
// PERSON_DATA_DIR if set, otherwise from the committed static-snapshots/person.
import { spawn } from 'node:child_process'
import http from 'node:http'
import net from 'node:net'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { snapshotFile } from './web/snapshot-key.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const out = resolve(process.argv[2] ?? join(here, '../../dist-pages'))
const repo = resolve(here, '../..')

const freePort = () => new Promise(res => { const s = net.createServer().listen(0, () => { const p = s.address().port; s.close(() => res(p)) }) })
// node:http without timeouts: the first bike request triggers a multi-minute CSV ingest.
const getJson = (port, path, params = {}) => new Promise((res, rej) => {
  const qs = new URLSearchParams(params).toString()
  http.get({ host: '127.0.0.1', port, path: `/public${path}${qs ? `?${qs}` : ''}`, headers: { accept: 'application/json' } }, r => {
    let body = ''; r.setEncoding('utf8'); r.on('data', c => { body += c })
    r.on('end', () => (r.statusCode === 200 ? res(JSON.parse(body)) : rej(new Error(`${path} ${qs}: HTTP ${r.statusCode} ${body.slice(0, 200)}`))))
  }).on('error', rej)
})

const port = await freePort()
const env = { ...process.env, PORT: String(port), NO_SCHEDULER: '1' }
// Parking occupancy from parkraumwende (community mirror of the Parkleitsystem), shown with its source.
env.PARKING_OCCUPANCY = process.env.STATIC_PARKING_OCCUPANCY ?? 'parkraumwende'
const server = spawn(process.execPath, ['--no-warnings=ExperimentalWarning', join(here, 'server.mjs')], { env, stdio: ['ignore', 'inherit', 'inherit'] })
const stop = () => { try { server.kill() } catch {} }
process.on('exit', stop)

try {
  for (let i = 0; ; i++) { // wait for the server
    try { await new Promise((res, rej) => http.get({ host: '127.0.0.1', port, path: '/dashboard.html' }, r => { r.resume(); res() }).on('error', rej)); break }
    catch { if (i > 100) throw new Error('server did not start'); await new Promise(r => setTimeout(r, 200)) }
  }

  rmSync(out, { recursive: true, force: true })
  mkdirSync(join(out, 'api'), { recursive: true })
  let files = 0
  // fileParams: the parameters the page sends (they name the file); params may add build-only ones.
  const save = async (path, params = {}, fileParams = params, shape = d => d) => {
    const data = shape(await getJson(port, path, params))
    const file = join(out, 'api', snapshotFile(path, fileParams))
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, JSON.stringify(data))
    files++
    return data
  }

  const started = Date.now()
  await save('/city-info')
  await save('/opendata')
  await save('/machmit-projects')
  await save('/parking')
  const stationList = await save('/transport/stations')
  // Timetable departures for every Munich station, next 8 h (the site is rebuilt every 6 h);
  // only the fields the tile shows are kept to keep the static files small.
  console.log(`[build] timetable departures for ${stationList.results.length} stations ...`)
  const slim = d => ({ ...d, results: (d.results ?? []).map(x => ({ line: x.line, destination: x.destination, type: x.type, directionCode: x.directionCode, estimatedTime: x.estimatedTime, delayMinutes: x.delayMinutes })) })
  for (const st of stationList.results) await save('/transport/departures', { stationRef: st.stationRef, horizon: '8', limit: '600' }, { stationRef: st.stationRef }, slim)
  console.log('[build] bike data (first run ingests the monthly CSVs, can take minutes) ...')
  const bikeSites = await save('/bike/sites')
  const personSites = await save('/person/sites')
  for (const period of ['7d', '30d']) {
    for (const siteId of ['all', ...bikeSites.sites.filter(s => s.active !== false).map(s => s.siteId)]) await save('/bike/traffic', { period, siteId })
    for (const siteName of ['all', ...personSites.sites.map(s => s.Location)]) await save('/person/traffic', { period, siteName })
  }

  // Frozen pedestrian snapshots: without a local archive, use the committed aggregates.
  const frozen = join(here, 'static-snapshots', 'person')
  if (!process.env.PERSON_DATA_DIR && existsSync(frozen)) {
    rmSync(join(out, 'api', 'person'), { recursive: true, force: true })
    cpSync(frozen, join(out, 'api', 'person'), { recursive: true })
    console.log('[build] pedestrian tile: frozen snapshots from static-snapshots/person')
  }

  // page + images
  // Cache busting: GitHub Pages lets browsers cache files for 10 min, and an old cached module
  // would request snapshot files that no longer exist. Every build gets its own ?v= on all
  // page, script and module URLs.
  const v = Date.now().toString(36)
  const rewrite = (file, pairs) => {
    let txt = readFileSync(join(here, 'web', file), 'utf8')
    for (const [a, b] of pairs) { if (!txt.includes(a)) throw new Error(`${file}: "${a}" not found`); txt = txt.split(a).join(b) }
    writeFileSync(join(out, file), txt)
  }
  cpSync(join(here, 'web', 'snapshot-key.mjs'), join(out, 'snapshot-key.mjs'))
  cpSync(join(here, 'web', 'dashboard.css'), join(out, 'dashboard.css'))
  rewrite('dashboard.js', [["from './snapshot-key.mjs'", `from './snapshot-key.mjs?v=${v}'`]])
  rewrite('index.html', [['<iframe src="dashboard.html"', `<iframe src="dashboard.html?v=${v}"`]])
  const html = readFileSync(join(here, 'web', 'dashboard.html'), 'utf8')
    .replace(/window\.__ENV__ = \{[^}]*\}/, "window.__ENV__ = { API_BASE_URL: 'api', STATIC: true }")
    .replace('href="dashboard.css"', `href="dashboard.css?v=${v}"`)
    .replace('src="dashboard.js"', `src="dashboard.js?v=${v}"`)
  if (!html.includes("STATIC: true") || !html.includes(`dashboard.js?v=${v}`)) throw new Error('could not prepare dashboard.html for the static build')
  writeFileSync(join(out, 'dashboard.html'), html)
  cpSync(join(repo, 'config/munich/assets'), join(out, 'config/munich/assets'), { recursive: true })
  writeFileSync(join(out, '.nojekyll'), '')
  writeFileSync(join(out, 'api', '_build.json'), JSON.stringify({ builtAt: new Date().toISOString(), version: v, files, parkingOccupancy: env.PARKING_OCCUPANCY, pedestrianSource: process.env.PERSON_DATA_DIR ? 'archive' : existsSync(join(here, 'static-snapshots', 'person')) ? 'frozen-snapshots' : 'placeholder' }, null, 2))
  console.log(`[build] ${files} snapshots in ${Math.round((Date.now() - started) / 1000)} s -> ${out}`)
} finally {
  stop()
}
