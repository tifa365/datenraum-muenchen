# Reverse-engineering notes: Datenraum Augsburg (smartes.augsburg.de)

Recorded on 2026-10-24. Everything marked **verified** was fetched live with curl; everything
marked *inferred* comes from reading the CIVORA UI source or the deployed bundle.

## 1. What the site is

`https://smartes.augsburg.de` is an unmodified **CIVORA UI 1.30.0** build (this repository), served
by nginx from a container. Evidence (verified): the AGPL header comment of `index.html`, the
`/assets/index-68zaGWDz.js` bundle, `/silent-check-sso.html`, `/tarteaucitron/`, and the
`appVersion: "1.30.0"` value in the baked-in config.

CIVORA bakes the customer configuration into the JS bundle at container start (`runtimeconfig.sh`
runs `envsubst` over `index-*.js`). The complete resolved configuration was therefore recoverable
from the public bundle and is saved as [`config.resolved.js`](config.resolved.js). It has exactly the
shape of [`config/config.js`](../../../config/config.js) and can be dropped into
`config/augsburg/config.js` to reproduce the deployment locally.

### Platform hosts (from the config)

| Config key | Host | Reachable anonymously (verified) |
|---|---|---|
| `appUrl` | `https://smartcity-udp.augsburg.de/` | 200, serves the same SPA |
| `keycloakUrl` / realm `civora` / client `client-civora-ui` | `https://auth.smartcity-udp.augsburg.de` | 200, realm metadata and OIDC discovery are public |
| `supersetUrl` | `https://superset.smartcity-udp.augsburg.de` | 302 to login |
| `piveauHubSearchUrl` | `https://piveau-search.smartcity-udp.augsburg.de` | 200 |
| `piveauHubRepoUrl` | `https://piveau-repo.smartcity-udp.augsburg.de` | 200 |
| `piveauHubStoreUrl` | `https://piveau-store.smartcity-udp.augsburg.de` | no response (TLS/connect failure) |
| `middlewareUrl` | `https://middleware.smartcity-udp.augsburg.de` | 307 to `/docs` (FastAPI style) |
| `civoraDpiUrl` | `https://dpi.smartcity-udp.augsburg.de` | 200 |
| `connectorsUrl` | `https://connectors.smartcity-udp.augsburg.de` | 200 |
| `alertsUrl` | `https://alerts.smartcity-udp.augsburg.de` | 200, see section 3 |
| `airflowUrl` | `https://airflow-webserver.smartcity-udp.augsburg.de` | 200 |
| `modelCoordinatorUrl` | `https://model-coordinator-api.smartcity-udp.augsburg.de` | no response |
| `oup.url` | `oup.smartcity-udp.augsburg.de` | 404 |
| custom iframe module "Smart City Map" | `https://smart-city-map.smartcity-udp.augsburg.de/?scrollWheelZoom=true&embed=true` | 200 |
| (not in config, derived in code) | `https://smart-city-dashboard.smartcity-udp.augsburg.de/` | 200 |

Only the HTTP status of these hosts was checked. Their content was not explored, except for the
alerts "public" API below.

### Enabled modules and navigation (from the config)

| Module | available | order | requiresLogin | Notes |
|---|---|---|---|---|
| home | yes | 1 | no | widgets: `news` only; search enabled |
| customIframeModule "Smart City Map" | yes | 2 | no | route `/app/smart-city-map`, maximised iframe |
| dashboards (Superset) | yes | 3 | yes | fullscreen enabled, dashboard search enabled |
| dataCatalog (Piveau) | yes | 4 | yes | 10 per page, no dataset preview, dataset-level ACL on, catalogue management off |
| organisationSites | no | 5 | | |
| digitalTwin | no | 2 | | |
| dksrApps | no | 6 | | all 12 sub-apps off |
| analytics | no | 7 | | |
| adminCockpit | yes | | | cards for Keycloak, Alerts, Connectors, Airflow appear per group membership |

Other settings: new CIVORA UI design on (`useNewCivoraUi`), landing page not public, login not
required globally, languages `de,en` with fallback `de`, all info pages enabled (`infoPages: "*"`),
header title "Datenraum Augsburg", logo `aug-logo.jpg`, header image `aug-lp-header-background.jpg`,
home quick links: "add dashboard" (opens Superset), "find data" (`/app/data-catalog`), "add data"
(`/civora-dpi`). User menu: profile, user management (admins), legal notices.

### Customer-specific code in the bundle (not in this repo)

The public repo ships no `config/<customer>/` folders, but the deployed bundle contains them for
**24 customers** (aargau, ascend, augsburg, bip, civora, climaborough, datenatlas, fn, hof, jaeg, kdw,
krc, ladadi, mainz, metrocog, norwalk, sgf, siegburg, spc, swlu, trs, wd, wetteraukreis, wiv), because
`src/i18n.js`, `src/utils/dataNoticePages.ts` and `src/views/app/HomeView.vue` glob-import them.
For Augsburg this means:

