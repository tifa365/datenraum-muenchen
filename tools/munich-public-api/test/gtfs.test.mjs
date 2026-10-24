import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { splitCsv, vehicleType, secs, initTables, departures } from '../src/adapters/gtfs.mjs'

test('csv: quoted fields with commas and escaped quotes', () => {
  assert.deepEqual(splitCsv('a,"b, c","d ""e"""'), ['a', 'b, c', 'd "e"'])
  assert.deepEqual(splitCsv('x,,y'), ['x', '', 'y'])
})

test('vehicle type: MVV S-Bahn under route_type 0, replacement buses stay buses', () => {
  assert.equal(vehicleType({ route_type: '0', route_short_name: 'S3' }), 'sbahn')
  assert.equal(vehicleType({ route_type: '0', route_short_name: '17' }), 'tram')
  assert.equal(vehicleType({ route_type: '1', route_short_name: 'U6' }), 'ubahn')
  assert.equal(vehicleType({ route_type: '3', route_short_name: 'U3' }), 'bus')
  assert.equal(vehicleType({ route_type: '3', route_short_name: 'SEV S1' }), 'bus')
  assert.equal(vehicleType({ route_type: '2', route_short_name: 'RB 6' }), 'regional-train')
})

test('times beyond 24:00 are seconds from the service day start', () => {
  assert.equal(secs('25:10:30'), 25 * 3600 + 10 * 60 + 30)
})

// Saturday 2026-10-24: weekend service W runs, weekday service D does not; trip T2 starts Friday
// at 24:30 (= Saturday 00:30); trip T3 terminates at the station (no departure shown).
function fixture() {
  const db = new DatabaseSync(':memory:')
  initTables(db)
  db.exec(`
    INSERT INTO gtfs_routes VALUES ('r1', 'U6', 'ubahn', NULL), ('r2', '17', 'tram', NULL);
    INSERT INTO gtfs_calendar VALUES ('W', '0000011', '20261001', '20261213'), ('D', '1111100', '20261001', '20261213');
    INSERT INTO gtfs_trips VALUES ('T1', 'r1', 'W', 'Garching', '0', 'Klinikum Großhadern', 5),
                                  ('T2', 'r2', 'D', 'Amalienburgstraße', '1', 'St. Emmeram', 5),
                                  ('T3', 'r1', 'W', 'Marienplatz', '1', 'Garching', 3),
                                  ('T4', 'r1', 'D', 'Garching', '0', 'Klinikum Großhadern', 5);
    INSERT INTO gtfs_departures VALUES
      ('de:09162:2', 'de:09162:2:51:51', 'T1', ${secs('10:05:00')}, 2, NULL),
      ('de:09162:2', 'de:09162:2:41:81', 'T2', ${secs('24:30:00')}, 2, NULL),
      ('de:09162:2', 'de:09162:2:52:52', 'T3', ${secs('10:06:00')}, 3, NULL),
      ('de:09162:2', 'de:09162:2:51:51', 'T4', ${secs('10:07:00')}, 2, NULL);
  `)
  return db
}

test('departures: weekend calendar, trip after midnight from the previous service day, no terminating trips', () => {
  const db = fixture()
  const morning = departures(db, 'de:09162:2', { now: Date.parse('2026-10-24T08:00:00Z'), horizonHours: 3 }) // 10:00 CEST
  assert.deepEqual(morning.map(d => [d.line, d.destination, d.timetabledTime]), [['U6', 'Garching', '2026-10-24T08:05:00.000Z']])
  assert.equal(morning[0].realtime, false)
  assert.equal(morning[0].delayMinutes, null)
  const night = departures(db, 'de:09162:2', { now: Date.parse('2026-10-23T22:00:00Z'), horizonHours: 2 }) // Sat 00:00 CEST
  assert.deepEqual(night.map(d => [d.line, d.timetabledTime, d.origin]), [['17', '2026-10-23T22:30:00.000Z', 'St. Emmeram']])
})
