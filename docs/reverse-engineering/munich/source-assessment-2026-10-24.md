# Munich Smart City Dashboard — verified source assessment

> Produced with ChatGPT research from `research-brief.md`, pasted into the project on 2026-10-24
> and stored here verbatim as the source baseline for the Munich rewrite. Notes added by the
> project team are marked "Project note".
>
> Project note: the participation contact on the unser.muenchen.de project page itself is
> unser.muenchen@muenchen.de; the report below gives unser@muenchen.de.

**Research date: 24 October 2026. Report language: English.** Live checks below were made on that date; timestamps are UTC unless stated otherwise. Values are observations, not permanent service guarantees.

**Decision:** build city facts, the static stop registry, historical bicycle charts and catalogue statistics now. Publicly reusable, complete live transport status still needs coverage/identifier work or an official agreement. Current-week bicycle data is not available from the verified open feed. Parking needs both quality controls and permission. Pedestrian data and the participation API need credentials and publication rights.

The two named OpenAPI attachments were not available in the accessible files. Field mappings therefore implement the condensed contract in the brief, not a validated copy of the complete schemas. In particular, nullable fields, vehicle enums, time formats and the truncated transport-status route must be checked against those files before implementation.

## 1. Summary

“Direct” means one upstream call and small extraction/renaming. “Transform” needs joins, aggregation or caching. “Partial” means the full requested contract is not currently deliverable. A documented authenticated service is not represented as a successfully tested data feed.