- `AugsburgHomeView` (inside `HomeView.vue`): shown to **logged-out** visitors on `/app/home`. It is
  nothing but a full-size `<iframe>` whose `src` is computed from `appUrl` as
  `https://smart-city-dashboard.<last three host labels>/`, i.e.
  `https://smart-city-dashboard.smartcity-udp.augsburg.de/`. The public home page content is
  therefore a **separate application**, not part of CIVORA UI.
- `config/augsburg/components/data-notices/{LegalNotice,PrivacyPolicy,TermsOfUse}.vue`, lazily
  loaded chunks.
- `config/augsburg/locale-overrides/{de,en}.json`, e.g. news widget heading "Neues aus Augsburg".
- `/config/augsburg/assets/style.css` (423 bytes, CSS variable overrides), `images/aug-logo.jpg`,
  `images/aug-lp-header-background.jpg` (6.7 MB). All verified reachable.

The routes compiled into the bundle match `src/router/routes.ts` of this repo one to one.

## 2. The public home dashboard and its API calls

The iframe application at `smart-city-dashboard.smartcity-udp.augsburg.de` makes these XHR calls
(captured from the browser, replayed and saved under [`samples/`](samples/); arrays in the samples
are truncated to 5 entries, `count` fields are untouched):

| Dashboard tile (inferred) | Request | Result (verified 2026-10-24) |
|---|---|---|
| City facts | `GET alerts/public/city-info` | Augsburg, 301 786 inhabitants (2025-12-31), 146.93 km², source Wikidata |
| ÖPNV stop map / status | `GET alerts/public/transport/stations` | 278 stops, status ok/minor/critical/no-data, bus/tram/train |
| Departure board Königsplatz | `GET alerts/public/transport/departures?stationRef=de:09761:101` | 20 next departures with real-time delay |
| Parking garages | `GET alerts/public/parking` | 15 garages with total/occupied/free |
| Bike counters | `GET alerts/public/bike/sites` then `GET alerts/public/bike/traffic?period=7d&siteId=all` | 12 sites; 119 947 bikes this week vs 140 766 last week (−14.8 %), hourly chart |
| Pedestrian counters | `GET alerts/public/person/sites` then `GET alerts/public/person/traffic?period=7d&siteName=all` | 7 locations; 720 364 vs 770 349 (−6.5 %) |
| Open data counter | `GET open.bydata.de/api/hub/search/search?filters=dataset&limit=1&aggregation=false&facets={"open_data_presence":["augsburg.bydata"]}` | 396 datasets |
| "new in 30 days" | same with `minDate=<now−30d>` | 0 |
| Latest datasets list | same with `filter=dataset&limit=3&sort=modified+desc,...&includes=id,title.de,...` | 3 newest datasets |
| Citizen participation | `GET alerts/public/machmit-projects` | 3 of 12 running projects from machmit.augsburg.de, cached 600 s |
| (CIVORA UI shell, not the dashboard) | `GET auth/realms/civora/protocol/openid-connect/login-status-iframe.html/init?client_id=client-civora-ui&origin=https://smartes.augsburg.de` | keycloak-js session-status iframe handshake (`checkLoginIframe: true`); not replayed because it carries the browser's Keycloak session cookies |

Formal descriptions, validated with Redocly CLI 1.34.3:

- [`alerts-public-api.openapi.yaml`](alerts-public-api.openapi.yaml): all nine `alerts/public/*` endpoints
- [`bydata-search-api.openapi.yaml`](bydata-search-api.openapi.yaml): the Piveau hub-search `/search` call as used here

### Behaviour of the alerts public API (verified)

- No authentication and no origin check server-side. CORS headers (`Access-Control-Allow-Origin`)
  are only sent for the dashboard's own origin, so other browser origins cannot read it without a proxy.
- `period` accepts `7d` (hourly, 168 buckets) and `30d` (daily, 30 buckets). Anything else falls back to `7d`.
- Per-site filtering works with `siteId=<id>` for bikes and `siteName=<Location>` for pedestrians.
- Unknown paths return an Express HTML 404 ("Cannot GET /public/…").
- `/transport/departures` without `stationRef` returns an empty list, not an error.

## 3. Coverage caveats

- Confirmed live: the twelve public requests above, the CIVORA static assets, HTTP status of the platform hosts.
- Not explored: the authenticated CIVORA modules (Superset dashboards, Piveau catalogue, DPI,
  admin cockpit), the content of the smart-city-dashboard and smart-city-map front ends, and all
  non-`/public` routes of the alerts service. These need a login or were out of scope.
- The tile-to-request mapping in section 2 is inferred from the request order and payloads, not
  from the dashboard's source.

## 4. Reusing this for another city (e.g. München)

1. Run CIVORA UI from this repo with a `config/<city>/config.js` modelled on `config.resolved.js`.
2. The public home page is a separate single-page app that only needs the nine JSON endpoints of
   the alerts public API plus a hub-search instance. Re-implementing those endpoints against the
   target city's data sources (GTFS-RT / VDV for departures, parking feeds, counter stations, the
   city's open-data portal) is the actual work; the OpenAPI file is the contract to implement.
3. Everything else (Keycloak, Superset, Piveau hub) is standard infrastructure referenced by URL only.
