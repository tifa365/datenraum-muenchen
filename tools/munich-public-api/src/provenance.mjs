// Every response carries where its data came from. retrievedAt is when *we*
// fetched it; observedAt is when the *source* says it was measured, and stays
// null when the source does not say. stale=true means the last refresh failed
// and an older snapshot is being served.
export function provenance({ source, licence, attribution, retrievedAt, observedAt = null, stale = false, notes }) {
  const p = { source, licence, attribution, retrievedAt, observedAt, stale }
  if (notes) p.notes = notes
  return p
}

export const LICENCES = {
  dlDeBy2: { id: 'DL-DE-BY-2.0', url: 'https://www.govdata.de/dl-de/by-2-0' },
  cc0: { id: 'CC0-1.0', url: 'https://creativecommons.org/publicdomain/zero/1.0/' },
  ccBy4: { id: 'CC-BY-4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
  unknown: { id: 'unknown', url: null },
  proprietary: { id: 'proprietary', url: null },
}
