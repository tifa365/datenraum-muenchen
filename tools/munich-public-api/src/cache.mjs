// Stale-while-revalidate source cache.
// - At most one upstream refresh per TTL, however many visitors call the API.
// - A failed refresh keeps serving the last good value (memory, then sqlite)
//   flagged stale, instead of failing the endpoint.
// - startScheduler() refreshes in the background so the first visitor after
//   a TTL expiry does not wait for the upstream.
export function createSource({ name, ttlSeconds, load, store }) {
  let value = null          // { retrievedAt, payload }
  let expires = 0
  let stale = false
  let inflight = null

  if (store) {
    const snap = store.latest(name)
    if (snap) value = snap // served until the first refresh completes
  }

  async function refresh() {
    if (inflight) return inflight
    inflight = (async () => {
      try {
        const payload = await load()
        value = { retrievedAt: new Date().toISOString(), payload }
        stale = false
        store?.save(name, value.retrievedAt, payload)
      } catch (e) {
        stale = true
        console.error(`[source:${name}] refresh failed: ${e.message}`)
        if (!value) throw e
      } finally {
        expires = Date.now() + ttlSeconds * 1000
        inflight = null
      }
    })()
    return inflight
  }

  return {
    name,
    ttlSeconds,
    async get() {
      if (!value) await refresh()
      else if (Date.now() >= expires) refresh().catch(() => {}) // background
      return { ...value, stale }
    },
    refresh,
  }
}

export function startScheduler(sources, { jitterMs = 2000 } = {}) {
  const timers = sources.map((s, i) => {
    setTimeout(() => s.refresh().catch(() => {}), i * jitterMs)
    return setInterval(() => s.refresh().catch(() => {}), s.ttlSeconds * 1000)
  })
  return () => timers.forEach(clearInterval)
}
