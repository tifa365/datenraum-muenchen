// Snapshot store on node:sqlite (Node >= 22.5). Keeps every successful upstream
// payload so the API can serve the last good value after an outage or restart,
// and so later features (parking trends, delay history) have data to work with.
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

export function openStore(file) {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true })
  const db = new DatabaseSync(file)
  db.exec(`
    CREATE TABLE IF NOT EXISTS snapshots (
      source      TEXT NOT NULL,
      retrieved_at TEXT NOT NULL,
      payload     TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS snapshots_source_time ON snapshots (source, retrieved_at);
  `)
  const insert = db.prepare('INSERT INTO snapshots (source, retrieved_at, payload) VALUES (?, ?, ?)')
  const latest = db.prepare('SELECT retrieved_at, payload FROM snapshots WHERE source = ? ORDER BY retrieved_at DESC LIMIT 1')
  const prune = db.prepare('DELETE FROM snapshots WHERE source = ? AND retrieved_at < ?')
  return {
    db,
    save(source, retrievedAt, payload) { insert.run(source, retrievedAt, JSON.stringify(payload)) },
    latest(source) {
      const row = latest.get(source)
      return row ? { retrievedAt: row.retrieved_at, payload: JSON.parse(row.payload) } : null
    },
    prune(source, olderThanIso) { prune.run(source, olderThanIso) },
    close() { db.close() },
  }
}
