import { formatPrice } from "@/lib/format"
import type { CouponStatus, DiscountType } from "@/lib/backend-coupons"

interface Offer {
  discountType: DiscountType
  discountValue: string | number
  maxDiscountAmount?: string | number | null
}

/** Headline of the offer: "10% off", "৳500 off", "Free delivery". */
export function offerHeadline(offer: Offer): string {
  if (offer.discountType === "FREE_SHIPPING") return "Free delivery"
  if (offer.discountType === "FIXED_AMOUNT") return `${formatPrice(offer.discountValue)} off`
  return `${Number(offer.discountValue)}% off`
}

/** Shopper-facing one-liner: "10% off, up to ৳500 · orders over ৳1,000". */
export function describeOffer(
  offer: Offer & { minOrderAmount?: string | number | null }
): string {
  const cap =
    offer.discountType === "PERCENTAGE" && offer.maxDiscountAmount
      ? `, up to ${formatPrice(offer.maxDiscountAmount)}`
      : ""
  const minimum = offer.minOrderAmount ? ` on orders over ${formatPrice(offer.minOrderAmount)}` : ""
  return `${offerHeadline(offer)}${cap}${minimum}`
}

/** The small print, e.g. ["Up to ৳500", "Orders over ৳1,000", "Once per customer"]. */
export function offerConditions(
  offer: Offer & { minOrderAmount?: string | number | null; perCustomerLimit?: number | null }
): string[] {
  const conditions: string[] = []
  if (offer.discountType === "PERCENTAGE" && offer.maxDiscountAmount) {
    conditions.push(`Up to ${formatPrice(offer.maxDiscountAmount)}`)
  }
  if (offer.minOrderAmount && Number(offer.minOrderAmount) > 0) {
    conditions.push(`Orders over ${formatPrice(offer.minOrderAmount)}`)
  }
  if (offer.perCustomerLimit) {
    conditions.push(
      offer.perCustomerLimit === 1 ? "Once per customer" : `${offer.perCustomerLimit}× per customer`
    )
  }
  return conditions
}

export const COUPON_STATUS_META: Record<
  CouponStatus,
  { label: string; hint: string; tone: "success" | "info" | "warning" | "muted" }
> = {
  ACTIVE: { label: "Active", hint: "Shoppers can use it now", tone: "success" },
  SCHEDULED: { label: "Scheduled", hint: "Starts later", tone: "info" },
  USED_UP: { label: "Used up", hint: "Reached its total uses", tone: "warning" },
  EXPIRED: { label: "Expired", hint: "Past its end date", tone: "muted" },
  DISABLED: { label: "Off", hint: "Switched off by staff", tone: "muted" },
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no 0/O, 1/I

/** A readable random code, e.g. "SAVE-7KQ4XM". */
export function generateCouponCode(prefix = ""): string {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  const tail = Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("")
  return prefix ? `${prefix}-${tail}` : tail
}
