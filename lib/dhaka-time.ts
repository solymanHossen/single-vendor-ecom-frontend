// The store runs on Asia/Dhaka (UTC+6, no DST). Admin date inputs are read
// and written in Dhaka time so the server render and the browser always agree.

const DHAKA_OFFSET_MS = 6 * 3_600_000

/** ISO → "2026-10-01T18:30" for <input type="datetime-local">, in Dhaka time. */
export function toDhakaInput(iso: string): string {
  return new Date(new Date(iso).getTime() + DHAKA_OFFSET_MS).toISOString().slice(0, 16)
}

/** "2026-10-01T18:30" (Dhaka) → ISO, or null when incomplete. */
export function fromDhakaInput(value: string): string | null {
  const date = new Date(`${value}:00+06:00`)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

/** `days` after the given Dhaka date, at 23:59 — campaigns end at close of day. */
export function endOfDayAfter(value: string, days: number): string {
  const start = new Date(`${value.slice(0, 10)}T00:00:00Z`)
  start.setUTCDate(start.getUTCDate() + days)
  return `${start.toISOString().slice(0, 10)}T23:59`
}

export function endOfMonth(value: string): string {
  const start = new Date(`${value.slice(0, 10)}T00:00:00Z`)
  const last = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0))
  return `${last.toISOString().slice(0, 10)}T23:59`
}

/** `hours` after a Dhaka datetime-local value. */
export function hoursAfter(value: string, hours: number): string {
  const iso = fromDhakaInput(value)
  if (!iso) return value
  return toDhakaInput(new Date(new Date(iso).getTime() + hours * 3_600_000).toISOString())
}