| Endpoint | Chosen source / URL | Auth | Licence | Freshness observed / documented | Verdict |
| --- | --- | --- | --- | --- | --- |
| City info | [Wikidata Q1726](https://www.wikidata.org/wiki/Special:EntityData/Q1726.json); official population alternative below | None | CC0 | Population reference 31 Dec 2025; community updates | **Direct** |
| Transport status | [MVV static data](https://www.mvv-muenchen.de/index.php?L=0&id=446) + [gtfs.de RT](https://realtime.gtfs.de/realtime-free.pb); seek BEG feed | None for downloads | MVV CC BY, version unspecified; RT CC BY-SA 4.0 | Static 4–8 weeks; RT 10 seconds | **Partial**: DHID crosswalk and all-mode coverage |
| Departures | Production preference: [BEG/DEFAS](https://www.bayerninfo.de/datenangebot/daten-oev); tested [MVG web API](https://www.mvg.de/api/bgw-pt/v3/departures?globalId=de:09162:2&limit=20&offsetInMinutes=0) as evidence | Agreement for official access; none technically for MVG | Contractual / proprietary | Live predictions; SLA unverified | **Partial**: rights, origin/direction |
| Parking | [PLS HTML](https://pls-muc-z.com/pls/info/parkhaus.html) + [city garage locations](https://opendata.muenchen.de/dataset/parkhaeuser-munchen) | None technically | PLS unknown; locations DL-DE-BY-2.0 | Live-looking table, no source timestamp or verified interval | **Partial** |
| Bike sites | [City WFS dataset](https://opendata.muenchen.de/dataset/opendata_raddauerzaehlstellen) | None | DL-DE-BY-2.0 | Monthly; six registered sites | **Transform** |
| Bike traffic | [City 2026 CSV archive](https://opendata.muenchen.de/dataset/daten-der-raddauerzaehlstellen-muenchen-2026) | None | DL-DE-BY-2.0 | Monthly publication; latest September | **Partial** for rolling current periods |
| Person sites | Passantendaten-Anbieter v2; eight sites in city article | API token | Proprietary, contract required | Active list not authenticated-tested | **Partial** |
| Person traffic | Passantendaten-Anbieter measurements API | API token + subscription | Proprietary, publication rights required | Live advertised; hourly/daily API aggregation | **Partial** until contract and payload test |
| Participation | [unser.muenchen.de API](https://unser.muenchen.de/api/docs) | Admin-issued bearer token | Content rights not an open-data licence | Editorial; no documented SLA | **Partial** until token; then transform |
| Open-data search | [Munich CKAN](https://opendata.muenchen.de/api/3/action/package_search?rows=3&sort=metadata_modified%20desc); [bydata](https://open.bydata.de/api/hub/search/) for native hub compatibility | None | City defaults DL-DE-BY-2.0; check individual records | CKAN current; bydata dates differ materially | **Transform** for combined counts/latest |

For open data/API feeds, automated retrieval is an intended use, subject to attribution, applicable share-alike obligations and reasonable server use. No numeric request limit was found unless stated below. An open licence does not imply unlimited request capacity. Proposed cache intervals below are engineering recommendations, not provider promises.

## 2. City facts — `/public/city-info`

**Verified source:** [Wikidata entity JSON](https://www.wikidata.org/wiki/Special:EntityData/Q1726.json), HTTP 200 at 17:05:58Z. [Wikidata licensing](https://www.wikidata.org/wiki/Wikidata:Licensing) makes structured data CC0. No key or fee. Fetch daily or weekly, not per page view.

Real response excerpt, with unrelated statements removed:

```json
{
  "P1082": {
    "rank": "preferred",
    "mainsnak": {"datavalue": {"value": {"amount": "+1505036"}}},
    "qualifiers": {"P585": [{"datavalue": {"value": {"time": "+2025-12-31T00:00:00Z"}}}]}
  },
  "P2046": {
    "rank": "preferred",
    "mainsnak": {"datavalue": {"value": {"amount": "+310.71", "unit": "http://www.wikidata.org/entity/Q712226"}}}
  }
}
```

This is a trimmed projection of selected claims; the actual property values are arrays inside `entities.Q1726.claims`.

| Required field | Mapping |
| --- | --- |
| population | Preferred valid `P1082` claim → integer 1,505,036 |
| reference date | That claim’s `qualifiers.P585[].datavalue.value.time` → 2025-12-31 |
| area km² | Preferred `P2046` quantity with unit Q712226 → 310.71 |

Do not take the first claim blindly: historic populations and areas with other units are present. Resolve rank, point-in-time and unit. Historical population statements are available, but edits have no guaranteed cadence. The area claim has older reference qualifiers; it is not a newly measured 2026 area.

**Official-source alternative / fallback:** [Munich monthly population dataset](https://opendata.muenchen.de/dataset/monatszahlen-bevoelkerung), [verified CSV](https://opendata.muenchen.de/dataset/ac572882-24c6-4c98-873a-b61c638e058d/resource/2252dc7c-265b-4f21-aa0e-b602c30cb85f/download/bevoelkerung.csv). HTTP 200. DL-DE-BY-2.0, no auth/fee. Latest non-missing overall row observed:

```text
MONATSZAHL = Geschlecht und Staatsangehörigkeit
AUSPRAEGUNG = insgesamt
MONAT = 202603
WERT = 1604731
```

These are registered residents, a different population concept from the official statistical population in the selected Wikidata claim. The dataset contains monthly observations but its metadata specifies half-yearly publication. Later placeholders must not be treated as zero. If municipal registered population is the dashboard’s chosen definition, prefer this official source and join a separately maintained area value: verdict becomes **transform**. Do not alternate between these definitions in a trend. Contact: [stat.amt@muenchen.de](mailto:stat.amt@muenchen.de).

**Verdict: direct with Wikidata; transform with the preferred municipal population definition.**

## 3. Stops and live status — `/public/transport/stations`

### Official static registry: ready

[MVV developer documentation](https://www.mvv-muenchen.de/index.php?L=0&id=446) and both downloads returned HTTP 200:

- [Full MVV GTFS](https://www.mvv-muenchen.de/fileadmin/mediapool/developer/opendata/gesamt_gtfs.zip): 17,880,036 bytes. Covers regional rail, S-Bahn, U-Bahn, tram and buses; normally refreshed every 4–8 weeks with roughly three months of schedules.
- [2026 stop CSV](https://www.mvv-muenchen.de/fileadmin/mediapool/developer/opendata/MVV_Haltestellen_Report_s26.csv): normally annual updates.

Real CSV excerpt:

```csv
HstNummer;Name ohne Ort;Ort;Globale ID;WGS84 X;WGS84 Y
2;Marienplatz;München;de:09162:2;48,1364359;11,577658
6;Hauptbahnhof (S, U, Bus, Tram);München;de:09162:6;48,1403145;11,56112
```

The CSV’s “X” column contains latitude and “Y” longitude in these rows: validate values instead of assuming conventional x/y order. GTFS provides explicit latitude/longitude fields. MVV states CC BY but does not clearly specify its version on the checked page; retain attribution to MVV, download date and feed version. Downloads are free and do not require registration.

| Required field | Mapping / operation |
| --- | --- |
| stationRef | `Globale ID`, or GTFS station `stop_id` / platform `parent_station` |
| name, lat, lon | CSV or GTFS `stop_name`, `stop_lat`, `stop_lon` |
| served vehicle types | Join stops → stop_times → trips → routes; map `route_type` |
| maximum delay minutes | Not in static data; aggregate valid upcoming predictions per parent station |

Use the Munich municipality boundary and/or validated `de:09162:` identifiers. The whole MVV region is larger than the city. Station/platform aggregation must preserve both station DHIDs and boarding-point IDs.

### Official live access: documented, not yet tested with credentials

The MVV developer page still labels TRIAS **“demnächst”** and states closed beta. This is not an openly available production feed.

MVG also publishes [static GTFS documentation](https://www.mvg.de/verbindungen/Fahrplandaten.html) and a [download](https://www.mvg.de/static/gtfs/google_transit.zip), both verified (ZIP: 28,697,689 bytes). The documented weekly Thursday refresh is more frequent, but the checked page did not establish a clear reuse licence. Prefer MVV’s explicitly licensed static feed unless MVG clarifies terms. No directly accessible, officially documented public Munich SIRI endpoint was verified; an aggregator’s inclusion of SIRI-derived data does not grant direct access to the underlying service.

[BEG/Bayerninfo public-transport data offer](https://www.bayerninfo.de/datenangebot/daten-oev) documents DEFAS access through TRIAS/VDV-431 and VDV-453 DFI raw data under agreements. Raw data depends on operator participation and rights; real-time coverage is not universal. General provision can be free, while special exports may incur costs. Contract credentials, available operators, allowed republication, rate limits and retention require confirmation. No authenticated payload was tested.

### Usable open real-time fallback: gtfs.de

[Documentation](https://gtfs.de/de/realtime/) and [public protobuf feed](https://realtime.gtfs.de/realtime-free.pb) were verified. HTTP 200 at 17:08:15Z, 16,815,984 bytes; decoded header timestamp 1792861671, equivalent to 17:07:51Z. The feed is updated every 10 seconds, free, no auth, **CC BY-SA 4.0**, and explicitly includes DEFAS Bayern under a provider agreement. No historical query service or numeric quota was confirmed.

I also downloaded the [matching free local-transport GTFS](https://download.gtfs.de/germany/nv_free/latest.zip), HTTP 200, 276,829,000 bytes. [Static feed documentation](https://gtfs.de/de/feeds/de_nv/): CC BY 4.0, weekly free release, approximately 30-day horizon. These are different licences for static and realtime data.

Decoded real TripUpdate, joined to that matching static feed:

```json
{
  "entity_id": "1180317tu",
  "trip_id": "1180317",
  "stop_id": "296360",
  "stop_name": "Marienplatz",
  "stop_sequence": 14,
  "route_short_name": "U6",
  "route_type": "1",
  "departure": {"delay": 23, "time": 1792862553}
}
```

Here delay is **seconds**, not minutes. The local-transport join also found Munich bus and tram updates. Its free IDs are internal numeric strings, not DHIDs; the downloaded stops file did not supply a DHID crosswalk. Do not join its trip IDs directly to MVV GTFS. The tested local feed excludes rail/S-Bahn: a matching rail feed or another source still needs verification before promising all modes. A broad bounding-box count is not evidence of complete city coverage.

[Extended gtfs.de services](https://gtfs.de/de/services/) advertise IFOPT identifiers and richer metadata. Published starting prices for selective static feeds were €39/month for quarterly, €54 for monthly and €69 for weekly refresh. These are **not a verified quote for a complete Munich integration**; confirm scope, VAT, identifier mapping and matching RT feed with [info@gtfs.de](mailto:info@gtfs.de).

### Undocumented MVG backend: technically works, permission required

[Stations request](https://www.mvg.de/api/bgw-pt/v3/stations) returned HTTP 200. Real selected record:

```json
{"globalId":"de:09162:2","name":"Marienplatz","place":"München",
 "latitude":48.137245,"longitude":11.575421,
 "transportTypes":["SBAHN","UBAHN","BUS"],"divaId":2}
```

The response contained 1,117 records with the city DHID prefix, but that is not a verified count of currently active stations. It contains no delay field. Polling departures once per minute for every record would exceed 1,100 requests/minute.

[MVG terms](https://www.mvg.de/impressum.html) state: **“Die Verarbeitung unserer Inhalte oder Daten durch Dritte erfordert unsere ausdrückliche Zustimmung.”** Moderate private use is not a licence for a public dashboard or bulk polling. This backend is undocumented, without a published quota or SLA. Technical absence of authentication is not permission.

**Implementation:** define a prediction window, e.g. the next 60 minutes; compute the maximum valid departure delay, normalize seconds to minutes with a specified rounding policy, and expose prediction freshness. Missing predictions must be null/unknown, not “on time.” Handle cancellations separately. Refresh your backend once per minute from a bulk feed, not once per visitor or per station. Retain snapshots only as licensed; no historical delay API was verified.

**Verdict: partial today.** Static stops are transform-ready; complete live DHID-based status is not. **Fallback:** publish static stops without delay, or label verified-mode coverage explicitly while obtaining BEG/MVV access and an identifier crosswalk.

## 4. Departure board — `/public/transport/departures?stationRef=`

Use **Marienplatz, `de:09162:2`**. [Verified MVG request for 20 departures](https://www.mvg.de/api/bgw-pt/v3/departures?globalId=de:09162:2&limit=20&offsetInMinutes=0) returned HTTP 200 and 20 entries. This is a successful technical test of an undocumented endpoint, not publication authorization.

Real first entry, trimmed:

```json
{
  "plannedDepartureTime":1792861380000,
  "realtime":true,
  "delayInMinutes":3,
  "realtimeDepartureTime":1792861560000,
  "transportType":"SBAHN",
  "label":"S3",
  "destination":"Holzkirchen",
  "cancelled":false,
  "stationGlobalId":"de:09162:2",
  "lineId":"ddb:920S3:A:H:j26",
  "tripCode":195
}
```

| Required field | MVG mapping | Limitation |
| --- | --- | --- |
| line | `label` | — |
| destination | `destination` | — |
| origin | Not returned | Need an authorized trip lookup/static trip join; otherwise null |
| vehicle type | `transportType` | Map enum |
| timetabled time | `plannedDepartureTime`, Unix milliseconds | Convert consistently |
| estimated time | `realtimeDepartureTime` when `realtime=true` | When false, returned time can just equal timetable |
| delay minutes | `delayInMinutes` where prediction exists | Absent is not a measured zero |
| direction | Destination can supply display text | No verified canonical direction field; do not parse opaque `lineId` |

For the open gtfs.de alternative, the real U6 sample above has scheduled departure `19:22:10` and predicted `19:22:33` Europe/Berlin, delay 23 seconds. The matching stop_times row was:

```csv
1180317,19:21:30,19:22:10,296360,14,Goetheplatz,,
```

`stop_headsign` provides Goetheplatz; origin can be derived from the first relevant scheduled stop (Garching, Forschungszentrum in this sample). The free trips file lacked `direction_id` and `trip_headsign`. Join on trip, service date and stop sequence; support GTFS times beyond 24:00, calendar exceptions, cancelled/skipped calls and added trips. Sort future predictions before selecting 20; do not take the first 20 feed entities.

**Access, rights and freshness:** MVG constraints from section 3 apply; seek written agreement. BEG/DEFAS is the preferred official route but not authenticated-tested. gtfs.de offers a tested open alternative requiring static joins, a DHID crosswalk and rail coverage verification.

**National fallback:** [DB Timetables API](https://developers.deutschebahn.com/db-api-marketplace/apis/product/timetables) is documented as free, CC BY 4.0, 60 requests/minute, with registered application credentials. It uses **EVA station IDs**, XML, and separate planned/change endpoints (`/plan/{evaNo}/{date}/{hour}`, `/fchg/{evaNo}`, `/rchg/{evaNo}`). No credentialed call was made. It cannot supply the whole U-Bahn/tram/bus network. Contact [IRIS-TTS.API@deutschebahn.com](mailto:IRIS-TTS.API@deutschebahn.com).

**Verdict: partial; transform after access and missing-field decisions. Fallback:** licensed static timetable clearly labelled “scheduled,” or a link to the official departure board.

## 5. Parking — `/public/parking`

### Official locations: available, not occupancy

[City dataset](https://opendata.muenchen.de/dataset/parkhaeuser-munchen), [JSON resource](https://opendata.muenchen.de/dataset/addaa7d4-40be-4621-846e-c5358cbe3f26/resource/76554a21-34bc-4f62-b609-8af20e0ad9d7/download/parkhaeuser-places-260224.json): HTTP 200, 26,983 bytes. DL-DE-BY-2.0; no auth or fee; irregular snapshot dated 24 February 2026. IDs are portal place IDs, not PLS IDs. A record contains id `1224104`, title `Tiefgarage P&R Fürstenried`, and location approximately 48.087114 / 11.4847368. No live availability fields are present.

### PLS occupancy: reachable HTML, important defects

[PLS table](https://pls-muc-z.com/pls/info/parkhaus.html) returned HTTP 200 at 17:19:10Z. The exact host/path matters: other host/root variants failed in testing. It is HTML, not a documented JSON API.

Real table cells, transcribed:

| S/N | PH | Name | Frei | Kap |
| --- | --- | --- | ---: | ---: |
| 106504 | P18 | City-Parkhaus am Färbergraben | 266 | 350 |
| 106505 | P5 | Rieger-City | 135 | 371 |
| 106521 | P23 | CarParkCristal | 428 | 220 |
| 106513 | P20 | Hotel Ibis | 39 | 0 |

The latter rows fail `0 ≤ free ≤ capacity`. Some entries appear old/inactive; colour semantics are not formally documented. The response has **no measurement timestamp**, no coordinates and no documented status enumeration or update cadence. A second check roughly one minute later returned unchanged values. This does not establish either a minute-by-minute feed or staleness of every row.

| Required field | Mapping / gap |
| --- | --- |
| id | PLS `PH` or composite S/N + PH; S/N alone is not unique for all entries |
| name | Parkhaus cell |
| lat, lon | Join municipal locations/manual verified crosswalk; names alone are unsafe |
| total spaces | `Kap`, after validation |
| free | `Frei`, after validation |
| occupied | `Kap − Frei`, derived only for valid observations |
| status | Unknown unless provider supplies documented semantics |
| timestamp | **Missing**. Retrieval time must not masquerade as measurement time |

No open licence or permission for automated scraping/republication of this table was confirmed. Obtain permission and a documented machine feed from the city/operator before using it in production. Mobilithek/GovData search confirmed static parking metadata, but did not yield a verified open Munich live-occupancy feed; a catalogue listing alone is not a live feed.

### Community alternative: useful evidence, insufficient cadence/rights

[parkraumwende latest JSON](https://data.parkraumwende.de/data/latest.json), [coordinates CSV](https://data.parkraumwende.de/data/parkhaeuser.csv), [source registry](https://data.parkraumwende.de/data/source-registry.json) and [terms/source page](https://data.parkraumwende.de/quellen.html) were reachable.

Real JSON excerpt:

```json
{"timestamp":"2026-10-24 19:02:02","frei_gesamt":1301,
 "belegt_gesamt":3154,"kap_gesamt":4455,
 "parkhaeuser":[{"sn":"106504","ph":"P18",
 "parkhaus":"City-Parkhaus am Färbergraben","frei":240,"kap":350,"aktiv":true}]}
```

Array excerpt selects one record. The timestamp has no timezone offset. Its registry says **“alle 2 Stunden (Server-Cron)”** and identifies PLS as upstream. Thus it misses the requested few-minute refresh. Own compilations are CC BY 4.0; third-party source rights remain separate. `aktiv` is the community layer’s classification, not a documented PLS status. An advertised monthly history path tested with October 2026 returned 404, so historical access is unverified.

**Verdict: partial. Fallback:** municipal static garage map with no occupancy/status claim, or drop availability. Contact [data.opengov@muenchen.de](mailto:data.opengov@muenchen.de) / [redaktion@portalmuenchen.de](mailto:redaktion@portalmuenchen.de) to identify the responsible PLS data owner.

## 6. Bicycle sites — `/public/bike/sites`

[Official WFS dataset documentation](https://opendata.muenchen.de/dataset/opendata_raddauerzaehlstellen); [verified GeoJSON request](https://geoportal.muenchen.de/geoserver/mor_wfs/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=mor_wfs:raddauerzaehlstellen&outputFormat=application/json). HTTP 200 at 17:09:42Z; six features, not roughly a dozen. DL-DE-BY-2.0, no auth/fee, monthly metadata cadence, no numeric quota found.

Real feature properties, trimmed:

```json
{"zaehlstelle":"Arnulf","zaehlstelle_lang":"Arnulfstr. 9 - 11 Südseite",
 "latitude":48.14205,"longitude":11.55534,
 "richtung_1":"Ost","richtung_2":"West",
 "gesamt_sum_monat":"September: 56.000"}
```

| Site ID | Latitude | Longitude |
| --- | ---: | ---: |
| Arnulf | 48.14205 | 11.55534 |
| Kreuther | 48.12194 | 11.62417 |
| Olympia | 48.16887 | 11.55005 |
| Hirsch | 48.14438 | 11.51794 |
| Margareten | 48.12032 | 11.53599 |
| Erhardt | 48.13192 | 11.58469 |

| Required field | Mapping |
| --- | --- |
| id | `zaehlstelle` short string; shared with CSV data |
| name | `zaehlstelle_lang` |
| lat/lon | Explicit `latitude` / `longitude` properties |
| first/last data date | Derive per site from archived observations, not WFS publication date |
| granularity | `PT15M` for the underlying interval CSV; publication is monthly |

The default geometry coordinates are projected EPSG:25832; do not interpret them as longitude/latitude. The explicit properties are usable. Rounded monthly strings are not suitable for reconstructing the time series. Margareten remains in the registry but is documented as damaged and is absent from the latest measurement file.

Historical archives exist across years; determine first data date separately for every site rather than assigning the archive’s earliest year to all sensors. Cache the registry and refresh monthly. Contact [gb1-4.mor@muenchen.de](mailto:gb1-4.mor@muenchen.de).

**Verdict: transform. Fallback:** a curated version of this official six-site registry, with availability dates left unknown until calculated.

## 7. Bicycle counts — `/public/bike/traffic?period=7d|30d&siteId=`

[2026 dataset/documentation](https://opendata.muenchen.de/dataset/daten-der-raddauerzaehlstellen-muenchen-2026), [September 15-minute CSV](https://opendata.muenchen.de/dataset/20d08df2-203a-4f99-968f-add90f86818a/resource/1da5b9c9-7e62-464c-b400-659d7accce9b/download/rad_2026_09_15min.csv), HTTP 200. Real excerpt:

```csv
datum,uhrzeit_start,uhrzeit_ende,zaehlstelle,richtung_1,richtung_2,gesamt
2026.09.01,00:15,00:30,Arnulf,4,0,4
2026.09.01,00:30,00:45,Arnulf,2,1,3
```

The verified September file has 14,400 rows: five reporting sites × 30 days × 96 intervals. Arnulf, Kreuther, Olympia, Hirsch and Erhardt report; Margareten does not. The dataset lists January–September resources. On **24 October, the newest observations were 30 September**: this is not usable for “this week versus last week.”

| Required field / behaviour | Mapping |
| --- | --- |
| siteId | `zaehlstelle` |
| bucket timestamp | `datum` + `uhrzeit_start`, interpreted in Europe/Berlin |
| count | Sum `gesamt` in the desired bucket |
| hourly, 7-day chart | Aggregate 15-minute rows; fetch 14 days including previous period |
| daily, 30-day chart | Aggregate daily; fetch 60 days including previous period |
| historical comparison | Read adjacent monthly/yearly files; August and September are available |

Do not add `gesamt` to directional counts: that double-counts. Missing intervals/sites are unknown, not zero. Handle DST explicitly; local timestamps alone may be ambiguous around clock changes. Validate completeness before percentage comparisons; previous-period zero must not cause division by zero.

**Terms/access:** DL-DE-BY-2.0; no auth or fee. Monthly downloads are intended open-data use, no numeric quota found. Historic files are available, but publication lag is intrinsic. Daily weather resources also exist. Neither an Eco-Counter public Munich live feed nor an alternative Mobilithek near-real-time feed was verified; they are not proposed as working substitutes.

**Verdict: partial for the requested rolling current periods; transform for historical charts. Fallback:** explicitly anchor charts to the latest complete published period, show “Data through 30 September 2026,” or use the latest complete month. Request a live/near-live upstream feed from [verkehrsdaten.mor@muenchen.de](mailto:verkehrsdaten.mor@muenchen.de); otherwise drop the current-week comparison.

## 8. Pedestrian sites — `/public/person/sites`

The [municipal article supplied in the brief](https://muenchen.digital/meldungen/digitaler-zwilling/2024/passantenfrequenzen-de.html) remains reachable. It describes eight Passantendaten-Anbieter locations: **Kaufingerstraße, Maximilianstraße, Neuhauser Straße Ost, Neuhauser Straße West, Schützenstraße, Sendlinger Straße, Tal and Theatinerstraße**. This is a 2024 source, not independent confirmation that all eight are still active in 2026.

The article’s FROST/SensorThings and Kibana pipeline is intended for city departments. No public URL for its SensorThings service, public dashboard or open redistribution licence was verified. Therefore it cannot currently be specified as a public upstream endpoint. A CKAN search for Passanten returned no datasets; that is a search result, not proof that no municipal agreement is possible.

**Verified provider documentation:** Passantendaten-Anbieter API v2, OpenAPI YAML, both HTTP 200. Base URL: `<Anbieter-API>`.

Live request to GET /locations without credentials returned **HTTP 401**:

```json
{"error":"X-API-TOKEN"}
```

This proves the endpoint exists and requires authentication; it does **not** verify a Munich locations payload. Documentation specifies a `locations` array with numeric `id`, `name`, `city`, `state`, `country`. Location detail provides local timezone and earliest/latest measurement dates. Filter Munich, retain provider IDs internally and map the UI’s `siteName` to an ID. Names alone should not be treated as immutable identifiers.

| Required field | Mapping / verification |
| --- | --- |
| site name | Documented `locations[].name`; authenticated Munich values pending |
| internal stable key | Documented numeric `id` |
| active coverage | Confirm authenticated list/detail; do not assume the 2024 list is current |

**Access/terms:** proprietary API subscription; `X-API-TOKEN`. Register and request access through developer page. The trial is limited to a Limburg location, not Munich. No public numeric quota or site-list update SLA was confirmed. Publication and polling must be covered by the API contract.

**Verdict: partial. Fallback:** a manually maintained, clearly dated eight-location list sourced from the city article; if active coverage is essential, hide the tile until verified. Ask the Digital Twin team for a permitted municipal feed instead of trying to discover an internal FROST endpoint.

## 9. Pedestrian counts — `/public/person/traffic?period=&siteName=`

**Candidate after registration:** Passantendaten-Anbieter v2, using the same verified OpenAPI. No authenticated Munich measurements were obtained, so no example below is represented as a real Munich observation.

Documented request pattern:

```text
GET <Anbieter-API>/locations/{numeric_id}/measurements
    ?from={RFC3339}&to={RFC3339}&resolution=hour
    &with_object_type=PERSON&with_measured_data_only=true
X-API-TOKEN: {contract_token}
```

Schema excerpt, **documentation only**:

```text
location_id, name, city, local_timezone, measurement_period
measurements[].measured_at
measurements[].measured_at_local_time
measurements[].total_count
measurements[].counts[].{direction,count,object_type,object_subtype,collection_type,zone}
```

| Required field / behaviour | Mapping / operation |
| --- | --- |
| siteName | Resolve against location registry to numeric ID |
| timestamp | `measured_at`; use `local_timezone` for display/bucketing |
| hourly counts | `resolution=hour`, PERSON totals, adults and children included |
| daily counts | `resolution=day`, or aggregate complete hourly observations |
| previous 7/30 days | Request 14/60 days and split consistently |
| data quality | Inspect measured versus modelled records, completeness and zones |

The v2 enum is **hour, day, week, month**, not 15-minute. Hourly is sufficient for the requested chart. The city article describes 15-minute data in its own pipeline; that is not proof the public API subscription offers it. Maximum documented request range is 366 days. History, resolution entitlement and retention depend on the contract and location start date. Some older API documentation warns that access periods/resolution are subscription-dependent; validate actual returned bounds, not only requested parameters. Do not sum both total_count and its breakdown. Distinguish unavailable intervals from measured zero.

**Pricing and rights, checked in 2026:** public products, developer offering, terms. The published annual **website** packages are Basic €700/location/year, Premium €1,100 and Professional €1,660 (monthly equivalents €58.33, €91.67 and €138.33). These are **not published API prices**. API access is offered separately by quotation; no precise public Munich API tariff was found. Obtain the exact price for eight locations, hourly/day resolution, at least 60 days of history and public display. Do not assume Professional automatically includes API rights. Free private use and Basic/Premium internal business use do not authorize this public dashboard. Automated polling, redistribution, caching/retention, attribution, quotas and VAT must be confirmed in the agreement. Real-time availability is advertised, but a latency SLA was not verified.

**Verdict: partial / unavailable for production until licensed access is tested. Fallback:** ask the city to redistribute its existing licensed data; otherwise link to Passantendaten-Anbieter or drop the counts tile. Contact Anbieter-Kontakt, Passantendaten-Anbieter contact, or the [city Digital Twin project](https://muenchen.digital/projekte/digitaler-zwilling.html).

## 10. Participation projects — `/public/machmit-projects`

**Use [unser.muenchen.de](https://unser.muenchen.de/), not `unser-muenchen.de`.** The [municipal platform description](https://stadt.muenchen.de/infos/beteiligungsplattform.html), public project pages, [API documentation](https://unser.muenchen.de/api/docs) and [OpenAPI YAML](https://unser.muenchen.de/api_docs/v1/swagger.yaml?v=1792757180) were reachable in 2026.

This platform has a documented API: HTML scraping is not necessary once a token is issued.

Verified request:

```text
GET https://unser.muenchen.de/api/projekts
    ?filter=index_order_underway&only_public=true&page=1&per_page=50
```

Without credentials, HTTP 401:

```json
{"error":{"type":"unauthorized","messages":["Invalid or missing API token."]}}
```

The docs require a bearer token created by the administrator. Request `public_data` access, not admin. No self-service token signup, public tariff or numeric limit was confirmed. An authenticated project payload remains untested.

| Required field | Documented mapping | Gap / rule |
| --- | --- | --- |
| title | `title` / `page.title`; fallback `name` | Public page title preferred over internal name |
| subtitle | `subtitle` | Nullable |
| URL | Base URL + `page.slug` | Validate against public canonical route after token access |
| image | `image.url` or requested variant; `page.image` fallback | Nullable; preserve image credits and obtain display rights |
| start date | `total_duration_start` | Nullable; not `created_at` |
| end date | `total_duration_end` | Nullable |
| internal ID | Numeric `id` | Stable join/dedup key |
| current participation | `filter=index_order_underway` | Documented as an active contribution phase |

`index_order_ongoing` instead means within the project date range **without** a currently accepting phase. Decide whether the card list means “can participate now” or all ongoing projects; use the appropriate filters/union. `include_phases=true` provides phase details. Paginate rather than assuming the first 50 are exhaustive. `image_variant_versions=600` is documented for image variants. Refresh hourly/daily as an initial conservative policy, subject to operator agreement. Historical/expired project retrieval is documented; it is not a version-history API.

[Platform conditions](https://unser.muenchen.de/conditions) did not establish an open-data licence for project text and images. The underlying software’s open-source licence is not a content licence. Request permission for public excerpts/images and agreed polling with the token. The actual page may omit a subtitle, image or dates: use schema-approved nulls or editor-provided replacements, never invented dates.

**Other platforms:** [München mitdenken](https://muenchen-mitdenken.de/) was reachable, but no usable API/RSS was verified. It covers particular planning participation rather than necessarily all city projects. Council/borough portals describe political records, not equivalent participation cards.

**Verdict: partial today; transform once token, content rights and nullability are resolved. Fallback:** curated cards with original short descriptions and links, omitting unlicensed images, or a single link to the official participation overview. Contact [unser@muenchen.de](mailto:unser@muenchen.de).

## 11. Open-data counter and latest datasets — hub `/search`

### Preferred facts: official Munich CKAN

[CKAN action documentation](https://opendata.muenchen.de/api/3/action/help_show?name=package_search) returned HTTP 200. No auth/key/fee. Server-side API retrieval is intended; no numeric quota found. Use a shared hourly/daily cache. The [portal terms](https://opendata.muenchen.de/pages/nutzungsbedingungen) set the municipal attribution framework; inspect dataset-level licences rather than assuming every linked external resource has the same terms.

**Total and newest by modification, verified HTTP 200:**

[Working request](https://opendata.muenchen.de/api/3/action/package_search?rows=3&sort=metadata_modified%20desc)

```json
{"success":true,"result":{"count":337,"results":[
  {"title":"Grundwasserpotential","metadata_modified":"2026-10-24T05:45:14.978651"},
  {"title":"Solarpotenzialanalyse 2018 der Landeshauptstadt München","metadata_modified":"2026-10-24T05:45:14.935684"},
  {"title":"Wärmedichte","metadata_modified":"2026-10-24T05:45:14.811657"}
]}}
```

**Modified in 30 days, verified HTTP 200 at 17:21:37Z:**

[Working date-filtered request](https://opendata.muenchen.de/api/3/action/package_search?fq=metadata_modified%3A%5B2026-09-24T17%3A00%3A00Z%20TO%202026-10-24T17%3A00%3A00Z%5D&rows=0)

```json
{"success":true,"result":{"count":86,"results":[]}}
```

Window: 24 September 2026 17:00:00Z through 24 October 2026 17:00:00Z. Replace these dates at runtime. Other periods can use the same `fq` syntax.

| Required field | Mapping |
| --- | --- |
| total datasets | Unfiltered `result.count` |
| modified within period | Date-filtered `result.count` |
| three titles | `result.results[].title` |
| modified date | `metadata_modified` |
| dataset identifier / URL | UUID `id`; `https://opendata.muenchen.de/dataset/` + `name` |

This is two upstream calls, not one. Metadata modification does not prove the observations changed. If “newest” means newly published rather than recently modified, sort `metadata_created desc` instead. Historical counts of the entire catalogue require your own snapshots.

### bydata: Munich is harvested; exact facet verified

[Hub-search documentation](https://open.bydata.de/api/hub/search/) and [OpenAPI](https://open.bydata.de/api/hub/search/openapi.yaml) were reachable. **The working facet is `catalog:["muenchen"]`.** Do not guess an `open_data_presence` value.

[Verified native hub request](https://open.bydata.de/api/hub/search/search?filter=dataset&facets=%7B%22catalog%22%3A%5B%22muenchen%22%5D%7D&limit=3&sort=modified%2Bdesc)

HTTP 200; response projection:

```json
{"result":{"count":337,"results":[
  {"title":{"de":"Bestattungen und Beisetzungen städtische Friedhöfe München"},"modified":"2026-08-24T13:25:14Z"},
  {"title":{"de":"Liste städtische Friedhöfe München"},"modified":"2026-08-24T13:18:21Z"},
  {"title":{"de":"Sonstige Abfallentsorgungsanlagen (Opendata)"},"modified":"2026-08-24T06:47:11Z"}
]}}
```

Catalogue identity in returned records: `catalog.id="muenchen"`, `catalog.title.de="Stadt München"`. The tested alternative `open_data_presence:["muenchen.bydata"]` returned zero; broad text search for München includes unrelated catalogues.

[Verified 30-day bydata request](https://open.bydata.de/api/hub/search/search?filter=dataset&facets=%7B%22catalog%22%3A%5B%22muenchen%22%5D%7D&limit=0&dateType=modified&minDate=2026-09-24T17%3A00%3A00Z&maxDate=2026-10-24T17%3A00%3A00Z)

The equivalent tested date window returned **0**, versus CKAN’s **86**. Although total counts match at 337, the modification dates demonstrably do not. Possible causes include harvesting lag or different mapped date semantics; this test does not establish which. Do not present bydata’s “modified recently” value as equivalent to CKAN’s without resolving that discrepancy. Verify the displayed URL’s parameter values against the hub schema when integrating; `sort=modified%2Bdesc` encodes a literal plus.

No auth or fee was required. No numeric quota or guaranteed harvest interval was confirmed. The catalogue carries resource licences; no blanket licence for all bydata contents was established. A DL-DE-BY licence on a Munich distribution does not automatically license unrelated catalogue resources.

**Verdict: transform using CKAN for consistent current statistics.** If the tenth request must remain a direct Piveau hub-search call, bydata is compatible and its catalogue facet is verified, but the freshness semantics are **partial**. That is a product decision, not a reason to silently swap protocols. **Fallback:** cached CKAN statistics with retrieval time; on outage show stale/unknown, not zero. GovData contains Munich metadata but was not verified as an equivalent city-total/latest API and may include multiple harvested representations.

## 12. Open questions / registrations needed

| Priority | Obtain / decide | Contact or signup |
| --- | --- | --- |
| 1 — live transport | BEG/DEFAS agreement: all Munich modes, DHIDs/platform hierarchy, prediction fields, public redistribution, bulk delivery, quota and retention | [Bayerninfo data offer](https://www.bayerninfo.de/datenangebot/daten-oev) |
| 1 — MVV option | Eligibility for the closed-beta TRIAS developer programme and production release terms | [MVV developer area](https://www.mvv-muenchen.de/index.php?L=0&id=446) |
| 1 — MVG option | Express permission for automated public-dashboard use; documented replacement for web backend; approved polling budget | [MVG imprint/contact](https://www.mvg.de/impressum.html), [redaktion@mvg.de](mailto:redaktion@mvg.de) |
| 1 — open transport fallback | Matching rail coverage, DHID crosswalk, richer trip metadata, CC BY-SA attribution/share-alike implementation and a Munich price | [gtfs.de services](https://gtfs.de/de/services/), [info@gtfs.de](mailto:info@gtfs.de) |
| 1 — pedestrians | Quote for eight Munich locations, hourly/day history, public display, token, retention, rate limits and latency; authenticate and test actual payload | Passantendaten-Anbieter developer, Anbieter-Kontakt |
| 1 — municipal pedestrian alternative | Whether the existing city FROST data can legally/technically be exposed to this dashboard | [Digital Twin project](https://muenchen.digital/projekte/digitaler-zwilling.html) |
| 1 — participation | `public_data` bearer token, text/image redistribution, canonical URL mapping, polling quota | [unser@muenchen.de](mailto:unser@muenchen.de), [API docs](https://unser.muenchen.de/api/docs) |
| 1 — parking | Actual data owner, licensed machine endpoint, measurement timestamp, status meanings, active inventory, capacities and coordinate/ID crosswalk | [data.opengov@muenchen.de](mailto:data.opengov@muenchen.de), [city parking dataset](https://opendata.muenchen.de/dataset/parkhaeuser-munchen) |
| 2 — bike live data | Whether a permitted near-live feed exists; sensor outages and history per site | [verkehrsdaten.mor@muenchen.de](mailto:verkehrsdaten.mor@muenchen.de) |
| 2 — rail fallback | Register DB application credentials, then test planned and changed departures | [DB API marketplace](https://developers.deutschebahn.com/db-api-marketplace/apis/product/timetables) |
| 2 — national stop alignment | DELFI/zHV registration or automated stop service if needed; this supplies identifiers, not automatically complete realtime | [DELFI services](https://www.delfi.de/de/leistungen-produkte/daten-dienste/), [zHV](https://zhv.wvigmbh.de/), [info@delfi.de](mailto:info@delfi.de) |
| 2 — catalogue | Explain bydata/CKAN modification-date discrepancy; choose native hub compatibility versus current CKAN semantics | [bydata API docs](https://open.bydata.de/api/hub/search/), [data.opengov@muenchen.de](mailto:data.opengov@muenchen.de) |
| Implementation | Supply full OpenAPI files; agree nullable fields, population definition, “currently running,” delay window/rounding, and explicit historical bike labels | Project team |

No registration, paid subscription, agreement or message to any provider was initiated during this research. Sources blocked by authentication were checked only to the extent available without credentials. Do not treat their documented example data as production verification.
