# munich-public-api

Backend for the Munich Smart City Dashboard. It replaces Augsburg's "Civora Alerts public API"
(`docs/reverse-engineering/augsburg/alerts-public-api.openapi.yaml`) with Munich sources.
Contract: [`docs/reverse-engineering/munich/munich-public-api.openapi.yaml`](../../docs/reverse-engineering/munich/munich-public-api.openapi.yaml).
Differences from Augsburg: [`differences-from-augsburg.md`](../../docs/reverse-engineering/munich/differences-from-augsburg.md).
Source decisions: [`source-assessment-2026-10-24.md`](../../docs/reverse-engineering/munich/source-assessment-2026-10-24.md)
and [`sources.md`](../../docs/reverse-engineering/munich/sources.md).

| Endpoint | Source | Refresh | Notes |
|---|---|---|---|
| `GET /public/city-info` | Wikidata Q1726 (CC0) | daily | preferred, latest P1082; area in km² |
| `GET /public/opendata` | opendata.muenchen.de CKAN | hourly | total, modified in last 30 days, 3 latest |
| `GET /public/machmit-projects` | `src/adapters/unserMuenchen.projects.json` + unser.muenchen.de page | 10 min | live `proposalsCount` from "Ideensammlung (N)" |
| `GET /public/parking` | infranode.dev (opendata.muenchen.de) + `parking-overrides.json` | daily | 72 garages; occupancy only with `PARKING_OCCUPANCY=parkraumwende` (dev only) |
| `GET /public/bike/sites` | city WFS | daily | 6 counters, `active` from ingested data |
| `GET /public/bike/traffic?period=7d\|30d&siteId=` | city monthly 15-min CSVs → sqlite | 6 h | anchored to `dataThrough` (publication lags weeks) |
| `GET /public/person/sites`, `GET /public/person/traffic?period=7d\|30d&siteName=` | local Passantendaten archive (SQLite, read-only, `PERSON_DATA_DIR`) | frozen | 10 inner-city locations, data through 23.10.2026; without `PERSON_DATA_DIR` the tile shows a placeholder |
| `GET /public/transport/stations` | MVV stop CSV, `de:09162:*` | weekly | static; `maxDelay`/`types` null |

Placeholder (`available: false`, empty data): `/public/transport/departures` (realtime source pending).

## Dashboard page

A replica of Augsburg's public home page (smartes.augsburg.de/app/home), same layout and behaviour,
Munich data and images. Written for this project from an analysis of Augsburg's dashboard (layout,
API calls, refresh cadence, sorting, empty states); no Augsburg code is bundled.

- `GET /` (`web/index.html`): CIVORA-style shell (header with info, language and login, icon
  sidebar) with the dashboard in an iframe, as in Augsburg. Header/sidebar actions are dummies.
- `GET /dashboard.html` (+ `dashboard.css`, `dashboard.js`): the 7-tile grid (city, transport,
  parking, bike, pedestrians, open data, participation) and the call-to-action bar, as plain web
  components; Chart.js from cdnjs for the counter charts.
- Refresh: departures and parking every 60 s, participation every 10 min.
- Transport search runs on the 1,196 Munich stops; departures and pedestrian counts show a
  "folgt" state served by placeholder endpoints (`available: false`).
- Images are served from `/config/munich/assets/`; CC BY-SA credits are rendered on the image.

## Static build (GitHub Pages)

`node build-static.mjs [outDir]` starts the server once, saves every API answer the page can
request as JSON (`api/…`, file names from `web/snapshot-key.mjs`), copies the page and images and
switches `dashboard.html` to static mode. `.github/workflows/pages.yml` runs it on every push to
`main` and every 6 hours and deploys to https://tifa365.github.io/datenraum-muenchen/.
The public build never includes parking-occupancy test data or the Passantendaten archive itself; the pedestrian tile uses the frozen aggregates in `static-snapshots/person/`.

## Run

Node 22.5+, no dependencies (uses the built-in `node:sqlite`).

```sh
cd tools/munich-public-api
npm start                      # http://localhost:8080
npm test                       # offline tests against test/fixtures
```

| Env var | Default | Purpose |
|---|---|---|
| `PORT` | 8080 | listen port |
| `DB_FILE` | `data/snapshots.sqlite` | snapshots and bike counts (git-ignored) |
| `USER_AGENT` | generic | set a contact address before running against live sources regularly |
| `PARKING_OCCUPANCY` | off | `parkraumwende` merges dev-only occupancy into `/public/parking` |
| `PERSON_DATA_DIR` | unset | path to the Passantendaten archive's `data/` folder (not in git, proprietary) |
| `NO_SCHEDULER` | unset | `1` disables background refresh (sources then refresh on request) |

The first start ingests two years of bike CSVs (about 4–5 minutes). Later starts only fetch
new or changed monthly files.

## Layout

- `server.mjs` wires sources to routes.
- `src/http.mjs`: router, CORS, Express-style 404.
- `src/cache.mjs`: stale-while-revalidate cache and background scheduler, one upstream refresh per TTL.
- `src/store.mjs`: sqlite snapshots, served after outages and restarts.
- `src/provenance.mjs`: `source`, `licence`, `attribution`, `retrievedAt`, `observedAt`, `stale` on every response.
- `src/time.mjs`: Europe/Berlin conversions, DST-aware.
- `src/adapters/*`: one per upstream, with pure parse functions (tested) and a loader.

## Before production

- Participation: switch `unserMuenchen.mjs` to `GET /api/projekt_phases/{phaseId}/proposals` once a
  `public_data` token is issued (unser.muenchen@muenchen.de).
- Parking occupancy: needs a licensed PLS feed (data.opengov@muenchen.de); parkraumwende is a
  2-hourly community mirror with unconfirmed rights.
- Live transport: BEG/DEFAS, MVV TRIAS or written MVG permission.
