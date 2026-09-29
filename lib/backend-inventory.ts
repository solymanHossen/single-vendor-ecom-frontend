import { backendFetch, parseJson } from "@/lib/backend-client"

// Mirrors the API's /admin/inventory entities.

export type StockLevel = "out" | "low" | "ok"
export type InventorySort = "attention" | "stock_asc" | "stock_desc" | "sold_desc" | "name"
export type ManualAdjustment = "RECEIVED" | "DAMAGED" | "LOST" | "CORRECTION" | "RECOUNT"
export type StockMovementType =
  | "INITIAL"
  | "SALE"
  | "ORDER_CANCELLED"
  | "RETURN_RESTOCKED"
  | "RETURN_WRITTEN_OFF"
  | ManualAdjustment
  | "IMPORT"

export interface InventoryUnit {
  productId: number
  variantId: number | null
  name: string
  variantLabel: string | null
  sku: string
  category: string
  imageUrl: string | null
  isPublished: boolean
  onHand: number
  threshold: number
  customThreshold: boolean
  level: StockLevel
  sold30d: number
  daysOfCover: number | null
  reorderSuggestion: number | null
  waiting: number
  price: string
}

export interface InventorySummary {
  units: number
  skus: number
  out: number
  low: number
  ok: number
  retailValue: string
  sold30d: number
  waiting: number
  storeThreshold: number
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface InventoryPage {
  items: InventoryUnit[]
  meta: Meta
  summary: InventorySummary
}

export interface StockMovement {
  id: number
  productId: number
  variantId: number | null
  productName: string
  variantLabel: string | null
  sku: string
  type: StockMovementType
  label: string
  quantity: number
  balanceAfter: number
  note: string | null
  orderId: number | null
  actor: { id: number; name: string | null; email: string } | null
  createdAt: string
}

export interface StockMovementPage {
  items: StockMovement[]
  meta: Meta
}

export interface ImportRow {
  line: number
  sku: string
  name: string | null
  current: number | null
  next: number | null
  error: string | null
}

export interface ImportResult {
  applied: boolean
  changed: number
  unchanged: number
  errors: number
  rows: ImportRow[]
}

export interface AdjustInput {
  productId: number
  variantId: number | null
  type: ManualAdjustment
  quantity: number
  note?: string
}

export const INVENTORY_PAGE_SIZE = 25
export const MAX_STOCK = 100_000

function authed(accessToken: string, init: RequestInit = {}): RequestInit {
  return {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
  }
}

async function request<T>(accessToken: string, path: string, init: RequestInit = {}): Promise<T> {
  const response = await backendFetch(path, authed(accessToken, init))
  return (await parseJson<{ data: T }>(response)).data
}

export function getInventory(
  accessToken: string,
  query: { page: number; level: StockLevel | "all"; sort: InventorySort; search?: string }
): Promise<InventoryPage> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(INVENTORY_PAGE_SIZE),
    level: query.level,
    sort: query.sort,
  })
  if (query.search) params.set("search", query.search)
  return request(accessToken, `/admin/inventory?${params.toString()}`)
}

export function getStockMovements(
  accessToken: string,
  query: { page: number; productId?: number; variantId?: number; type?: StockMovementType; limit?: number }
): Promise<StockMovementPage> {
  const params = new URLSearchParams({ page: String(query.page), limit: String(query.limit ?? 30) })
  if (query.productId) params.set("productId", String(query.productId))
  if (query.variantId) params.set("variantId", String(query.variantId))
  if (query.type) params.set("type", query.type)
  return request(accessToken, `/admin/inventory/movements?${params.toString()}`)
}

export const adjustStock = (accessToken: string, input: AdjustInput) =>
  request<InventoryUnit>(accessToken, "/admin/inventory/adjustments", { method: "POST", body: JSON.stringify(input) })

export const importStock = (accessToken: string, csv: string, dryRun: boolean) =>
  request<ImportResult>(accessToken, "/admin/inventory/import", { method: "POST", body: JSON.stringify({ csv, dryRun }) })

/** Raw CSV response, streamed through a route handler (keeps the token server-side). */
export const exportInventory = (accessToken: string) =>
  backendFetch("/admin/inventory/export", authed(accessToken))

/** Public: "email me when it's back". */
export async function subscribeStockAlert(
  productId: number,
  input: { email: string; variantId: number | null }
): Promise<void> {
  const response = await backendFetch(`/storefront/products/${productId}/stock-alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  await parseJson(response)
}
