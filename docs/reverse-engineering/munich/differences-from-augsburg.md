# Munich vs Augsburg: differences and changes

What changed between Augsburg's public dashboard API (reverse-engineered, see
[`../augsburg/alerts-public-api.openapi.yaml`](../augsburg/alerts-public-api.openapi.yaml)) and the
Munich implementation in [`tools/munich-public-api`](../../../tools/munich-public-api)
(contract: [`munich-public-api.openapi.yaml`](munich-public-api.openapi.yaml)). State: branch
`munich-dashboard`, 2026-10-24.

## 1. Cross-cutting changes

| Topic | Augsburg | Munich | Why |
|---|---|---|---|
| Provenance | none | every response has `provenance {source, licence, attribution, retrievedAt, observedAt, stale}` | Sources have different licences and freshness; attribution is mandatory for DL-DE-BY / CC BY |
| Missing values | zeros or field absent | `null` = unknown, never 0 | Several Munich sources lack fields (occupancy, delays, capacities) |
| Outage behaviour | unknown | last good snapshot from sqlite, `provenance.stale: true` | Upstreams are third-party; dashboard should not go blank |
| Upstream polling | unknown | one refresh per source per TTL, background scheduler | Never one upstream call per visitor |
| CORS | `Access-Control-Allow-Origin` only for the dashboard origin | reflects any requesting origin | Development convenience. **Restrict before production.** |
| Server errors | not observed | JSON `{error}` with 502; 503 for bike traffic before the first ingest | |
| 404 | Express HTML `Cannot GET /public/...` | same | Kept compatible |
| Open-data calls | dashboard called open.bydata.de directly (3 calls) | one backend endpoint `/public/opendata` | See section 2 |

## 2. Endpoint by endpoint

### `/public/city-info`: same shape
- Values: München, 1,505,036 (2025-12-31), 310.71 km², `source: "Wikidata Q1726"`.
- Added `image`: the dashboard's main/header image (Marienplatz/Tal, CC0, 1280×853 Commons
  rendition, also bundled as `config/munich/assets/images/muenchen-header-marienplatz.jpg`).
  Augsburg's header image (`aug-lp-header-background.jpg`, 6.7 MB) lived only in its CIVORA config.
- Added `provenance`. Population is the official statistical figure, not registered residents
  (1,604,731); decision recorded in `integration-plan.md`.

### `/public/transport/stations`: same shape, static data
| Field | Augsburg | Munich |
|---|---|---|
| `count` | 278 | 1,196 (MVV stop list, DHIDs `de:09162:*`) |
| `status` | ok / minor / critical / no-data | always `no-data` |
| `maxDelay` | minutes or null | always `null` |
| `types` | array (bus, tram, train) | `null` (stop list has no modes; needs a GTFS join) |
| `updatedAt` per station | realtime record time | retrieval time of the stop list |
| new | — | `skipped` (6 stops without coordinates), `provenance`, `image` (tile image: crop on the S/U-Bahn sign at Marienplatz, 600×400 + @2x, CC0) |

### `/public/transport/departures`: **placeholder**
Returns the Augsburg envelope with `results: []` and `available: false`. Realtime source not decided (gtfs.de open but no S-Bahn; MVG needs permission; BEG/DEFAS needs an agreement).

### `/public/parking`: extended, occupancy optional
| Field | Augsburg | Munich |
|---|---|---|
| `count` | 15 garages, all with live occupancy | 72 garages, static list |
| `id` | numeric string (`"102213"`) | ASCII slug of the name (`parkgarage-am-salvatorplatz`) |
| `type` | `parkingGarage` | `parkingGarage` or `undergroundGarage` (from the name) |
| `state` | `ok`, `error` | `unknown` (no occupancy source), `ok`, `stale` (>3 h), `inactive`, `invalid` (free > capacity or capacity 0) |
| `total`/`occupied`/`free`/`timestamp` | always set | `null` unless occupancy is enabled and valid |
| new | — | `address`, `withOccupancy`, `provenance`, `occupancyProvenance` (only with occupancy), `image` (Salvatorgarage facade, 600×400 + @2x, **CC BY-SA 4.0: credit in `image.attribution` must be shown**) |

Occupancy: off by default. `PARKING_OCCUPANCY=parkraumwende` merges a 2-hourly community mirror of
the Parkleitsystem for 21 garages (dev only, rights unconfirmed). `timestamp` is the source's
measurement time, never our retrieval time.

Data corrections, all with evidence in the JSON files:
- `parking-overrides.json`: Parkgarage am Salvatorplatz → Jungfernturmstr. 1, 452 spaces,
  48.1420916615 / 11.5739753267 (upstream point ~90 m off, no capacity).
- `parking-crosswalk.json`: PLS garage (sn/ph) → our id. Three garages left unmapped on purpose:
  Hertie-Parkhaus (P21), PH Hauptbahnhof Süd (P24), Königshof-Parking (P16).
- With occupancy on, a garage's `total` is the live PLS capacity (e.g. Salvatorplatz 399), which can
  differ from the curated capacity (452).

