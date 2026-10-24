// Munich Smart City Dashboard widgets (no framework). Behaviour mirrors the
// Augsburg dashboard: same API contract (see docs/reverse-engineering), refresh
// cadence, sorting/filtering and empty states. Data comes from munich-public-api.
import { snapshotFile } from './snapshot-key.mjs'

// Live mode: API_BASE_URL '/public' (Node server). Static mode (GitHub Pages): STATIC true,
// API_BASE_URL points to the folder of JSON snapshots written by build-static.mjs.
const ENV = window.__ENV__ ?? {}
const API = (ENV.API_BASE_URL ?? '/public').replace(/\/$/, '')
const STATIC = ENV.STATIC === true
// Asset paths from the API are site-absolute ('/config/...'); make them relative so the
// page also works under a sub-path such as https://<user>.github.io/<repo>/.
const asset = p => (p ? String(p).replace(/^\//, '') : p)
const IMG = 'config/munich/assets/images'

const nf = new Intl.NumberFormat('de-DE')
const nf1 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const pct = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: 'always' })
const compact = new Intl.NumberFormat('de-DE', { notation: 'compact', maximumFractionDigits: 1 })
const dFull = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
const dShort = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' })
const tClock = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' })

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const num = v => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v)) ? null : Number(v))
const toDate = s => { if (!s) return null; if (/^\d{4}-\d{2}-\d{2}$/.test(s)) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) } const d = new Date(s); return Number.isNaN(d.getTime()) ? null : d }
const fmtDate = s => (toDate(s) ? dFull.format(toDate(s)) : null)
const fmtShort = s => (toDate(s) ? dShort.format(toDate(s)) : null)
const range = (a, b) => { const x = fmtShort(a), y = fmtShort(b); return !x && !y ? null : !x ? y : !y || x === y ? x : `${x} bis ${y}` }
function apiUrl(path, params = {}) {
  if (STATIC) return `${API}/${snapshotFile(path, params)}`
  const qs = new URLSearchParams(params).toString()
  return `${API}${path}${qs ? `?${qs}` : ''}`
}
async function getJson(path, params = {}, init = {}) {
  const r = await fetch(apiUrl(path, params), { headers: { accept: 'application/json' }, cache: 'no-store', ...init })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}
const credit = img => (img ? `<a class="credit" href="${esc(img.sourcePage)}" target="_blank" rel="noopener noreferrer">${esc(img.attribution ?? `Foto: ${img.author}, ${img.licence?.id}`)}</a>` : '')

class Widget extends HTMLElement {
  connectedCallback() { this.state = this.initialState?.() ?? {}; this.render(); this.start?.() }
  disconnectedCallback() { for (const t of this.timers ?? []) clearInterval(t); this.stop?.() }
  every(ms, fn) { (this.timers ??= []).push(setInterval(fn, ms)) }
  set(patch) { Object.assign(this.state, patch); this.render() }
}

// ------------------------------------------------------------ city info
customElements.define('city-info-widget', class extends Widget {
  initialState() { return { loading: true, city: 'München', population: null, populationDate: null, areaKm2: 310.7, image: null } }
  async start() {
    try {
      const c = await getJson('/city-info')
      this.set({ loading: false, city: c.city ?? 'München', population: num(c.population), populationDate: c.populationDate ?? null, areaKm2: num(c.areaKm2) ?? this.state.areaKm2, image: c.image ?? null })
    } catch (e) { console.warn('Stadtinformationen konnten nicht geladen werden:', e); this.set({ loading: false }) }
  }
  render() {
    const s = this.state, sk = '<span class="skeleton"></span>'
    const bg = s.image ? `background-image:url('${esc(asset(s.image.localPath))}')` : `background-image:url('${IMG}/muenchen-header-marienplatz.jpg')`
    this.innerHTML = `
      <article class="card city" style="${bg}" aria-busy="${s.loading}">
        ${s.image ? `<span class="credit">Foto: ${esc(s.image.author)}, ${esc(s.image.licence?.id)}</span>` : ''}
        <div class="inner">
          <div><h2>${esc(s.city)}</h2><p class="sub">Smart City Dashboard</p><div class="meta">Bayern &middot; Deutschland</div></div>
          <div>
            <div class="metrics" aria-label="Stadtkennzahlen">
              <div class="metric"><b>${s.loading ? sk : s.population === null ? '&ndash;' : nf.format(s.population)}</b><span>Einwohner</span></div>
              <div class="metric"><b>${s.loading ? sk : `${nf1.format(s.areaKm2)} km&sup2;`}</b><span>Fl&auml;che</span></div>
            </div>
            <div class="date">Datenstand: ${s.loading ? sk : fmtDate(s.populationDate) ?? '&ndash;'}</div>
          </div>
        </div>
      </article>`
  }
})

