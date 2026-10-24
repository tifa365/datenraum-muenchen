# Munich data sources: findings log

Running notes on candidate sources for the ten dashboard endpoints (see `research-brief.md`).
Each entry says what was verified live and when.

## 4. Parking (`/public/parking`)

### Candidate A: infranode.dev (verified 2026-10-24)

- URL: `https://infranode.dev/api/v1/cities/muenchen/parking`
- HTTP 200, JSON, 7.6 kB, no auth, served via Cloudflare with `cache-control: public, max-age=300`.
- Envelope: `data.payload.facilities[]` plus provenance fields (`source: muenchen_parking`,
  `license_id: dl_de_by_2_0`, attribution "Landeshauptstadt München", `ags: 09162000`,
  `wikidata_qid: Q1726`, `retrieved_at`, `content_hash`, `record_id`) and `meta.source_status`.
- **72 facilities, static fields only:** `name`, `address`, `lat`, `lon`. No id, no capacity,
  no occupancy, no timestamp (`observed_at` is null).
- Trimmed sample: [`samples/infranode-parking.json`](samples/infranode-parking.json).
- Mapping to our contract: `name`, `lat`, `lon` direct; `id` must be derived (slug of name);
  `total`, `occupied`, `free`, `state`, `timestamp` **missing**.
- **Verdict: partial.** Good as the facility master list; a live occupancy source is still required
  (Parkleitsystem / P+R München / Mobilithek, see brief item 4).

### Upstream lineage and known data errors

From a muenchen.de staff conversation on 2026-07-15 (ITM-SLP41):

- The `opendata.muenchen.de` dataset "Parkhäuser München"
  (resource `76554a21-34bc-4f62-b609-8af20e0ad9d7`) is pulled through an interface from
  **muenchen.de (Portalgesellschaft)**, last refreshed **February 2026**; the dataset has existed since 2016.
  infranode's `source: muenchen_parking` is evidently this dataset.
- Known error: the entry **"Parkgarage am Salvatorplatz"** (Salvatorplatz 3, 48.142269 / 11.57519
  in infranode) is "a bit off". Correct reference data: Wikipedia "Salvatorgarage" and
  parkraumwende.de entry 253 (`https://data.parkraumwende.de/?eintrag=253#karte`).
  Corrections upstream are only possible via `www.muenchen.de/verkehr/parkgarage-am-salvatorplatz`.
- Consequence: treat the master list as **not authoritative** and apply manual corrections after
  import, via [`tools/munich-public-api/src/adapters/parking-overrides.json`](../../../tools/munich-public-api/src/adapters/parking-overrides.json)
  (keyed by facility name, every entry cites its evidence).
- **Salvatorplatz resolved (2026-10-24):** parkraumwende `parkraummap.csv` ID 253 (the `eintrag=253`
  link) gives entrance Jungfernturmstraße 1, **452** spaces, 48.1420916615 / 11.5739753267, operator
  bavaria-parkgaragen, LHM places ID 121101. Wikipedia "Salvatorgarage" (ca. 465 spaces,
  48.141863 / 11.574236) agrees. The upstream point is ~90 m east. Note: parkraumwende's own
  `parkhaeuser.csv` (PLS list, P3, sn 401062) still carries the old point and 250 spaces.

## 9. Citizen participation (`/public/machmit-projects`)

Replaces Augsburg's machmit.augsburg.de tile with **unser.muenchen.de**, the City of Munich's
participation platform. Verified 2026-10-24:

- Software: CONSUL, modified by demokratie.today (footer). Augsburg's machmit portal is also
  CONSUL, so the same integration approach applies.
- Project page: `https://unser.muenchen.de/opendata`, HTTP 200. Title "Ihre Ideen für offene
  Datensätze!", subtitle "Gesucht: Datensätze von besonderem Münchner Interesse". Participation phase
  **2026-10-26 to 2026-12-06** ("Startet bald" at time of writing). Internal ids in the HTML:
  `data-projekt-id="89"`, `data-projekt-phase-id="699"`.
- Image: `og:image` on the page (Rails ActiveStorage blob); the representation URL used in the mock
  was supplied by the project owner.
