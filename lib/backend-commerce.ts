import { backendFetch, parseJson } from "@/lib/backend-client"

// Mirrors the NestJS cart / orders / addresses entities. Money arrives as
// decimal strings; dates as ISO strings.

// ── Cart ────────────────────────────────────────────────────────────────────

export type CartLineIssue = "UNAVAILABLE" | "OUT_OF_STOCK" | "INSUFFICIENT_STOCK"

export interface CartLine {
  key: string
  productId: number
  variantId: number | null
  name: string
  slug: string
  imageUrl: string | null
  variantLabel: string | null
  sku: string
  unitPrice: string
  compareAtPrice: string | null
  quantity: number
  subtotal: string
  availableStock: number
  issue: CartLineIssue | null
}

export interface Cart {
  items: CartLine[]
  totalItems: number
  totalPrice: string
  hasIssues: boolean
}

export const EMPTY_CART: Cart = { items: [], totalItems: 0, totalPrice: "0", hasIssues: false }

/** Mirrors the API's shipping rules (orders.constants.ts). */
export const FREE_SHIPPING_THRESHOLD = 10_000
export const MAX_CART_LINE_QUANTITY = 100

export type CartCaller =
  | { accessToken: string; sessionId?: undefined }
  | { accessToken?: undefined; sessionId: string }

function cartHeaders(caller: CartCaller, json = false): Record<string, string> {
  const headers: Record<string, string> = caller.accessToken
    ? { Authorization: `Bearer ${caller.accessToken}` }
    : { "x-session-id": caller.sessionId ?? "" }
  if (json) headers["Content-Type"] = "application/json"
  return headers
}

async function cartRequest(caller: CartCaller, path: string, init: RequestInit = {}) {
  const response = await backendFetch(`/cart${path}`, {
    ...init,
    headers: cartHeaders(caller, init.body !== undefined),
  })
  return (await parseJson<{ data: Cart }>(response)).data
}

export const fetchCart = (caller: CartCaller) => cartRequest(caller, "")

export const addCartLine = (
  caller: CartCaller,
  line: { productId: number; variantId?: number; quantity: number }
) => cartRequest(caller, "/items", { method: "POST", body: JSON.stringify(line) })

export const setCartLineQuantity = (caller: CartCaller, key: string, quantity: number) =>
  cartRequest(caller, `/items/${encodeURIComponent(key)}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  })

export const removeCartLine = (caller: CartCaller, key: string) =>
  cartRequest(caller, `/items/${encodeURIComponent(key)}`, { method: "DELETE" })

export async function mergeGuestCart(accessToken: string, sessionId: string): Promise<Cart> {
  const response = await backendFetch("/cart/merge", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "x-session-id": sessionId },
  })
  return (await parseJson<{ data: Cart }>(response)).data
}

// ── Addresses ───────────────────────────────────────────────────────────────

export interface Address {
  id: number
  recipientName: string | null
  phone: string | null
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface AddressInput {
  recipientName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

function authed(accessToken: string, init: RequestInit = {}): RequestInit {
  return {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
  }
}

export async function getAddresses(accessToken: string): Promise<Address[]> {
  const response = await backendFetch("/addresses", authed(accessToken))
  const addresses = (await parseJson<{ data: Address[] }>(response)).data
  // Default first, then newest.
  return [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || b.id - a.id)
}

export async function createAddress(accessToken: string, input: AddressInput): Promise<Address> {
  const response = await backendFetch(
    "/addresses",
    authed(accessToken, { method: "POST", body: JSON.stringify(input) })
  )
  return (await parseJson<{ data: Address }>(response)).data
}

// ── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED"
export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED"
export type PaymentProvider = "STRIPE" | "SSLCOMMERZ" | "BKASH" | "COD"

export const ORDER_STATUSES: readonly OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
]

export interface OrderQuote {
  itemCount: number
  subtotal: string
  discountAmount: string
  shippingFee: string | null
  totalAmount: string
  coupon: { code: string; discountType: string; discountValue: string } | null
  couponError: string | null
  freeShippingThreshold: string
  amountToFreeShipping: string
  insideDhaka: boolean | null
  problems: string[]
}

export interface OrderItem {
  id: number
  productId: number
  variantId: number | null
  variantLabel: string | null
  sku: string
  product: { id: number; name: string; slug: string; imageUrl: string | null }
  quantity: number
  unitPrice: string
  subtotal: string
}

export interface Order {
  id: number
  userId: number | null
  customer: { id: number; name: string | null; email: string; phone: string | null } | null
  status: OrderStatus
  nextStatuses: OrderStatus[]
  paymentStatus: PaymentStatus
  payment: { provider: PaymentProvider; status: PaymentStatus; transactionId: string | null } | null
  subtotal: string
  totalAmount: string
  discountAmount: string
  shippingFee: string
  couponCode: string | null
  note: string | null
  shippingAddress: Omit<Address, "id" | "isDefault">
  itemCount: number
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderPage {
  items: Order[]
  meta: { page: number; limit: number; total: number; totalPages: number }
  statusCounts: Array<{ status: OrderStatus; count: number }>
}

export interface OrderListQuery {
  page: number
  limit?: number
  status?: OrderStatus
  search?: string
}

export async function getQuote(
  accessToken: string,
  input: { addressId?: number; couponCode?: string }
): Promise<OrderQuote> {
  const response = await backendFetch(
    "/orders/quote",
    authed(accessToken, { method: "POST", body: JSON.stringify(input) })
  )
  return (await parseJson<{ data: OrderQuote }>(response)).data
}

export async function placeOrder(
  accessToken: string,
  input: { addressId: number; couponCode?: string; note?: string }
): Promise<Order> {
  const response = await backendFetch(
    "/orders",
    authed(accessToken, {
      method: "POST",
      body: JSON.stringify({ ...input, paymentMethod: "COD" }),
    })
  )
  return (await parseJson<{ data: Order }>(response)).data
}

export async function getOrders(accessToken: string, query: OrderListQuery): Promise<OrderPage> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit ?? 10),
  })
  if (query.status) params.set("status", query.status)
  if (query.search) params.set("search", query.search)
  const response = await backendFetch(`/orders?${params.toString()}`, authed(accessToken))
  return (await parseJson<{ data: OrderPage }>(response)).data
}

/** Null when the order doesn't exist or isn't visible to the caller. */
export async function getOrder(accessToken: string, id: number): Promise<Order | null> {
  const response = await backendFetch(`/orders/${id}`, authed(accessToken))
  if (response.status === 404) return null
  return (await parseJson<{ data: Order }>(response)).data
}

export async function cancelOrder(accessToken: string, id: number): Promise<Order> {
  const response = await backendFetch(
    `/orders/${id}/cancel`,
    authed(accessToken, { method: "PATCH" })
  )
  return (await parseJson<{ data: Order }>(response)).data
}

export async function updateOrderStatus(
  accessToken: string,
  id: number,
  status: OrderStatus
): Promise<Order> {
  const response = await backendFetch(
    `/orders/${id}/status`,
    authed(accessToken, { method: "PATCH", body: JSON.stringify({ status }) })
  )
  return (await parseJson<{ data: Order }>(response)).data
}

/** API error bodies carry either one message or a list (e.g. several stock problems). */
export function apiMessage(data: unknown, fallback: string): string {
  const message = (data as { message?: unknown } | null)?.message
  if (Array.isArray(message)) return message.join(" ")
  return typeof message === "string" ? message : fallback
}