// ------------------------------------------------------------ transport
const QUICK_STOPS = [
  { label: 'Marienplatz', stationRef: 'de:09162:2' },
  { label: 'Hauptbahnhof', stationRef: 'de:09162:6' },
  { label: 'Sendlinger Tor', stationRef: 'de:09162:50' },
]
const TYPE_LABEL = { all: 'Alle', city: 'Stadtverkehr', sbahn: 'S-Bahn', ubahn: 'U-Bahn', tram: 'Tram', bus: 'Bus', 'regional-train': 'Regio', 'long-distance-train': 'Fern', other: 'ÖPNV' }
const TYPE_ORDER = ['sbahn', 'ubahn', 'tram', 'bus', 'regional-train', 'long-distance-train', 'other']
const CITY_TYPES = new Set(['sbahn', 'ubahn', 'tram', 'bus'])
const fold = s => String(s ?? '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
function vehicleType(type, raw, line) {
  const s = `${type ?? ''} ${raw ?? ''} ${line ?? ''}`.toLowerCase()
  if (/\bs\s?\d/.test(String(line ?? '').toLowerCase()) || s.includes('sbahn') || s.includes('s-bahn') || s.includes('suburban')) return 'sbahn'
  if (/\bu\s?\d/.test(String(line ?? '').toLowerCase()) || s.includes('ubahn') || s.includes('u-bahn') || s.includes('metro') || s.includes('subway')) return 'ubahn'
  if (s.includes('tram')) return 'tram'
  if (s.includes('bus')) return 'bus'
  if (/\b(ice|ic|ec)\b/.test(s) || s.includes('long-distance')) return 'long-distance-train'
  if (/\b(re|rb)\b/.test(s) || s.includes('regional')) return 'regional-train'
  return 'other'
}

customElements.define('transport-widget', class extends Widget {
  initialState() {
    return { stations: [], stationsLoading: true, stationsError: '', ref: QUICK_STOPS[0].stationRef, stopName: 'Marienplatz', term: 'Marienplatz',
      open: false, active: 0, raw: [], loading: true, error: '', available: true, updatedAt: null, sort: 'line', dir: 1, filter: 'city', image: null }
  }
  start() {
    this.loadStations(); this.loadDepartures()
    this.every(60_000, () => this.loadDepartures(true))
    this.addEventListener('click', e => this.onClick(e))
    this.addEventListener('input', e => { if (e.target.matches('.search input')) { this.state.term = e.target.value; this.state.open = true; this.state.active = 0; this.renderOptions() } })
    this.addEventListener('keydown', e => this.onKey(e))
    this.addEventListener('focusin', e => { if (e.target.matches('.search input')) { this.state.open = true; e.target.select(); this.renderOptions() } })
    this.addEventListener('focusout', () => setTimeout(() => { if (!this.querySelector('.search')?.contains(document.activeElement) && this.state.open) { this.state.open = false; this.renderOptions() } }, 0))
  }
  async loadStations() {
    try {
      const r = await getJson('/transport/stations')
      const stations = (r.results ?? []).map(s => ({ name: String(s.name ?? '').trim(), stationRef: s.stationRef ?? s.id, key: fold(s.name) }))
        .filter(s => s.name && s.stationRef).sort((a, b) => a.name.localeCompare(b.name, 'de-DE', { sensitivity: 'base' }))
      const cur = stations.find(s => s.stationRef === this.state.ref)
      this.set({ stations, stationsLoading: false, image: r.image ?? null, ...(cur ? { stopName: cur.name, term: cur.name } : {}) })
    } catch (e) { console.warn('Haltestellen konnten nicht geladen werden:', e); this.set({ stationsLoading: false, stationsError: 'Haltestellen konnten nicht geladen werden.' }) }
  }
  async loadDepartures(silent = false) {
    const id = (this.reqId = (this.reqId ?? 0) + 1)
    this.abort?.abort(); this.abort = new AbortController()
    if (!silent) this.set({ loading: true, error: '' })
    try {
      const r = await getJson('/transport/departures', { stationRef: this.state.ref }, { signal: this.abort.signal })
      if (id !== this.reqId) return
      const raw = (r.results ?? []).map((d, i) => ({
        i, line: String(d.line ?? '').trim(), destination: String(d.destination ?? '').trim(), type: vehicleType(d.type, d.rawType, d.line),
        dirKey: d.directionCode || fold(d.destination), est: toDate(d.estimatedTime)?.getTime() ?? null, minutes: num(d.minutesUntil), delay: num(d.delayMinutes),
      }))
      this.set({ raw, loading: false, error: '', available: r.available !== false, updatedAt: r.updatedAt ?? new Date().toISOString() })
    } catch (e) {
      if (e.name === 'AbortError' || id !== this.reqId) return
      console.warn('Abfahrten konnten nicht geladen werden:', e)
      this.set({ raw: [], loading: false, error: 'Abfahrten konnten nicht geladen werden.' })
    }
  }
  get matches() {
    const { stations, term, ref, stopName } = this.state
    const q = fold(term), words = q.split(' ').filter(Boolean)
    if (!words.length) {
      const seen = new Set([ref]); const list = [{ name: stopName, stationRef: ref }]
      for (const q of QUICK_STOPS) if (!seen.has(q.stationRef)) { seen.add(q.stationRef); list.push({ name: stations.find(s => s.stationRef === q.stationRef)?.name ?? q.label, stationRef: q.stationRef }) }
      return list.concat(stations.filter(s => !seen.has(s.stationRef)))
    }
    return stations.filter(s => s.key.replace(/ /g, '').includes(q.replace(/ /g, '')) || words.every(w => s.key.includes(w)))
  }
  select(ref, name) {
    const s = this.state.stations.find(x => x.stationRef === ref)
    this.set({ ref, stopName: s?.name ?? name ?? ref, term: s?.name ?? name ?? '', open: false, active: 0 })
    this.loadDepartures()
  }
  onClick(e) {
    const b = e.target.closest('button'); if (!b) return
    if (b.dataset.stop) this.select(b.dataset.stop, b.textContent.trim())
    else if (b.dataset.sort) { const s = b.dataset.sort; this.set(s === this.state.sort ? { dir: -this.state.dir } : { sort: s, dir: 1 }) }
    else if (b.dataset.filter) this.set({ filter: b.dataset.filter })
    else if (b.classList.contains('clear')) { this.set({ term: '', open: true, active: 0 }); this.querySelector('.search input')?.focus() }
  }
  onKey(e) {
    if (!e.target.matches('.search input')) return
    const m = this.matches, s = this.state
    if (e.key === 'ArrowDown') { e.preventDefault(); s.open = true; s.active = Math.min(s.active + 1, Math.max(m.length - 1, 0)); this.renderOptions() }
    else if (e.key === 'ArrowUp') { e.preventDefault(); s.active = Math.max(s.active - 1, 0); this.renderOptions() }
    else if (e.key === 'Enter' && s.open && m.length) { e.preventDefault(); const o = m[s.active] ?? m[0]; this.select(o.stationRef, o.name) }
    else if (e.key === 'Escape') { e.preventDefault(); this.set({ open: false, term: s.stopName }) }
  }
  get grouped() {
    const { raw, filter, sort, dir } = this.state
    const keep = raw.filter(d => (d.line || d.destination) && (filter === 'all' || (filter === 'city' ? CITY_TYPES.has(d.type) : d.type === filter)))
    const byTime = (a, b) => (a.est ?? Infinity) - (b.est ?? Infinity) || (a.minutes ?? Infinity) - (b.minutes ?? Infinity) || a.i - b.i
    const lines = new Map()
    for (const d of [...keep].sort(byTime)) {
      const k = `${d.type}|${d.line}`
      if (!lines.has(k)) lines.set(k, { ...d, dirs: new Map() })
      const g = lines.get(k); if (!g.dirs.has(d.dirKey)) g.dirs.set(d.dirKey, []); g.dirs.get(d.dirKey).push(d)
    }
    const lineKey = d => { const m = d.line.match(/^([a-z]*)\s*(\d+)/i); return [TYPE_ORDER.indexOf(d.type), (m?.[1] ?? d.line).toLowerCase(), m ? Number(m[2]) : Infinity] }
    const byLine = (a, b) => { const x = lineKey(a), y = lineKey(b); return x[0] - y[0] || x[1].localeCompare(y[1]) || x[2] - y[2] || byTime(a, b) }
    return [...lines.values()].sort((a, b) => (sort === 'time' ? byTime(a, b) || byLine(a, b) : byLine(a, b)) * dir)
  }
  minutesLabel(d) {
    const m = d.minutes > 0 ? d.minutes : d.est ? Math.max(0, Math.ceil((d.est - Date.now()) / 60000)) : d.minutes
    return Number.isFinite(m) ? (m <= 0 ? 'jetzt' : `${m} min`) : (d.est ? tClock.format(d.est) : '–')
  }
  times(list) {
    const out = []
    for (const d of list) {
      const label = this.minutesLabel(d), delay = d.delay >= 1 ? Math.round(d.delay) : 0
      if (!out.some(o => o.label === label && o.delay === delay)) out.push({ label, delay })
      if (out.length >= 2) break
    }
    return out.map((o, i) => `${i ? ' / ' : ''}${o.label}${o.delay ? ` <span class="delay" aria-label="${o.delay} Minuten Verspätung">(+${o.delay})</span>` : ''}`).join('')
  }
  renderDepartures() {
    const s = this.state
    if (s.loading && !s.raw.length) return '<div class="state">Abfahrten werden geladen ...</div>'
    if (s.error) return `<div class="state">${esc(s.error)}</div>`
    if (!s.available) return `<div class="notice"><b>Echtzeit-Abfahrten folgen</b>Die Abfahrtsdaten werden ergänzt, sobald eine lizenzierte Echtzeitquelle angebunden ist. Haltestellen und Suche sind bereits aktiv.</div>`
    const g = this.grouped
    if (!g.length) return `<div class="state">${s.filter === 'all' ? 'Aktuell sind keine Abfahrten verfügbar.' : `Keine ${esc(TYPE_LABEL[s.filter] ?? '')}-Abfahrten im aktuellen Zeitraum.`}</div>`
    return g.map(l => `
      <div class="dep">
        <span class="line ${l.type}" aria-label="${esc(TYPE_LABEL[l.type])} Linie ${esc(l.line)}"><small>${esc(TYPE_LABEL[l.type])}</small><b>${esc(l.line)}</b></span>
        <div>${[...l.dirs.values()].map(ds => `<div class="dir"><span>${esc(ds[0].destination)}</span><span>${this.times(ds)}</span></div>`).join('')}</div>
      </div>`).join('')
  }
  renderFilters() {
    const counts = new Map()
    for (const d of this.state.raw) counts.set(d.type, (counts.get(d.type) ?? 0) + 1)
    if (counts.size === 0) return ''
    const city = [...counts].filter(([t]) => CITY_TYPES.has(t)).reduce((a, [, n]) => a + n, 0)
    const items = [['city', city], ['all', this.state.raw.length], ...[...counts].sort((a, b) => TYPE_ORDER.indexOf(a[0]) - TYPE_ORDER.indexOf(b[0]))]
    return `<div class="filters">${items.map(([t, n]) => `<button type="button" class="chip ${this.state.filter === t ? 'on' : ''}" data-filter="${t}" aria-pressed="${this.state.filter === t}">${esc(TYPE_LABEL[t])} ${n}</button>`).join('')}</div>`
  }
  renderOptions() {
    const box = this.querySelector('.options-slot'); if (!box) return
    const s = this.state, m = this.matches.slice(0, 200)
    const input = this.querySelector('.search input'); input?.setAttribute('aria-expanded', String(s.open))
    if (!s.open) { box.innerHTML = ''; return }
    box.innerHTML = `<div class="options" role="listbox" aria-label="Haltestellen">${
      s.stationsLoading ? '<div class="empty">Haltestellen werden geladen ...</div>'
      : s.stationsError ? `<div class="empty">${esc(s.stationsError)}</div>`
      : !m.length ? '<div class="empty">Keine Haltestelle gefunden.</div>'
      : m.map((o, i) => `<button type="button" role="option" data-stop="${esc(o.stationRef)}" class="${i === s.active ? 'active' : ''}" aria-selected="${o.stationRef === s.ref}">${esc(o.name)}</button>`).join('')}</div>`
    box.querySelector('.active')?.scrollIntoView({ block: 'nearest' })
    box.querySelectorAll('button').forEach(b => b.addEventListener('mousedown', e => e.preventDefault()))
  }
  render() {
    const s = this.state
    const focused = document.activeElement?.matches?.('.search input') && this.contains(document.activeElement)
    const arrow = k => (s.sort === k ? (s.dir === 1 ? ' ↑' : ' ↓') : '')
    this.innerHTML = `
      <article class="card transport" aria-busy="${s.loading || s.stationsLoading}">
        <div class="left">
          <h3>&Ouml;PNV <span class="soft">&ndash; N&auml;chste Abfahrten</span></h3>
          <div class="label">Aktive Haltestelle</div>
          <div class="stop-name">${esc(s.stopName)}</div>
          <div class="quick" aria-label="Häufige Haltestellen">${QUICK_STOPS.map(q => `<button type="button" class="chip ${q.stationRef === s.ref ? 'on' : ''}" data-stop="${q.stationRef}">${q.label}</button>`).join('')}</div>
          <div class="controls">
            <div class="search">
              <label class="label" for="stop-search">Haltestelle suchen</label>
              <div class="field">
                <input id="stop-search" type="text" role="combobox" autocomplete="off" aria-autocomplete="list" aria-expanded="false" value="${esc(s.term)}">
                ${s.term ? '<button type="button" class="clear" aria-label="Suche leeren">&times;</button>' : ''}
              </div>
              <div class="options-slot"></div>
            </div>
            <div class="sorts" aria-label="Abfahrten sortieren">
              <button type="button" class="pill ${s.sort === 'line' ? 'on' : ''}" data-sort="line" aria-pressed="${s.sort === 'line'}">Linie und Richtung${arrow('line')}</button>
              <button type="button" class="pill ${s.sort === 'time' ? 'on' : ''}" data-sort="time" aria-pressed="${s.sort === 'time'}">Abfahrt${arrow('time')}</button>
            </div>
          </div>
          <div class="departures" aria-live="polite">${this.renderDepartures()}</div>
          <div class="tfoot">
            <span class="live ${s.error || !s.available ? 'off' : ''}">${s.error ? 'Datenabruf fehlgeschlagen' : !s.available ? 'Echtzeit folgt' : s.updatedAt ? `Aktualisiert ${tClock.format(new Date(s.updatedAt))}` : 'wird aktualisiert'}</span>
            ${this.renderFilters()}
          </div>
        </div>
        <div class="side" style="background-image:url('${esc(asset(s.image?.localPath) ?? `${IMG}/muenchen-transport-marienplatz-sbahn.jpg`)}')" aria-hidden="true">${credit(s.image)}</div>
      </article>`
    this.renderOptions()
    if (focused) { const i = this.querySelector('.search input'); i.focus(); i.setSelectionRange(i.value.length, i.value.length) }
  }
})

// ------------------------------------------------------------ parking
customElements.define('parking-widget', class extends Widget {
  initialState() { return { items: [], updatedAt: null, loading: true, error: null, sortBy: 'name', dir: 1, image: null } }
  start() { this.load(); this.every(60_000, () => this.load(true)); this.addEventListener('click', e => { const b = e.target.closest('[data-sort]'); if (b) this.sortBy(b.dataset.sort) }) }
  async load(silent = false) {
    if (!silent) this.set({ loading: true })
    try {
      const r = await getJson('/parking')
      const items = (r.results ?? []).map(p => ({ id: String(p.id ?? ''), name: String(p.name ?? ''), free: num(p.free), total: num(p.total), occupied: num(p.occupied) }))
        .filter(p => p.name && p.free !== null && p.total !== null && p.total > 0)
      const stamps = (r.results ?? []).map(p => p.timestamp).filter(Boolean).sort()
      this.set({ items, updatedAt: stamps.at(-1) ?? null, loading: false, error: null, image: r.image ?? null })
    } catch (e) {
      console.error('Parkdaten konnten nicht geladen werden', e)
      if (!silent) this.set({ loading: false, error: 'Parkdaten konnten nicht geladen werden.', items: [] })
    }
  }
  sortBy(k) { this.set(this.state.sortBy === k ? { dir: -this.state.dir } : { sortBy: k, dir: k === 'name' ? 1 : -1 }) }
  render() {
    const s = this.state
    const total = s.items.reduce((a, p) => a + p.total, 0), free = s.items.reduce((a, p) => a + p.free, 0)
    const occ = total ? Math.round(((total - free) / total) * 100) : 0
    const list = [...s.items].sort((a, b) => (s.sortBy === 'free' ? (a.free - b.free) : a.name.localeCompare(b.name, 'de')) * s.dir)
    const arrow = k => (s.sortBy === k ? (s.dir === 1 ? ' ↑' : ' ↓') : '')
    const summary = s.error ? s.error : s.loading ? 'Lade Parkdaten ...' : s.items.length
      ? `${nf.format(Math.max(0, total - free))} / ${nf.format(total)} belegt${s.updatedAt ? ` &middot; Stand ${tClock.format(new Date(s.updatedAt))} Uhr` : ''}` : 'Keine aktuellen Parkdaten verfügbar.'
    this.innerHTML = `
      <article class="card parking">
        <div class="card-media" style="background-image:url('${esc(asset(s.image?.localPath) ?? `${IMG}/muenchen-parking-salvatorgarage.jpg`)}')">${credit(s.image)}</div>
        <div class="card-body">
          <div class="p-head">
            <h3>Parkh&auml;user <span class="soft">&ndash; Aktuelle Auslastung</span></h3>
            <div class="p-big">${s.loading ? '...' : s.items.length ? `${occ} %` : '&ndash;'}<span>belegt</span></div>
          </div>
          <div class="p-bar" aria-label="Auslastung der Parkhäuser"><i style="width:${occ}%"></i></div>
          <div class="p-meta">
            <div>${summary}</div>
            ${!s.loading && !s.error && s.items.length ? `<div class="sorts">
              <button type="button" class="pill ${s.sortBy === 'name' ? 'on' : ''}" data-sort="name">Name${arrow('name')}</button>
              <button type="button" class="pill ${s.sortBy === 'free' ? 'on' : ''}" data-sort="free">Freie Stellpl&auml;tze${arrow('free')}</button></div>` : ''}
          </div>
          <div class="p-list">${s.loading ? '<div class="state">Lade Parkdaten ...</div>' : !list.length ? `<div class="state">${s.error ? esc(s.error) : 'Keine aktuellen Parkdaten verfügbar.'}</div>` : list.map(p => {
            const used = Math.round(((p.total - p.free) / p.total) * 100), occupied = p.occupied ?? Math.max(0, p.total - p.free)
            const crit = used >= 95 || p.free < 15
            return `<div class="p-item"><div class="p-main"><span><b>${esc(p.name)}</b> <small>&middot; ${nf.format(occupied)} / ${nf.format(p.total)} belegt</small></span><span class="p-free ${crit ? 'crit' : ''}">${nf.format(p.free)} frei</span></div>
              <div class="p-mini ${crit ? 'crit' : ''}"><i style="width:${used}%"></i></div></div>`
          }).join('')}</div>
        </div>
      </article>`
  }
})

// ------------------------------------------------------------ counters (bike, pedestrians)
function hourLabel(d) { const h = d.getHours(), p = n => String(n).padStart(2, '0'); return `${p(h)}:00 – ${h === 23 ? '24' : p(h + 1)}:00 Uhr` }
function tickIndexes(chart, bucket, width) {
  const max = bucket === 'hour' ? (width < 420 ? 4 : width < 560 ? 5 : width < 760 ? 7 : 11) : (width < 420 ? 4 : width < 560 ? 5 : 7)
  let idx = chart.map((_, i) => i)
  if (bucket === 'hour') idx = idx.filter(i => i === 0 || toDate(chart[i].bucket)?.toDateString() !== toDate(chart[i - 1].bucket)?.toDateString())
  if (idx.length <= max) return new Set(idx)
  return new Set(Array.from({ length: max }, (_, n) => idx[Math.round((n * (idx.length - 1)) / (max - 1))]))
}

class CounterWidget extends Widget {
  initialState() { return { sites: [], data: null, period: '7d', site: 'all', loading: true, error: null, sitesError: null, available: true } }
  start() {
    this.loadSites(); this.loadTraffic()
    this.addEventListener('click', e => { const b = e.target.closest('[data-period]'); if (b && b.dataset.period !== this.state.period) { this.state.period = b.dataset.period; this.loadTraffic() } })
    this.addEventListener('change', e => { if (e.target.matches('select')) { this.state.site = e.target.value || 'all'; this.loadTraffic() } })
  }
  stop() { this.chart?.destroy() }
  async loadSites() {
    try { const r = await getJson(this.cfg.sitesPath); this.set({ sites: this.cfg.mapSites(r.sites ?? []).sort((a, b) => a.name.localeCompare(b.name, 'de')) }) }
    catch (e) { console.error(e); this.set({ sitesError: this.cfg.sitesError }) }
  }
  async loadTraffic() {
    const id = (this.reqId = (this.reqId ?? 0) + 1)
    this.set({ loading: true, error: null })
    try {
      const r = await getJson(this.cfg.trafficPath, { period: this.state.period, [this.cfg.siteParam]: this.state.site })
      if (id !== this.reqId) return
      this.set({ loading: false, available: r.available !== false, data: {
        bucket: r.bucket === 'hour' ? 'hour' : 'day', updatedUntil: r.dataThrough ?? r.updatedUntil ?? null,
        current: { from: r.current?.from, to: r.current?.to, count: num(r.current?.count) }, previous: { from: r.previous?.from, to: r.previous?.to, count: num(r.previous?.count) },
        changePercent: num(r.changePercent), chart: (r.chart ?? []).map(c => ({ bucket: String(c.bucket ?? ''), count: num(c.count) ?? 0 })).filter(c => c.bucket),
      } })
    } catch (e) { if (id === this.reqId) { console.error(e); this.set({ loading: false, data: null, error: this.cfg.loadError }) } }
  }
  drawChart() {
    this.chart?.destroy(); this.chart = null
    const canvas = this.querySelector('canvas'), d = this.state.data
    if (!canvas || !d?.chart.length || !window.Chart) return
    const hour = d.bucket === 'hour', chart = d.chart
    let ticks = tickIndexes(chart, d.bucket, canvas.parentElement.clientWidth)
    this.chart = new window.Chart(canvas, {
      type: hour ? 'line' : 'bar',
      data: { labels: chart.map(c => c.bucket), datasets: [{
        data: chart.map(c => c.count), borderColor: '#005a9f', backgroundColor: hour ? 'rgba(0, 90, 159, 0.12)' : '#005a9f', borderWidth: hour ? 2 : 0,
        fill: hour, tension: hour ? 0.28 : 0, pointRadius: 0, pointHoverRadius: hour ? 3 : 0, pointHitRadius: hour ? 10 : 0,
        ...(hour ? {} : { hoverBackgroundColor: '#00467c', categoryPercentage: 0.7, barPercentage: 0.9, maxBarThickness: 18, minBarLength: 3 }),
      }] },
      options: {
        animation: false, responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
        onResize: c => { ticks = tickIndexes(chart, d.bucket, c.width) },
        layout: { padding: { top: 6, right: 4 } },
        plugins: { legend: { display: false }, tooltip: { displayColors: false, backgroundColor: '#111317', cornerRadius: 0, padding: 10,
          callbacks: { title: it => { const t = toDate(chart[it[0]?.dataIndex ?? 0]?.bucket); return t ? (hour ? `${dFull.format(t)}, ${hourLabel(t)}` : dFull.format(t)) : '' },
            label: it => `${nf.format(it.parsed.y ?? 0)} ${this.cfg.unit}` } } },
        scales: {
          x: { border: { display: false }, grid: { display: false }, ticks: { autoSkip: false, maxRotation: 0, color: '#425466', padding: 8, font: { size: 12, weight: 600 },
            callback: (_, i) => (ticks.has(i) ? fmtShort(chart[i].bucket) ?? '' : '') } },
          y: { beginAtZero: true, border: { display: false }, grid: { color: '#dfe4e8', drawTicks: false }, ticks: { color: '#66717e', maxTicksLimit: 4, padding: 8, font: { size: 11 }, callback: v => compact.format(Number(v)) } },
        },
      },
    })
  }
  render() {
    const s = this.state, d = s.data, c = this.cfg
    const periodWord = s.period === '30d' ? '30 Tagen' : '7 Tagen', compare = s.period === '30d' ? 'zum vorherigen Zeitraum' : 'zur Vorwoche'
    const change = d?.changePercent
    const pending = !s.available
    const chartBody = s.loading ? `<div class="state">${c.loadingText}</div>` : s.error ? `<div class="state">${esc(s.error)}</div>`
      : pending ? `<div class="state"><div><b>${c.pendingTitle}</b><br>${c.pendingText}</div></div>`
      : d?.chart.length ? '<canvas></canvas>' : `<div class="state">${c.emptyText}</div>`
    this.innerHTML = `
      <article class="card" aria-busy="${s.loading}">
        <div class="card-body">
          <div class="c-head">
            <h3>${c.title}</h3>
            <div class="c-controls">
              <div class="seg" role="group" aria-label="Zeitraum">${['7d', '30d'].map(p => `<button type="button" data-period="${p}" class="${s.period === p ? 'on' : ''}" aria-pressed="${s.period === p}">${p === '7d' ? '7 Tage' : '30 Tage'}</button>`).join('')}</div>
              <label class="site"><span>Standort</span><select ${s.sites.length ? '' : 'disabled'}>
                <option value="all">${c.allLabel}</option>${s.sites.map(o => `<option value="${esc(o.id)}" ${o.id === s.site ? 'selected' : ''}>${esc(o.name)}</option>`).join('')}</select></label>
            </div>
          </div>
          ${s.sitesError ? `<div class="state">${esc(s.sitesError)}</div>` : ''}
          <div class="c-grid">
            <section class="c-sum" aria-live="polite">
              <div class="value">${s.loading ? '...' : d?.current.count === null || d?.current.count === undefined ? '&ndash;' : nf.format(d.current.count)}</div>
              <div class="caption">${c.unitCaption} in den letzten ${periodWord}</div>
              <div class="change ${change === null || change === undefined ? 'none' : change > 0 ? 'up' : change < 0 ? 'down' : 'none'}">${change === null || change === undefined ? 'Kein Vergleichswert verf&uuml;gbar' : `${pct.format(change)} % ${compare}`}</div>
              <div class="status">Datenstand: ${fmtDate(d?.updatedUntil) ?? (pending ? 'folgt' : 'abgeschlossene Tagesdaten')}</div>
              ${!s.loading && !s.error && d && !pending ? `<div class="facts">
                <div class="fact"><span>Zeitraum</span><strong>${range(d.current.from, d.current.to) ?? `letzte ${periodWord}`}</strong></div>
                <div class="fact"><span>Vorperiode</span><strong>${d.previous.count === null ? '&ndash;' : nf.format(d.previous.count)}</strong>${range(d.previous.from, d.previous.to) ? `<small>${range(d.previous.from, d.previous.to)}</small>` : ''}</div>
              </div>` : ''}
            </section>
            <section class="chart" aria-label="${c.chartLabel}">${chartBody}</section>
          </div>
        </div>
      </article>`
    requestAnimationFrame(() => this.drawChart())
  }
}

customElements.define('bike-widget', class extends CounterWidget {
  cfg = { title: 'Radverkehr', sitesPath: '/bike/sites', trafficPath: '/bike/traffic', siteParam: 'siteId', allLabel: 'Alle Z&auml;hlstellen',
    mapSites: list => list.filter(x => x.active !== false).map(x => ({ id: String(x.siteId), name: String(x.name ?? '').trim() })).filter(x => x.id && x.name),
    unit: 'Radfahrten', unitCaption: 'Radfahrten', chartLabel: 'Radverkehr im Zeitraum', loadingText: 'Lade Radverkehrsdaten ...',
    emptyText: 'Keine Radverkehrsdaten verf&uuml;gbar.', loadError: 'Radverkehrsdaten konnten nicht geladen werden.', sitesError: 'Zählstellen konnten nicht geladen werden.',
    pendingTitle: 'Daten folgen', pendingText: '' }
})

customElements.define('person-widget', class extends CounterWidget {
  cfg = { title: 'Passantenz&auml;hlung', sitesPath: '/person/sites', trafficPath: '/person/traffic', siteParam: 'siteName', allLabel: 'Alle Standorte',
    mapSites: list => list.map(x => ({ id: String(x.Location ?? ''), name: String(x.Location ?? '') })).filter(x => x.id),
    unit: 'Passanten', unitCaption: 'Passanten', chartLabel: 'Passantenfrequenz im Zeitraum', loadingText: 'Lade Passantendaten ...',
    emptyText: 'Keine Passantendaten verf&uuml;gbar.', loadError: 'Passantendaten konnten nicht geladen werden.', sitesError: 'Standorte konnten nicht geladen werden.',
    pendingTitle: 'Passantenfrequenzen folgen in K&uuml;rze', pendingText: 'Acht Z&auml;hlstellen in der Innenstadt; der Datenzugang wird eingerichtet.' }
})

// ------------------------------------------------------------ open data
customElements.define('open-data-widget', class extends Widget {
  initialState() { return { count: '…', recent: 0, latest: null, portal: 'https://opendata.muenchen.de' } }
  async start() {
    try {
      const r = await getJson('/opendata')
      this.set({ count: nf.format(r.count), recent: r.modifiedInWindow ?? 0, latest: r.latest?.[0] ?? null, portal: r.portalUrl ?? this.state.portal, days: r.windowDays ?? 30 })
    } catch (e) { console.error('Datensatz-Anzahl konnte nicht geladen werden:', e); this.set({ count: '–' }) }
  }
  render() {
    const s = this.state
    this.innerHTML = `
      <article class="card small">
        <div class="card-body">
          <h3>Open Data</h3>
          <div class="value">${esc(s.count)}</div>
          <div class="caption">Datens&auml;tze verf&uuml;gbar</div>
          ${s.recent ? `<div class="trend">+${nf.format(s.recent)} in den letzten ${s.days ?? 30} Tagen aktualisiert</div>` : ''}
          ${s.latest ? `<a class="teaser" href="${esc(s.latest.url)}" target="_blank" rel="noopener noreferrer" title="${esc(s.latest.title)}"><b>Neu:</b> ${esc(s.latest.title)}</a>` : ''}
          <a class="action" href="${esc(s.portal)}" target="_blank" rel="noopener noreferrer">Zum Open-Data-Portal <span aria-hidden="true">&rarr;</span></a>
        </div>
      </article>`
  }
})

// ------------------------------------------------------------ participation
customElements.define('machmit-widget', class extends Widget {
  initialState() { return { loaded: false, error: false, running: 0, projects: [] } }
  start() { this.load(); this.every(600_000, () => this.load()) }
  async load() {
    try { const r = await getJson('/machmit-projects'); this.set({ loaded: true, error: false, running: r.totalRunningCount ?? 0, projects: r.projects ?? [] }) }
    catch (e) { console.error('Beteiligungsdaten konnten nicht geladen werden:', e); if (!this.state.loaded) this.set({ error: true }) }
  }
  badge(p) {
    const startsIn = p.startDate ? Math.round((toDate(p.startDate) - new Date(new Date().toDateString())) / 86400000) : null
    if (p.status === 'upcoming') return startsIn === 1 ? 'Startet morgen' : startsIn > 1 ? `Startet in ${startsIn} Tagen` : `Startet am ${fmtShort(p.startDate)}`
    const d = p.daysLeft; return d === 0 ? 'Endet heute' : d === 1 ? 'Endet morgen' : Number.isFinite(d) ? `Noch ${d} Tage` : 'Läuft'
  }
  render() {
    const s = this.state, p = s.projects[0]
    const body = s.error && !s.loaded ? '<div class="state">Daten momentan nicht verfügbar</div>'
      : !p ? (s.loaded ? '<div class="state">Zurzeit keine laufenden Beteiligungen</div>' : '<div class="state">…</div>')
      : `
        <span class="mm-badge">${this.badge(p)}</span>
        <h3><a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.title)}</a></h3>
        ${p.subtitle ? `<div class="mm-sub">${esc(p.subtitle)}</div>` : ''}
        <div class="mm-bottom">
          ${p.endDate ? `<div class="mm-count"><span>Ideensammlung bis ${fmtShort(p.endDate)}</span></div>` : ''}
          <a class="mm-button" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${p.status === 'upcoming' ? 'Vormerken' : 'Idee einreichen'} <span aria-hidden="true">&rarr;</span></a>
        </div>`
    this.innerHTML = `
      <article class="card small mm ${p?.image ? 'has-img' : ''}" aria-label="Mach mit, München">
        <div class="card-body">
          <div class="mm-kicker">Mach mit, M&uuml;nchen</div>
          ${body}
        </div>
        ${p?.image ? `<a class="mm-img" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true" style="background-image:url('${esc(p.image)}')"></a>` : ''}
      </article>`
  }
})
