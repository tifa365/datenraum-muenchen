// Munich stand-in for the Civora Alerts "public" API.
// Contract: docs/reverse-engineering/augsburg/alerts-public-api.openapi.yaml (+ Munich extensions).
// Run: npm start   (PORT, DB_FILE, USER_AGENT env vars)
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer, HttpError } from './src/http.mjs'
import { createSource, startScheduler } from './src/cache.mjs'
import { openStore } from './src/store.mjs'
import * as unser from './src/adapters/unserMuenchen.mjs'
import * as wikidata from './src/adapters/wikidata.mjs'
import * as ckan from './src/adapters/ckan.mjs'
import * as parking from './src/adapters/parking.mjs'
import * as parkraumwende from './src/adapters/parkraumwende.mjs'
import * as bike from './src/adapters/bike.mjs'
import * as mvv from './src/adapters/mvv.mjs'
import * as person from './src/adapters/person.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 8080)
const store = openStore(process.env.DB_FILE ?? join(here, 'data', 'snapshots.sqlite'))
const today = () => new Date().toISOString().slice(0, 10)

// --- sources ---------------------------------------------------------------
const projects = unser.loadProjects(join(here, 'src/adapters/unserMuenchen.projects.json'))
const proposalCounts = createSource({ name: 'unser-muenchen-counts', ttlSeconds: 600, store, load: unser.makeCountsLoader(projects) })

const cityInfo = createSource({ name: 'wikidata-city-info', ttlSeconds: 86400, store, load: wikidata.load })
const openData = createSource({ name: 'ckan-opendata', ttlSeconds: 3600, store, load: ckan.makeLoader() })
const parkingOverrides = parking.loadOverrides(join(here, 'src/adapters/parking-overrides.json'))
const parkingSites = createSource({ name: 'infranode-parking', ttlSeconds: 86400, store, load: parking.makeLoader(parkingOverrides) })
// Dev-only occupancy (rights unconfirmed): PARKING_OCCUPANCY=parkraumwende
const parkingOccupancy = process.env.PARKING_OCCUPANCY === 'parkraumwende'
  ? createSource({ name: 'parkraumwende-occupancy', ttlSeconds: 900, store, load: parkraumwende.makeLoader(parkraumwende.loadCrosswalk(join(here, 'src/adapters/parking-crosswalk.json'))) })
  : null
const bikeSites = createSource({ name: 'bike-wfs-sites', ttlSeconds: 86400, store, load: bike.loadSites })
// Ingests the current and previous year's monthly 15-minute CSVs into sqlite (only new/changed files).
const bikeIngest = createSource({ name: 'bike-csv-ingest', ttlSeconds: 21600, store, load: bike.makeIngestLoader(store.db, { years: () => { const y = new Date().getUTCFullYear(); return [y - 1, y] } }) })
const stations = createSource({ name: 'mvv-stations', ttlSeconds: 7 * 86400, store, load: mvv.load })

const sources = [proposalCounts, cityInfo, openData, parkingSites, parkingOccupancy, bikeSites, bikeIngest, stations].filter(Boolean)

// --- routes ----------------------------------------------------------------
// Placeholders until a realtime transport source exists and while no Passantendaten archive is configured:
// same envelope as the real endpoints, `available: false`, nothing invented.
// Passantendaten: frozen local archive (PERSON_DATA_DIR = the archive's data/ folder), read-only, never refreshed.
// Not in git (proprietary data). Without PERSON_DATA_DIR the tile shows its "folgt" placeholder.
const personArchive = process.env.PERSON_DATA_DIR ? person.openArchive(process.env.PERSON_DATA_DIR) : null
if (personArchive) console.log(`pedestrian archive: ${personArchive.sites.length} sites through ${personArchive.through}`)

const PEDESTRIAN_SITES = ['Kaufingerstraße', 'Maximilianstraße', 'Neuhauser Straße Ost', 'Neuhauser Straße West', 'Schützenstraße', 'Sendlinger Straße', 'Tal', 'Theatinerstraße']
const placeholder = (source, notes) => ({ available: false, provenance: { source, licence: { id: 'unknown', url: null }, attribution: null, retrievedAt: new Date().toISOString(), observedAt: null, stale: false, notes } })

