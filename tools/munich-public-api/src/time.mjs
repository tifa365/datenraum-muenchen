// Europe/Berlin wall-clock "YYYY-MM-DD HH:MM:SS" -> UTC ISO string, DST-aware.
export function berlinToUtc(local) {
  const m = /^(\d{4})[-.](\d{2})[-.](\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(local?.trim() ?? '')
  if (!m) return null
  const [, y, mo, d, h, mi, s = '0'] = m
  const asUtc = Date.UTC(+y, +mo - 1, +d, +h, +mi, +s)
  // offset of Berlin at that instant (iterate once to settle around DST switches)
  let guess = asUtc - berlinOffsetMs(asUtc)
  guess = asUtc - berlinOffsetMs(guess)
  return new Date(guess).toISOString()
}

export function berlinOffsetMs(utcMs) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    .formatToParts(new Date(utcMs)).reduce((a, p) => ({ ...a, [p.type]: p.value }), {})
  return Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second) - Math.floor(utcMs / 1000) * 1000
}

const LOCAL_FMT = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })

// UTC instant -> Berlin wall clock "YYYY-MM-DD HH:MM"
export function berlinLocal(utc) {
  const p = LOCAL_FMT.formatToParts(new Date(utc)).reduce((a, x) => ({ ...a, [x.type]: x.value }), {})
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`
}

export const berlinDate = utc => berlinLocal(utc).slice(0, 10)

// Berlin local date "YYYY-MM-DD" + n days (calendar arithmetic, DST-safe)
export function addDays(date, n) {
  const d = new Date(`${date}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

// UTC instant of local midnight at the start of a Berlin date
export const berlinMidnightUtc = date => berlinToUtc(`${date} 00:00:00`)
