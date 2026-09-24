import type {
  AdminProductQuery,
  AdminProductSort,
  ProductStatusFilter,
  ProductStockFilter,
} from "@/lib/backend-admin-products"

type RawParams = Record<string, string | string[] | undefined>

const STATUSES: readonly ProductStatusFilter[] = ["all", "published", "draft"]
const STOCKS: readonly ProductStockFilter[] = ["all", "in", "low", "out"]
const SORTS: readonly AdminProductSort[] = [
  "updatedAt",
  "createdAt",
  "name",
  "basePrice",
  "stockQuantity",
]

export const DEFAULT_ADMIN_PRODUCT_QUERY: AdminProductQuery = {
  page: 1,
  status: "all",
  stock: "all",
  sortBy: "updatedAt",
  sortOrder: "desc",
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

/** Unknown or malformed params fall back to defaults — the URL never errors. */
export function parseAdminProductQuery(raw: RawParams): AdminProductQuery {
  const page = Number.parseInt(first(raw.page) ?? "", 10)
  const categoryId = Number.parseInt(first(raw.category) ?? "", 10)
  const search = first(raw.q)?.trim().slice(0, 150)
  return {
    page: page > 0 ? page : 1,
    search: search || undefined,
    categoryId: categoryId > 0 ? categoryId : undefined,
    status: oneOf(first(raw.status), STATUSES, "all"),
    stock: oneOf(first(raw.stock), STOCKS, "all"),
    sortBy: oneOf(first(raw.sort), SORTS, "updatedAt"),
    sortOrder: first(raw.order) === "asc" ? "asc" : "desc",
  }
}

/** Builds /admin/products?… omitting defaults; any filter change resets the page. */
export function adminProductsHref(
  query: AdminProductQuery,
  patch: Partial<AdminProductQuery> = {}
): string {
  const next = { ...query, ...patch }
  if (!("page" in patch)) next.page = 1
  const params = new URLSearchParams()
  if (next.search) params.set("q", next.search)
  if (next.categoryId) params.set("category", String(next.categoryId))
  if (next.status !== "all") params.set("status", next.status)
  if (next.stock !== "all") params.set("stock", next.stock)
  if (next.sortBy !== "updatedAt") params.set("sort", next.sortBy)
  if (next.sortOrder !== "desc") params.set("order", next.sortOrder)
  if (next.page > 1) params.set("page", String(next.page))
  const qs = params.toString()
  return qs ? `/admin/products?${qs}` : "/admin/products"
}
