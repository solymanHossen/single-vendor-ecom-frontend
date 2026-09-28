import type { CollectionKey } from "./storefront-types"

// Single source of truth for storefront URLs, so the header, search, cards
// and catalog pages can never disagree on a link's shape.

export const PRODUCTS_PATH = "/products"

export function categoryHref(slug: string): string {
  return `${PRODUCTS_PATH}?category=${encodeURIComponent(slug)}`
}

export function collectionHref(key: CollectionKey): string {
  return `${PRODUCTS_PATH}?collection=${key}`
}

/** Canonical product URL. The detail route also accepts a slug and redirects here. */
export function productHref(id: number): string {
  return `${PRODUCTS_PATH}/${id}`
}

export function searchHref(query: string): string {
  return `${PRODUCTS_PATH}?q=${encodeURIComponent(query.trim())}`
}

/** Customer account area — everything lives under /dashboard. */
export const ACCOUNT_ROUTES = {
  overview: "/dashboard",
  orders: "/dashboard/orders",
  addresses: "/dashboard/addresses",
  profile: "/dashboard/profile",
} as const

export function accountOrderHref(id: number): string {
  return `${ACCOUNT_ROUTES.orders}/${id}`
}
