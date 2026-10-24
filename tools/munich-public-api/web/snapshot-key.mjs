// Shared by dashboard.js (browser) and build-static.mjs (Node): maps an API call
// (path + query params) to the file name of its static snapshot, so the page
// can run on a static host (GitHub Pages) without the Node server.
//   ('/bike/traffic', { period: '7d', siteId: 'Arnulf' }) -> 'bike/traffic__period-7d__siteid-arnulf.json'
export function slug(v) {
  return String(v ?? '').toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'x'
}

// Calls whose parameters do not change the snapshot.
export const PARAMLESS = new Set()

export function snapshotFile(path, params = {}) {
  const p = PARAMLESS.has(path) ? {} : params
  const parts = Object.keys(p).sort().map(k => `${slug(k)}-${slug(p[k])}`)
  return `${path.replace(/^\//, '')}${parts.length ? `__${parts.join('__')}` : ''}.json`
}