const routes = {
  '/public/transport/departures': async ({ stationRef }) => ({
    updatedAt: new Date().toISOString(), stationRef: stationRef ?? null, stopName: null, count: 0, results: [],
    ...placeholder('none', 'Realtime departures follow once a licensed source (BEG/DEFAS, MVV TRIAS or MVG) is connected.'),
  }),
  '/public/person/sites': async () => personArchive ? person.sitesResponse(personArchive) : ({
    sites: PEDESTRIAN_SITES.map(Location => ({ Location })),
    ...placeholder('https://muenchen.digital/meldungen/digitaler-zwilling/2024/passantenfrequenzen-de.html', 'Site list from the city article (2024); counts follow once PERSON_DATA_DIR is set.'),
  }),
  '/public/person/traffic': async ({ period, siteName, siteId }) => personArchive ? person.traffic(personArchive, { period, siteName, siteId }) : ({
    period: period === '30d' ? '30d' : '7d', bucket: period === '30d' ? 'day' : 'hour', updatedUntil: null, dataThrough: null, lastTimestamp: null,
    current: { from: null, to: null, count: null }, previous: { from: null, to: null, count: null }, changePercent: null, completeness: 0, chart: [], sites: [],
    ...placeholder('local Passantendaten archive', 'Pedestrian counts follow once PERSON_DATA_DIR points to the Passantendaten archive.'),
  }),
  '/public/transport/stations': async () => {
    const c = await stations.get()
    return mvv.buildStationsResponse(c.payload, c)
  },
  '/public/bike/sites': async () => {
    const [s, i] = await Promise.all([bikeSites.get(), bikeIngest.get()])
    return bike.buildSitesResponse(s.payload, bike.summary(store.db).bySite, { retrievedAt: s.retrievedAt, stale: s.stale || i.stale })
  },
  '/public/bike/traffic': async ({ period, siteId }) => {
    const [s, i] = await Promise.all([bikeSites.get(), bikeIngest.get()])
    const through = bike.dataThrough(bike.summary(store.db).lastTs)
    const t = bike.traffic(store.db, { period, siteId, through, sitesMeta: s.payload })
    if (!t) throw new HttpError(503, 'no bike data ingested yet')
    return { ...t, provenance: bike.trafficProvenance({ retrievedAt: i.retrievedAt, stale: i.stale, through }) }
  },
  '/public/parking': async () => {
    const c = await parkingSites.get()
    if (!parkingOccupancy) return parking.buildParkingResponse(c.payload, c)
    const o = await parkingOccupancy.get().catch(() => null)
    return parking.buildParkingResponse(c.payload, {
      ...c,
      occupancy: o?.payload.bySite ?? null,
      occupancyProvenance: o ? parkraumwende.occupancyProvenance({ ...o, observedAt: o.payload.observedAt }) : null,
    })
  },
  '/public/opendata': async () => {
    const c = await openData.get()
    return ckan.buildOpenDataResponse(c.payload, c)
  },
  '/public/city-info': async () => {
    const c = await cityInfo.get()
    return wikidata.buildCityInfoResponse(c.payload, c)
  },
  '/public/machmit-projects': async () => {
    const c = await proposalCounts.get()
    return unser.buildMachmitResponse(projects, c.payload, { today: today(), retrievedAt: c.retrievedAt, stale: c.stale, cacheSeconds: proposalCounts.ttlSeconds })
  },
}

if (process.env.NO_SCHEDULER !== '1') startScheduler(sources)
const statics = [
  { prefix: '/config/munich/assets/', dir: join(here, '../../config/munich/assets') },
  { prefix: '/', dir: join(here, 'web') },
]
createServer(routes, { statics }).listen(PORT, () => {
  console.log(`munich-public-api listening on http://localhost:${PORT}  (dashboard at /)`)
  for (const r of Object.keys(routes)) console.log(`  GET ${r}`)
})
