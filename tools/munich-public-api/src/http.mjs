// Tiny router with the same outward behaviour as the Augsburg alerts service:
// JSON on 200, permissive CORS for GET, Express-style HTML 404 for unknown paths.
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, sep, extname } from 'node:path'

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status }
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.md': 'text/markdown; charset=utf-8' }

// statics: [{ prefix: '/config/munich/assets/', dir: '/abs/path' }]; '/' maps to <prefix '/'>/index.html
async function serveStatic(statics, pathname, res) {
  for (const { prefix, dir } of statics) {
    if (!pathname.startsWith(prefix)) continue
    const rel = decodeURIComponent(pathname.slice(prefix.length)) || 'index.html'
    const root = resolve(dir)
    const file = resolve(root, rel)
    if (file !== root && !file.startsWith(root + sep)) return false // path traversal
    const type = MIME[extname(file).toLowerCase()]
    if (!type) continue
    try {
      const body = await readFile(file)
      // html/js/css change with every deploy: always revalidate; images may be cached
      res.writeHead(200, { 'content-type': type, 'cache-control': type.startsWith('image/') ? 'public, max-age=3600' : 'no-cache' })
      res.end(body)
      return true
    } catch { /* try next mapping */ }
  }
  return false
}

export function createServer(routes, { cacheSeconds = 60, statics = [] } = {}) {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost')
    const origin = req.headers.origin
    const cors = origin
      ? { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'GET, OPTIONS', 'access-control-allow-headers': 'Content-Type, Authorization', vary: 'Origin' }
      : {}
    if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end() }
    if (req.method === 'GET' && !routes[url.pathname] && await serveStatic(statics, url.pathname, res)) return
    const handler = routes[url.pathname]
    if (req.method !== 'GET' || !handler) {
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' })
      return res.end(`<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="utf-8"><title>Error</title></head>\n<body><pre>Cannot ${req.method} ${url.pathname}</pre></body>\n</html>\n`)
    }
    try {
      const body = await handler(Object.fromEntries(url.searchParams))
      res.writeHead(200, { ...cors, 'content-type': 'application/json; charset=utf-8', 'cache-control': `public, max-age=${cacheSeconds}` })
      res.end(JSON.stringify(body))
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 502
      if (status >= 500) console.error(`[http] ${url.pathname}:`, e.message)
      res.writeHead(status, { ...cors, 'content-type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({ error: e.message }))
    }
  })
}
