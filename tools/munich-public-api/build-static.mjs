// Builds a static copy of the dashboard for GitHub Pages (or any static host).
// Starts server.mjs on a free port, fetches every API answer the page can request
// (all period/site combinations), writes them as JSON snapshots and copies the page
// and images. Usage: node build-static.mjs [outDir]   (default: ../../dist-pages)
// Env passed through to the server: PERSON_DATA_DIR (optional), USER_AGENT, DB_FILE.
// Parking occupancy test data is never included in a static build.
import { spawn } from 'node:child_process'
import http from 'node:http'
import net from 'node:net'
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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
delete env.PARKING_OCCUPANCY
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
  const save = async (path, params = {}) => {
    const data = await getJson(port, path, params)
    const file = join(out, 'api', snapshotFile(path, params))
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
  await save('/transport/stations')
  await save('/transport/departures')
  console.log('[build] bike data (first run ingests the monthly CSVs, can take minutes) ...')
  const bikeSites = await save('/bike/sites')
  const personSites = await save('/person/sites')
  for (const period of ['7d', '30d']) {
    for (const siteId of ['all', ...bikeSites.sites.filter(s => s.active !== false).map(s => s.siteId)]) await save('/bike/traffic', { period, siteId })
    for (const siteName of ['all', ...personSites.sites.map(s => s.Location)]) await save('/person/traffic', { period, siteName })
  }

  // page + images
  for (const f of ['index.html', 'dashboard.css', 'dashboard.js', 'snapshot-key.mjs']) cpSync(join(here, 'web', f), join(out, f))
  const html = readFileSync(join(here, 'web', 'dashboard.html'), 'utf8')
    .replace(/window\.__ENV__ = \{[^}]*\}/, "window.__ENV__ = { API_BASE_URL: 'api', STATIC: true }")
  if (!html.includes("STATIC: true")) throw new Error('could not switch dashboard.html to static mode')
  writeFileSync(join(out, 'dashboard.html'), html)
  cpSync(join(repo, 'config/munich/assets'), join(out, 'config/munich/assets'), { recursive: true })
  writeFileSync(join(out, '.nojekyll'), '')
  writeFileSync(join(out, 'api', '_build.json'), JSON.stringify({ builtAt: new Date().toISOString(), files, pedestrianArchive: Boolean(process.env.PERSON_DATA_DIR) }, null, 2))
  console.log(`[build] ${files} snapshots in ${Math.round((Date.now() - started) / 1000)} s -> ${out}`)
} finally {
  stop()
}
