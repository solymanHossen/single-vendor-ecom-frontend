const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const integerFormatter = new Intl.NumberFormat("en-US")

const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
})

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Dhaka",
})

/** ৳9.3M / ৳482K — for axes and tight labels. Exact values use formatPrice. */
export function compactTaka(value: number): string {
  return `৳${compactFormatter.format(value)}`
}

export function formatCount(value: number): string {
  return integerFormatter.format(value)
}

/** "2026-09-24" (a Dhaka calendar day) → "24 Sept". */
export function shortDate(isoDay: string): string {
  return shortDateFormatter.format(new Date(`${isoDay}T00:00:00Z`))
}

export function dateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}
