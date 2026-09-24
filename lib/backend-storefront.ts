import { ApiError, backendFetch, parseJson } from "./backend-client"
import { CATALOG_PAGE_SIZE, type CatalogFilters } from "./catalog-params"
import type {
  CatalogPage,
  ProductDetail,
  ReviewPage,
  StorefrontNavigation,
} from "./storefront-types"

export const NAVIGATION_CACHE_TAG = "storefront-navigation"
export const CATALOG_CACHE_TAG = "storefront-catalog"

const EMPTY_NAVIGATION: StorefrontNavigation = {
  categories: [],
  collections: [],
  spotlight: null,
  trending: [],
  promotion: null,
  generatedAt: new Date(0).toISOString(),
}

/**
 * Header navigation for every storefront page. Tagged + time-revalidated
 * (mirroring the backend's own 5-minute Redis TTL), and it degrades to an
 * empty menu rather than throwing — a backend hiccup must never take the
 * whole page down just because the header could not load.
 */
export async function getNavigation(): Promise<StorefrontNavigation> {
  try {
    const response = await backendFetch("/storefront/navigation", {
      next: { tags: [NAVIGATION_CACHE_TAG], revalidate: 300 },
    })
    const parsed = await parseJson<{ data: StorefrontNavigation }>(response)
    return parsed.data
  } catch (error: unknown) {
    console.error("[storefront] navigation unavailable:", error)
    return EMPTY_NAVIGATION
  }
}

/** Returns null for an unknown category slug (backend 404) so the page can notFound(). */
export async function getCatalogPage(
  filters: CatalogFilters
): Promise<CatalogPage | null> {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(CATALOG_PAGE_SIZE),
    sort: filters.sort,
  })
  if (filters.q) params.set("q", filters.q)
  if (filters.category) params.set("category", filters.category)
  if (filters.collection) params.set("collection", filters.collection)
  if (filters.minPrice !== undefined)
    params.set("minPrice", String(filters.minPrice))
  if (filters.maxPrice !== undefined)
    params.set("maxPrice", String(filters.maxPrice))
  if (filters.inStock) params.set("inStock", "true")

  const response = await backendFetch(
    `/storefront/products?${params.toString()}`,
    {
      next: { tags: [CATALOG_CACHE_TAG], revalidate: 60 },
    }
  )
  if (response.status === 404) return null
  const parsed = await parseJson<{ data: CatalogPage }>(response)
  return parsed.data
}

/**
 * Product by id or slug; null when missing or unpublished. Called from both
 * generateMetadata and the page — Next memoizes identical fetches within a
 * render, so that costs a single backend request.
 */
export async function getProductDetail(
  idOrSlug: string
): Promise<ProductDetail | null> {
  const response = await backendFetch(
    `/storefront/products/${encodeURIComponent(idOrSlug)}`,
    { next: { tags: [CATALOG_CACHE_TAG], revalidate: 60 } }
  )
  if (response.status === 404) return null
  const parsed = await parseJson<{ data: ProductDetail }>(response)
  return parsed.data
}

export const REVIEWS_PAGE_SIZE = 5

export async function getProductReviews(
  productId: number,
  page: number
): Promise<ReviewPage> {
  try {
    const response = await backendFetch(
      `/products/${productId}/reviews?page=${page}&limit=${REVIEWS_PAGE_SIZE}`,
      { next: { tags: [CATALOG_CACHE_TAG], revalidate: 60 } }
    )
    const parsed = await parseJson<{ data: ReviewPage }>(response)
    return parsed.data
  } catch (error: unknown) {
    // Reviews are secondary content: an outage hides them, not the product.
    if (!(error instanceof ApiError))
      console.error("[storefront] reviews unavailable:", error)
    return {
      items: [],
      meta: { page, limit: REVIEWS_PAGE_SIZE, total: 0, totalPages: 0 },
    }
  }
}
