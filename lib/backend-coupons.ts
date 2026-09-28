import { backendFetch, parseJson } from "@/lib/backend-client"
import type { OrderStatus } from "@/lib/backend-commerce"

// Mirrors the API's coupon entities. Money arrives as decimal strings.

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING"
export type CouponStatus = "ACTIVE" | "SCHEDULED" | "USED_UP" | "EXPIRED" | "DISABLED"
export type CouponSort = "createdAt" | "validUntil" | "usedCount" | "code"

export interface Coupon {
  id: number
  code: string
  description: string | null
  discountType: DiscountType
  discountValue: string
  minOrderAmount: string | null
  maxDiscountAmount: string | null
  usageLimit: number | null
  perCustomerLimit: number | null
  usedCount: number
  validFrom: string
  validUntil: string
  isActive: boolean
  status: CouponStatus
  orderCount: number
  discountGiven: string
  revenue: string
  createdAt: string
  updatedAt: string
}

export interface CouponOrder {
  id: number
  status: OrderStatus
  totalAmount: string
  discountAmount: string
  customer: { id: number; name: string | null; email: string } | null
  createdAt: string
}

export interface CouponDetail extends Coupon {
  customerCount: number
  recentOrders: CouponOrder[]
}

export interface CouponPage {
  items: Coupon[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface CouponSummary {
  statusCounts: Record<CouponStatus, number>
  total: number
  orderCount: number
  discountGiven: string
  revenue: string
  endingSoon: { id: number; code: string; validUntil: string } | null
}

export interface CouponQuery {
  page: number
  status?: CouponStatus
  search?: string
  sortBy?: CouponSort
  sortOrder?: "asc" | "desc"
}

export interface CouponInput {
  code: string
  description: string | null
  discountType: DiscountType
  discountValue: number
  minOrderAmount: number | null
  maxDiscountAmount: number | null
  usageLimit: number | null
  perCustomerLimit: number | null
  validFrom: string
  validUntil: string
  isActive: boolean
}

export const COUPON_PAGE_SIZE = 20

function authed(accessToken: string, init: RequestInit = {}): RequestInit {
  return {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
  }
}

export async function getCoupons(accessToken: string, query: CouponQuery): Promise<CouponPage> {
  const params = new URLSearchParams({ page: String(query.page), limit: String(COUPON_PAGE_SIZE) })
  if (query.status) params.set("status", query.status)
  if (query.search) params.set("search", query.search)
  if (query.sortBy) params.set("sortBy", query.sortBy)
  if (query.sortOrder) params.set("sortOrder", query.sortOrder)
  const response = await backendFetch(`/coupons?${params.toString()}`, authed(accessToken))
  return (await parseJson<{ data: CouponPage }>(response)).data
}

export async function getCouponSummary(accessToken: string): Promise<CouponSummary> {
  const response = await backendFetch("/coupons/summary", authed(accessToken))
  return (await parseJson<{ data: CouponSummary }>(response)).data
}

/** Null when the coupon doesn't exist. */
export async function getCoupon(accessToken: string, id: number): Promise<CouponDetail | null> {
  const response = await backendFetch(`/coupons/${id}`, authed(accessToken))
  if (response.status === 404) return null
  return (await parseJson<{ data: CouponDetail }>(response)).data
}

/** Create sends every field; `null` → omitted (the API treats absent as "none"). */
export async function createCoupon(accessToken: string, input: CouponInput): Promise<Coupon> {
  const body = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== null))
  const response = await backendFetch(
    "/coupons",
    authed(accessToken, { method: "POST", body: JSON.stringify(body) })
  )
  return (await parseJson<{ data: Coupon }>(response)).data
}

/** Update: `null` clears a limit/cap/minimum/note. */
export async function updateCoupon(
  accessToken: string,
  id: number,
  input: Partial<CouponInput>
): Promise<Coupon> {
  const response = await backendFetch(
    `/coupons/${id}`,
    authed(accessToken, { method: "PATCH", body: JSON.stringify(input) })
  )
  return (await parseJson<{ data: Coupon }>(response)).data
}

export async function deleteCoupon(accessToken: string, id: number): Promise<void> {
  const response = await backendFetch(`/coupons/${id}`, authed(accessToken, { method: "DELETE" }))
  await parseJson(response)
}
