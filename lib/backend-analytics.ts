import { backendFetch, parseJson } from "./backend-client"

export const ANALYTICS_RANGES = [7, 30, 90] as const
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number]

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED"
export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED"
export type PaymentProvider = "STRIPE" | "SSLCOMMERZ" | "BKASH" | "COD"

export interface Metric {
  value: string
  previous: string
  changePercent: number | null
}

export interface AnalyticsDashboard {
  rangeDays: number
  from: string
  to: string
  summary: {
    revenue: Metric
    orders: Metric
    averageOrderValue: Metric
    newCustomers: Metric
  }
  daily: Array<{ date: string; revenue: string; orders: number }>
  ordersByStatus: Array<{ status: OrderStatus; count: number }>
  paymentMix: Array<{
    provider: PaymentProvider
    count: number
    amount: string
  }>
  topProducts: Array<{
    id: number
    name: string
    categoryName: string
    thumbnailUrl: string | null
    units: number
    revenue: string
  }>
  recentOrders: Array<{
    id: number
    customerName: string | null
    customerEmail: string | null
    itemCount: number
    totalAmount: string
    status: OrderStatus
    paymentStatus: PaymentStatus
    paymentProvider: PaymentProvider | null
    createdAt: string
  }>
  reviews: {
    averageRating: number
    approvedCount: number
    pendingCount: number
    distribution: Record<"1" | "2" | "3" | "4" | "5", number>
    latest: Array<{
      id: number
      rating: number
      comment: string | null
      isApproved: boolean
      customerName: string | null
      productName: string
      createdAt: string
    }>
  }
  operations: {
    awaitingFulfilment: number
    pendingReturns: number
    openTickets: number
    pendingReviews: number
  }
  lowStock: Array<{
    id: number
    name: string
    stockQuantity: number
    thumbnailUrl: string | null
  }>
}

export function parseRange(
  value: string | string[] | undefined
): AnalyticsRange {
  const raw = Number(Array.isArray(value) ? value[0] : value)
  return (ANALYTICS_RANGES as readonly number[]).includes(raw)
    ? (raw as AnalyticsRange)
    : 30
}

/** Admin-only, always fresh (never cached) — the numbers must reflect "now". */
export async function getAdminAnalytics(
  accessToken: string,
  range: AnalyticsRange
): Promise<AnalyticsDashboard> {
  const response = await backendFetch(`/admin/analytics?range=${range}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const parsed = await parseJson<{ data: AnalyticsDashboard }>(response)
  return parsed.data
}
