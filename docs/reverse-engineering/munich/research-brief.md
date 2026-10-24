# Research brief: data sources for a Munich Smart City Dashboard

## Context (read first)

We are rebuilding the public "Smart City Dashboard" of Datenraum Augsburg (https://smartes.augsburg.de, a CIVORA UI deployment) for **Munich**. The dashboard is a read-only web page fed by **ten HTTP JSON endpoints**. Nine are served by a small backend we will write ourselves; one is a public open-data search API. Your job is to find, for each endpoint, the best **Munich data source** that can feed it, and to verify that the source really exists, is reachable, and delivers the fields we need.

The full target contract is in the attached OpenAPI files (`alerts-public-api.openapi.yaml`, `bydata-search-api.openapi.yaml`). Below is the condensed version of what each endpoint must deliver.

## Hard requirements for every source you propose

1. **Verify it live.** Open the documentation URL and, where possible, call the endpoint and paste a real response excerpt. Do not propose sources you could not confirm exist in 2026.
2. **Licence and terms.** State the licence (DL-DE-BY-2.0, CC-BY 4.0, ODbL, CC0, proprietary, unknown) and whether automated polling from a server is permitted. Flag anything that is scraping, unofficial or undocumented (e.g. reverse-engineered app APIs).
3. **Access.** Auth required? API key registration? Cost? Rate limits? CORS irrelevant (we call from our backend).
4. **Freshness.** Update interval of the data, and whether historical data is available (needed for the 7-day and 30-day comparisons).
5. **Identifiers.** Which ID scheme is used (VDV/DHID stop IDs like `de:09162:6`, internal numeric IDs, names only).
6. **Field mapping.** For each endpoint, map the source fields to our required fields and list what is missing.
7. **Verdict per endpoint:** `direct` (one call, minor renaming), `transform` (needs aggregation, joining or caching on our side), `partial` (some fields missing), or `unavailable`. Always name a fallback, even if it is "drop the tile".
8. Prefer, in this order: official City of Munich / MVG / Bavarian state sources, then national (DELFI, mCLOUD, GovData), then commercial or community sources.

## The ten endpoints and what they need

### 1. City facts (`/public/city-info`)
Need: population (integer) with reference date, area in km². Augsburg uses Wikidata (Q2749). For Munich confirm Wikidata **Q1726** gives `P1082` population with point-in-time qualifier and `P2046` area, or point to the Statistisches Amt München figure. Verdict expected: direct.

### 2. Public transport stops with live status (`/public/transport/stations`)
Need: list of ~all stops in the city with `stationRef` (DHID / VDV id), name, lat, lon, vehicle types served (bus, tram, train/U-Bahn/S-Bahn), and a **current maximum delay in minutes** per stop, refreshed every minute or so.
Research: MVG and MVV official APIs (incl. any developer programme), DELFI / `zhv.wvigmbh.de` stop register, VDV-431/VDV-453 TRIAS or SIRI feeds for Munich, GTFS and GTFS-RT feeds (MVV, DB, DELFI), the unofficial `mvg.de/api/bgw-pt` endpoints and their terms. Explain what delay data is realistically obtainable city-wide.

### 3. Departure board for one stop (`/public/transport/departures?stationRef=`)
Need: next 20 departures for a central stop (Augsburg uses Königsplatz; Munich candidate: Marienplatz or Hauptbahnhof) with line, destination, origin, vehicle type, timetabled time, estimated time, delay minutes, direction. Real-time, polled every 30–60 s.
Research: same sources as 2, plus whether the chosen source returns both planned and estimated times.

### 4. Parking garages (`/public/parking`)
Need: list of parking garages with id, name, lat, lon, total spaces, occupied, free, status, timestamp; refreshed every few minutes.
Research: City of Munich parking guidance system ("Parkleitsystem"), P+R München GmbH, Munich open-data portal datasets on parking occupancy, mCLOUD / Mobilithek offerings for Munich parking, commercial aggregators (Parkopedia etc.) only as last resort.

### 5. Bicycle counter sites (`/public/bike/sites`) and 6. counts (`/public/bike/traffic?period=7d|30d&siteId=`)
Need: list of permanent bicycle counting stations (id, name, lat, lon, first/last data date, granularity) and **time series** fine enough to build hourly buckets for 7 days and daily buckets for 30 days, plus the previous period for comparison. Expected volume: Munich has roughly a dozen permanent "Raddauerzählstellen".
Research: `opendata.muenchen.de` datasets on Radverkehr Zählstellen (format, update cadence, whether 15-minute or daily values, whether the current week is available or only past months), Eco-Counter public pages for Munich, Mobilithek. State clearly how fresh the data is; if it lags by weeks, the "this week vs last week" comparison is impossible and we need an alternative.

### 7. Pedestrian counter sites (`/public/person/sites`) and 8. counts (`/public/person/traffic?period=&siteName=`)
Need: list of pedestrian counting locations (names) and time series as in 6. Augsburg has 7 inner-city locations with 15-minute data.
Research: Anbieter-Website coverage of Munich (which streets, API access, licence, cost), City of Munich own pedestrian sensors, any open-data dataset. If only Passantendaten-Anbieter exists, document its API and pricing precisely.

### 9. Citizen participation projects (`/public/machmit-projects`)
Need: list of currently running participation projects with title, subtitle, URL, image, start date, end date. Augsburg scrapes machmit.augsburg.de (a CONSUL / Rails site).
Research: Munich's participation platforms (e.g. unser-muenchen.de, "München mitdenken", Stadtratsportal, Bezirksausschuss portals), whether they offer an API, RSS, JSON or only HTML; licence of scraping. Fallback suggestions welcome.

### 10. Open-data counter and latest datasets (hub-search `/search`)
Need: total number of Munich open-data datasets, number modified in the last 30 days, and the three newest with title and modified date.
Research: whether Munich datasets are harvested into `open.bydata.de` (Piveau hub-search; if yes, give the exact `open_data_presence` or `catalog` facet value for Munich and a verified sample URL), and alternatively the CKAN API of `opendata.muenchen.de` (`/api/3/action/package_search`, with `sort=metadata_modified desc`, `rows`, `fq` for a date filter) and GovData. Give working example URLs and their response counts.

## Output format

1. A one-screen **summary table**: endpoint | chosen source | URL | auth | licence | freshness | verdict.
2. Then one section per endpoint with: documentation links, a verified sample request and response excerpt (trimmed), field mapping to our schema, gaps, fallback, and any caveats on terms of use.
3. A final section "Open questions / registrations needed" listing every API key, contract or data-sharing agreement we would have to obtain, with the contact or sign-up URL.
4. German sources are expected; quote them, but write the report in English.
