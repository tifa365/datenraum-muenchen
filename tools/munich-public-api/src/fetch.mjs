// Shared fetch with timeout and an identifying User-Agent.
export const USER_AGENT = process.env.USER_AGENT
  ?? 'munich-smart-city-dashboard/0.1 (+set USER_AGENT env with a contact address)'

export async function fetchOk(url, { timeoutMs = 20000, headers = {}, ...init } = {}) {
  const res = await fetch(url, { ...init, headers: { 'user-agent': USER_AGENT, ...headers }, signal: AbortSignal.timeout(timeoutMs) })
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`)
  return res
}
export const fetchJson = async (url, opts) => (await fetchOk(url, { ...opts, headers: { accept: 'application/json', ...opts?.headers } })).json()
export const fetchText = async (url, opts) => (await fetchOk(url, opts)).text()
