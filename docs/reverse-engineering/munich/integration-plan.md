# Plan: Munich public API, Phase 1 with local git commits

## Context
We are rebuilding Augsburg's public Smart City Dashboard (CIVORA UI) for Munich. Augsburg's dashboard reads ten JSON endpoints. The contract is in `docs/reverse-engineering/augsburg/alerts-public-api.openapi.yaml`. The ChatGPT source assessment (pasted 2026-10-24) picked Munich sources for each endpoint.

Already done but uncommitted:
- the architecture explainer
- the Augsburg and Munich research docs
- `tools/munich-public-api/server.mjs`, which serves `/public/machmit-projects` with a live scraped `proposalsCount`
- parking data: infranode, 72 static garages, plus `parking-overrides.json`

Goal: build Phase 1, every tile that runs on open sources. Live and permission-gated sources get adapters that can be switched on later. The user wants **every step committed to git locally**. There is no push.

## Git workflow
- Repo `/home/tim/Projekte/civora-ui`, currently on `main`, clean at upstream `d1715ce`. Create branch `munich-dashboard` first, so `main` stays equal to upstream.
- Add a `.gitignore` early. The repo has none. Ignore `node_modules/`, `dist/`, `tools/munich-public-api/data/` (the sqlite store) and `.env*`.
- One commit per step below. Use Conventional Commits, matching CONTRIBUTING.md, e.g. `feat(munich-api): city-info from Wikidata`. Every message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Commit only after that step's verification passes. Never push.

## Steps (each = one commit)
0. **docs: existing work.** Commit the README link, `docs/ARCHITECTURE.md` and `docs/reverse-engineering/**`. Save the ChatGPT report as `docs/reverse-engineering/munich/source-assessment-2026-10-24.md`.
1. **chore: .gitignore.**
2. **feat(munich-api): backbone.** Refactor `server.mjs` into `src/` with these pieces:
   - `http.mjs`: router, CORS and Express-style 404, taken from the current server
   - `cache.mjs`: TTL cache, plus a scheduler that polls upstreams on an interval, never per visitor
   - `store.mjs`: `node:sqlite` snapshot store in `data/` (works on Node 22.17)
   - `provenance.mjs`: wraps every payload with `source`, `licence`, `attribution`, `retrievedAt` and `observedAt` (null when unknown)
   - `adapters/*.mjs`, one per source
   
   Move the existing machmit logic, including `fetchProposalsCount`, unchanged into `adapters/unserMuenchen.mjs`.
3. **feat: city-info.** Source is Wikidata `Special:EntityData/Q1726.json`. Take the preferred P1082 claim with its P585 date, and P2046 where the unit is Q712226. Cache daily.
4. **feat: opendata.** New endpoint `/public/opendata` from Munich CKAN `package_search`:
   - total and three newest from `rows=3&sort=metadata_modified desc`
   - 30-day count from `fq=metadata_modified:[now-30d TO now]`
   - Cache hourly. On outage return the last snapshot marked `stale`.
5. **feat: parking sites.** Source is infranode `cities/muenchen/parking` with `parking-overrides.json` applied. Ids are stable slugs. Occupancy fields are null and `state` is `unknown`. Fill in Salvatorplatz from parkraumwende entry 253 and the Wikipedia Salvatorgarage article.
6. **feat: parking occupancy (dev-only adapter).** Source is parkraumwende `latest.json`. Join it to our sites through `parking-crosswalk.json` (PLS S/N+PH to our id). Validate `0 ≤ free ≤ cap`. Use `observedAt` from its timestamp, read as Europe/Berlin. Switched on by env `PARKING_OCCUPANCY=parkraumwende`. Default is off, because rights are unconfirmed.
7. **feat: bike sites + traffic.**
   - Sites: city WFS, using its `latitude`/`longitude` properties.
   - Counts: the city's monthly 15-minute CSVs, indexed into sqlite. Use `gesamt` only, treat gaps as null, handle DST.
   - Anchor to the latest complete data and add `dataThrough`.
8. **feat: transport stations (static).** Source is the MVV stop CSV, filtered to `de:09162:`. The CSV's X column is latitude. Output `maxDelay: null`, `status: "no-data"`.
9. **DONE differently (2026-10-24): person sites/traffic from the local Passantendaten archive** (frozen SQLite, `PERSON_DATA_DIR`), see `differences-from-augsburg.md`.
10. **docs: Munich OpenAPI.** Write `docs/reverse-engineering/munich/munich-public-api.openapi.yaml`, derived from the Augsburg spec, with the new fields: `dataThrough`, `proposalsCount`, `status`, provenance, nullable counts, `/public/opendata`. Lint it with redocly. Update the tool README.

Out of scope for this plan: departures and live delays (gtfs.de, BEG or MVG decision pending), the CIVORA front-end config, and the participation REST token. These follow later.

## Verification (per step, before commit)
- `node --test tools/munich-public-api/test/*.test.mjs` passes. Tests use saved fixture responses in `test/fixtures/` (the existing samples), so they run offline.
- Start the server, `curl` the new endpoint against live upstreams, and check the shape and plausible values: Munich population around 1.5M, CKAN count around 337, 6 bike sites, 72 parking sites.
- Step 10: `redocly lint` passes with zero problems.
- `git log --oneline` shows one commit per step on `munich-dashboard`, and `main` is untouched.

## Open decisions (defaults used unless the user objects)
- Population: Wikidata statistical figure.
- Bike: "data through <date>" instead of week-on-week.
- Participation: keep the current single project.