### `/public/bike/sites`: extended
| Field | Augsburg | Munich |
|---|---|---|
| sites | 12, all active | 6 (city WFS); Margareten has no data → `active: false` |
| `siteId` | numeric string (`"100061140"`) | name key (`Arnulf`, `Kreuther`, …) |
| `firstData` | sensor's first data | earliest **ingested** observation (current + previous year only); nullable |
| new | — | `directions`, `active`, `provenance` |

### `/public/bike/traffic`: same core shape, different time anchor
- **Windows end at `dataThrough`, the last complete published day, not yesterday.** The city
  publishes monthly; on 2026-10-24 the data ends 2026-09-30.
- `updatedUntil` = `dataThrough` (kept for compatibility).
- `changePercent` is `null` unless both windows are > 95 % complete (Augsburg always had a number).
- New: `dataThrough`, `completeness`, `provenance`.
- Unknown `period` falls back to `7d` (same as Augsburg). `siteId` match is case-insensitive.
- Source CSV is Berlin wall-clock time with 96 slots every day: non-existent spring-forward slots
  are dropped, the folded autumn hour is mapped once (one hour missing on that day).

### `/public/person/sites`, `/public/person/traffic`: same shape, frozen archive
- Source: a local Passantendaten archive (SQLite, read-only, `PERSON_DATA_DIR`), 10 inner-city
  locations, hourly and daily counts from each location's start up to **2026-10-23**. It is not
  refreshed; windows are anchored to that `dataThrough`, like bike traffic.
- `sites[]` keep Augsburg's `Location` field and add `siteId`, `name`, `directions`, `firstData`,
  `lastData`, `granularity`, `active`. `traffic` adds `dataThrough`, `completeness`, `provenance`;
  `changePercent` is null unless both windows are more than 95 % complete.
- Missing hours are null (not zero). Licence: proprietary; public display needs clearance.
- Without `PERSON_DATA_DIR` both endpoints fall back to a placeholder (`available: false`).

### `/public/machmit-projects`: same shape, extended
| Field | Augsburg | Munich |
|---|---|---|
| `source` | machmit.augsburg.de | unser.muenchen.de |
| project list | scraped (3 of 12 running) | curated in `unserMuenchen.projects.json` (1 project: Open-Data-Ideen, id 89) |
| `totalRunningCount` | running projects on the portal | running projects in our list (`status === 'running'`) |
| `subtitle`/`image`/`startDate`/`endDate`/`daysLeft` | always set | nullable |
| new | — | `proposalsCount` (live, from "Ideensammlung (N)" on the project page), `status` (upcoming/running/ended/unknown), `provenance` |

The unser.muenchen.de REST API exists but requires a token; the count is scraped from the public
page until a `public_data` token is issued.

### Open-data counter: **new endpoint `/public/opendata`, new shape**
Augsburg's dashboard called the Piveau hub-search on open.bydata.de three times (total, modified in
30 days, 3 newest). Munich uses one backend call against the city CKAN:

```json
{ "count": 337, "modifiedInWindow": 86, "windowDays": 30,
  "latest": [{ "id", "name", "title", "modified", "created", "url", "licence", "publisher" }],
  "portalUrl": "https://opendata.muenchen.de", "fetchedAt": "…", "provenance": { … } }
```

Reason: bydata harvests Munich (facet `catalog:["muenchen"]`, total also 337) but its modified dates
lag (30-day count 0 vs 86 in CKAN).

## 3. Changes to this repository

All on branch `munich-dashboard`; `main` is unchanged upstream (`d1715ce`). No CIVORA UI source
file was modified.

| Commit | Change |
|---|---|
| `docs:` | `docs/ARCHITECTURE.md`, Augsburg and Munich reverse-engineering docs, README links |
| `chore:` | `.gitignore` (upstream has none) |
| `feat(munich-api):` ×7 | backbone, city-info, opendata, parking, parking occupancy, bike, stations |
| `docs(munich-api):` | Munich OpenAPI contract, tool README |
| `docs:` | this document |
| `feat(munich-api):` | pedestrian endpoints from the local Passantendaten archive |
| `feat(munich-web):` | replica of the Augsburg home page: CIVORA-style shell at `/`, dashboard at `/dashboard.html`, own implementation based on an analysis of the Augsburg dashboard's code and layout |
| `feat(munich-api):` | (superseded) prototype dashboard page at `/` (`tools/munich-public-api/web/index.html`); Augsburg's dashboard is a separate app whose source we do not have, so this is a new implementation |
| `feat(munich):` | parking tile image (Salvatorgarage, CC BY-SA 4.0) + credits, exposed in `/public/parking` |
| `feat(munich):` | transport tile image (S/U-Bahn Marienplatz crop) + credits, exposed in `/public/transport/stations` |
| `feat(munich):` | header image `config/munich/assets/images/` + credits, exposed in `/public/city-info` |

`docs/reverse-engineering/munich/parking-overrides.json` moved to
`tools/munich-public-api/src/adapters/parking-overrides.json`.
