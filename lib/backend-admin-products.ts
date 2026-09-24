import { backendFetch, parseJson, type UploadedFile } from "@/lib/backend-client"

// ── Types (mirror the NestJS entities; money arrives as decimal strings) ────

export type ProductStatusFilter = "all" | "published" | "draft"
export type ProductStockFilter = "all" | "in" | "low" | "out"
export type AdminProductSort =
  | "updatedAt"
  | "createdAt"
  | "name"
  | "basePrice"
  | "stockQuantity"

export interface AdminProductQuery {
  page: number
  search?: string
  categoryId?: number
  status: ProductStatusFilter
  stock: ProductStockFilter
  sortBy: AdminProductSort
  sortOrder: "asc" | "desc"
}

export interface AdminProductRow {
  id: number
  name: string
  slug: string
  sku: string
  basePrice: string
  discountPrice: string | null
  stockQuantity: number
  isPublished: boolean
  thumbnailUrl: string | null
  category: { id: number; name: string }
  variantCount: number
  orderCount: number
  createdAt: string
  updatedAt: string
}

export interface AdminProductSummary {
  total: number
  published: number
  draft: number
  lowStock: number
  outOfStock: number
  lowStockThreshold: number
}

export interface AdminProductPage {
  items: AdminProductRow[]
  meta: { page: number; limit: number; total: number; totalPages: number }
  summary: AdminProductSummary
}

export interface VariantOption {
  attributeOptionId: number
  attributeId: number
  attributeName: string
  value: string
}

export interface ProductVariant {
  id: number
  sku: string
  price: string
  stockQuantity: number
  imageUrl: string | null
  options: VariantOption[]
}

export interface ProductImage {
  id: number
  url: string
  isThumbnail: boolean
}

export interface AdminProduct {
  id: number
  categoryId: number
  category: { id: number; name: string; slug: string }
  name: string
  slug: string
  description: string
  basePrice: string
  discountPrice: string | null
  sku: string
  stockQuantity: number
  isPublished: boolean
  metaTitle: string | null
  metaDesc: string | null
  images: ProductImage[]
  variants: ProductVariant[]
  createdAt: string
  updatedAt: string
}

export interface ProductInput {
  categoryId: number
  name: string
  slug: string
  description: string
  basePrice: number
  discountPrice: number | null
  sku: string
  /** Omitted for products whose stock comes from their variants. */
  stockQuantity?: number
  isPublished: boolean
  metaTitle: string | null
  metaDesc: string | null
  images: Array<{ url: string; isThumbnail: boolean }>
}

export interface VariantInput {
  sku: string
  price: number
  stockQuantity: number
  attributeOptionIds: number[]
}

export interface CategoryNode {
  id: number
  name: string
  slug: string
  children: CategoryNode[]
}

export interface Attribute {
  id: number
  name: string
  options: Array<{ id: number; value: string }>
}

// ── Reads ───────────────────────────────────────────────────────────────────

export const ADMIN_PAGE_SIZE = 20

/** Mirrors LOW_STOCK_THRESHOLD in the API (also sent as summary.lowStockThreshold). */
export const LOW_STOCK_THRESHOLD = 5

function authed(accessToken: string, init?: RequestInit): RequestInit {
  return {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...init?.headers,
    },
  }
}

export async function getAdminProducts(
  accessToken: string,
  query: AdminProductQuery
): Promise<AdminProductPage> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(ADMIN_PAGE_SIZE),
    status: query.status,
    stock: query.stock,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  })
  if (query.search) params.set("search", query.search)
  if (query.categoryId) params.set("categoryId", String(query.categoryId))

  const response = await backendFetch(
    `/admin/products?${params.toString()}`,
    authed(accessToken)
  )
  return (await parseJson<{ data: AdminProductPage }>(response)).data
}

/** Returns null for a product that doesn't exist (the page 404s). */
export async function getAdminProduct(
  accessToken: string,
  id: number
): Promise<AdminProduct | null> {
  const response = await backendFetch(`/admin/products/${id}`, authed(accessToken))
  if (response.status === 404) return null
  return (await parseJson<{ data: AdminProduct }>(response)).data
}

export async function getCategoryTree(): Promise<CategoryNode[]> {
  const response = await backendFetch("/categories", { next: { revalidate: 300 } })
  return (await parseJson<{ data: CategoryNode[] }>(response)).data
}

export async function getAttributes(): Promise<Attribute[]> {
  const response = await backendFetch("/attributes", { next: { revalidate: 300 } })
  const attributes = (await parseJson<{ data: Attribute[] }>(response)).data
  return attributes
    .map((attribute) => ({
      id: attribute.id,
      name: attribute.name,
      options: attribute.options.map(({ id, value }) => ({ id, value })),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

// ── Writes ──────────────────────────────────────────────────────────────────

export async function createProduct(
  accessToken: string,
  data: ProductInput
): Promise<AdminProduct> {
  const { discountPrice, metaTitle, metaDesc, ...rest } = data
  // Create rejects nulls — omit the optional fields instead.
  const body = {
    ...rest,
    ...(discountPrice !== null && { discountPrice }),
    ...(metaTitle && { metaTitle }),
    ...(metaDesc && { metaDesc }),
  }
  const response = await backendFetch(
    "/products",
    authed(accessToken, { method: "POST", body: JSON.stringify(body) })
  )
  return (await parseJson<{ data: AdminProduct }>(response)).data
}

export async function updateProduct(
  accessToken: string,
  id: number,
  data: Partial<ProductInput>
): Promise<AdminProduct> {
  const response = await backendFetch(
    `/products/${id}`,
    authed(accessToken, { method: "PATCH", body: JSON.stringify(data) })
  )
  return (await parseJson<{ data: AdminProduct }>(response)).data
}

export async function deleteProduct(accessToken: string, id: number): Promise<void> {
  const response = await backendFetch(
    `/products/${id}`,
    authed(accessToken, { method: "DELETE" })
  )
  await parseJson(response)
}

export async function setProductsPublished(
  accessToken: string,
  ids: number[],
  isPublished: boolean
): Promise<number> {
  const response = await backendFetch(
    "/admin/products/status",
    authed(accessToken, {
      method: "PATCH",
      body: JSON.stringify({ ids, isPublished }),
    })
  )
  return (await parseJson<{ data: { updated: number } }>(response)).data.updated
}

export async function createVariant(
  accessToken: string,
  productId: number,
  data: VariantInput
): Promise<ProductVariant> {
  const response = await backendFetch(
    `/products/${productId}/variants`,
    authed(accessToken, { method: "POST", body: JSON.stringify(data) })
  )
  return (await parseJson<{ data: ProductVariant }>(response)).data
}

export async function updateVariant(
  accessToken: string,
  id: number,
  data: Partial<VariantInput>
): Promise<ProductVariant> {
  const response = await backendFetch(
    `/product-variants/${id}`,
    authed(accessToken, { method: "PATCH", body: JSON.stringify(data) })
  )
  return (await parseJson<{ data: ProductVariant }>(response)).data
}

export async function deleteVariant(accessToken: string, id: number): Promise<void> {
  const response = await backendFetch(
    `/product-variants/${id}`,
    authed(accessToken, { method: "DELETE" })
  )
  await parseJson(response)
}

export async function uploadProductImage(
  accessToken: string,
  file: File
): Promise<UploadedFile> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("folder", "products")
  const response = await backendFetch(
    "/storage/upload",
    authed(accessToken, { method: "POST", body: formData })
  )
  return (await parseJson<{ data: UploadedFile }>(response)).data
}