- **Real REST API exists (verified 2026-10-24).** The footer link "API-Docs" (`/api/docs`) is a
  Redoc viewer for `https://unser.muenchen.de/api_docs/v1/swagger.yaml` ("Consul Projekt API",
  OpenAPI 3.0.1, 82 paths, 615 kB). A copy is saved as
  [`unser-muenchen-api-v1.swagger.yaml`](unser-muenchen-api-v1.swagger.yaml).
  The endpoints we need:

  | Call | Purpose | Notes |
  |---|---|---|
  | `GET /api/projekts?only_public=true&include_phases=true` | all projects | pagination `page`/`per_page`, `sort_by`, `filter`, `image_variant_versions` |
  | `GET /api/projekts/{id}?include_phases=true` | one project, e.g. id 89 | |
  | `GET /api/projekts/{projekt_id}/projekt_phases` | phases with dates | `public_data` clients see only visible, active phases in date range |

  `Projekt` fields: `id, name, title, subtitle, text, text_html, parent_id, created_at, updated_at,
  order_number, total_duration_start, total_duration_end, comments_count, level,
  top_level_projekt_id, preview_code, page, projekt_settings[], projekt_phases[], content_blocks[]`.
  `ProjektPhase` fields: `id, phase_tab_name, type, projekt_id, active, visible, position,
  start_date, end_date, created_at, updated_at`.

  Mapping to our `MachmitProject`: `id`→`id`, `title`→`title`, `subtitle`→`subtitle`,
  `url` = `https://unser.muenchen.de/` + project slug (slug not in the schema; derive from `name` or
  keep a lookup), `startDate`/`endDate` from `total_duration_*` or the active phase's
  `start_date`/`end_date`, `daysLeft` computed, `image` presumably inside the `page` object
  (the API has `update_page_image`); confirm once a token is available.
- **Auth is mandatory:** every request, GET included, needs `Authorization: Bearer <token>`.
  Anonymous `GET /api/projekts` returns `401 {"error":{"type":"unauthorized"}}` (verified). Tokens
  belong to an "API client" that a platform administrator creates in the admin area under
  API → API clients, with access level `admin` or **`public_data`** (read-only, public projects
  and published content only). We need a `public_data` client; request it from the platform team.
- GraphQL (`/graphql`, no auth) is **not** sufficient: the root query exposes only `proposal(s)`.
  `Projekt {id,name,startsAt,endsAt,active}` and `ProjektPhase {id,type,startDate,endDate,active}`
  are reachable only through a proposal, and the opendata project has no proposals yet (verified, empty).
- The browser XHR `GET /118/projekt_phase_footer_tab/699` returns a jQuery/HTML fragment (works
  anonymously) and `/ahoy/visits` is visit analytics; neither is a data API.
- Contacts: unser.muenchen@muenchen.de (platform team, ask here for the API client token),
  data.opengov@muenchen.de (project owner, IT-Referat it@M).
- **Verdict: direct (with token).** Once a `public_data` API client token is issued, one call to
  `GET /api/projekts?only_public=true&include_phases=true` feeds the tile. Without a token, fall back
  to scraping the project page (as Augsburg does with machmit) or the mock.
- **Status: the project has not started; the endpoint is served from the mock for now:**
  [`samples/unser-muenchen-projects.mock.json`](samples/unser-muenchen-projects.mock.json)
  (`id` 89, dates as above, `daysLeft` relative to 2026-10-24, `totalRunningCount` invented).

### Counting the proposals ("Vorschläge") of the opendata project (verified 2026-10-24)

Goal: only the number of ideas submitted to project 89 / phase 699. Findings:

| Source | Anonymous? | Gives the per-project count? |
|---|---|---|
| GraphQL `proposals` connection | yes | **no**: no `totalCount`, no filter args, and it returned 0 edges platform-wide although 24+ proposals are visible in HTML, so it is effectively empty |
| REST `GET /api/projekt_phases/699/proposals` | **no** (Bearer token) | yes, but needs the `public_data` API client |
| `GET /proposals.json` (GeoJSON) | yes | no: site-wide map layer, 686 features, ignores `projekt_phase_id` |
| `GET /proposals?projekt_phase_id=699` (HTML) | yes | no: the filter is ignored, same 24 site-wide items |
| `GET /opendata` (project page HTML) | yes | **yes**: the phase tab label `Ideensammlung (N)` plus the empty-state text "Derzeit keine verknüpften Beiträge" |

So the public API is **not** enough, but the public **page** is. The count is one regex over the
project page, no login, no token:

The markup is `<h2 class='js-projekt-phase-title'>` with a line break between the word and the
number, so normalise whitespace before matching:

```sh
curl -s -A 'munich-dashboard/0.1' https://unser.muenchen.de/opendata \
  | tr -s '[:space:]' ' ' \
  | grep -oE "js-projekt-phase-title'> *Ideensammlung *\([0-9]+\)" \
  | grep -oE '[0-9]+'
# -> 0 on 2026-10-24 (phase starts 2026-10-26)
```

Caveats: the label text is German UI copy and may change; if it disappears, fall back to the REST
API with a token. Poll at most every 10 minutes (the Augsburg tile caches 600 s) and send a
descriptive User-Agent.

Implemented as our own endpoint: [`tools/munich-public-api/server.mjs`](../../../tools/munich-public-api/server.mjs)
serves `GET /public/machmit-projects` in the Augsburg shape plus `proposalsCount` and `status`,
scraping the count server-side with a 600 s cache (verified locally 2026-10-24, returns 0).
