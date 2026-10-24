// /public/city-info from Wikidata (CC0). Picks the claim a careful reader would:
// non-deprecated, preferred rank first, then the most recent point in time (P585).
// Area only counts when its unit is square kilometre (Q712226).
import { fetchJson } from '../fetch.mjs'
import { provenance, LICENCES } from '../provenance.mjs'

export const QID = 'Q1726'
export const URL_ = `https://www.wikidata.org/wiki/Special:EntityData/${QID}.json`
const KM2 = 'http://www.wikidata.org/entity/Q712226'
const RANK = { preferred: 2, normal: 1, deprecated: -1 }

const pointInTime = c => c.qualifiers?.P585?.[0]?.datavalue?.value?.time?.replace(/^\+/, '') ?? ''

export function pickClaim(claims = [], accept = () => true) {
  return claims
    .filter(c => c.rank !== 'deprecated' && c.mainsnak?.datavalue && accept(c.mainsnak.datavalue.value))
    .sort((a, b) => (RANK[b.rank] - RANK[a.rank]) || pointInTime(b).localeCompare(pointInTime(a)))[0] ?? null
}

// Wikidata dates like "2025-12-31T00:00:00Z" or "2016-00-00T00:00:00Z" (year precision).
const toDate = t => (t ? t.slice(0, 10).replace(/-00/g, '') || null : null)

export function parseCityInfo(entityJson, qid = QID) {
  const e = entityJson.entities[qid]
  const pop = pickClaim(e.claims.P1082)
  const area = pickClaim(e.claims.P2046, v => v.unit === KM2)
  return {
    city: e.labels?.de?.value ?? e.labels?.en?.value ?? null,
    population: pop ? Number(pop.mainsnak.datavalue.value.amount) : null,
    populationDate: pop ? toDate(pointInTime(pop)) : null,
    areaKm2: area ? Number(area.mainsnak.datavalue.value.amount) : null,
    source: `Wikidata ${qid}`,
  }
}

export const load = async () => parseCityInfo(await fetchJson(URL_))

// Main/header image of the Munich dashboard (CC0, see config/munich/assets/images/CREDITS.md).
export const CITY_IMAGE = {
  url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Munich_Marienplatz_Town_Hall_Virgin_Mary.jpg/1280px-Munich_Marienplatz_Town_Hall_Virgin_Mary.jpg',
  localPath: '/config/munich/assets/images/muenchen-header-marienplatz.jpg',
  width: 1280,
  height: 853,
  title: 'Munich Marienplatz Town Hall Virgin Mary',
  author: 'designerpoint',
  licence: { id: 'CC0-1.0', url: 'http://creativecommons.org/publicdomain/zero/1.0/' },
  sourcePage: 'https://commons.wikimedia.org/wiki/File:Munich_Marienplatz_Town_Hall_Virgin_Mary.jpg',
}

export function buildCityInfoResponse(info, { retrievedAt, stale }) {
  return {
    ...info,
    image: CITY_IMAGE,
    fetchedAt: retrievedAt,
    provenance: provenance({
      source: URL_,
      licence: LICENCES.cc0,
      attribution: 'Wikidata',
      retrievedAt,
      observedAt: info.populationDate,
      stale,
      notes: 'Population is the official statistical figure (P1082), not registered residents.',
    }),
  }
}
