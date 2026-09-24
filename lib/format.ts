const takaFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
})

/** Formats a decimal string or number as whole Taka, e.g. "154999" → "৳154,999". */
export function formatPrice(amount: string | number): string {
  const value = typeof amount === "number" ? amount : Number.parseFloat(amount)
  return Number.isFinite(value) ? takaFormatter.format(value) : ""
}

/** Percentage saved between a regular and a sale price, rounded down (never overstated). */
export function discountPercent(
  basePrice: string,
  discountPrice: string | null
): number {
  if (discountPrice === null) return 0
  const base = Number.parseFloat(basePrice)
  const sale = Number.parseFloat(discountPrice)
  if (!(base > 0) || !(sale < base)) return 0
  return Math.floor(((base - sale) / base) * 100)
}

/** Human "ends in" copy for a future ISO timestamp: "4 days", "7 hours", "soon". */
export function timeUntil(isoDate: string, now: number = Date.now()): string {
  const ms = new Date(isoDate).getTime() - now
  if (!Number.isFinite(ms) || ms <= 0) return "soon"
  const hours = Math.floor(ms / 3_600_000)
  if (hours >= 48) return `${Math.floor(hours / 24)} days`
  if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"}`
  return "soon"
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Dhaka",
})
const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Dhaka",
})

/** "24 Sept 2026" (or "24 Sept 2026, 6:05 pm") in Dhaka time, same on server and client. */
export function formatDate(isoDate: string, withTime = false): string {
  const date = new Date(isoDate)
  return (withTime ? dateTimeFormatter : dateFormatter).format(date)
}
