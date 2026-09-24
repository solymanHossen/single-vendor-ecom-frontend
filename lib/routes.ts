import type { CollectionKey } from "./storefront-types"

// Single source of truth for storefront URLs, so the header, search,
// footer and (future) shop pages can never disagree on a link's shape.

export const SHOP_PATH = "/shop"

export function categoryHref(slug: string): string {
  return `${SHOP_PATH}?category=${encodeURIComponent(slug)}`
}

export function collectionHref(key: CollectionKey): string {
  return `${SHOP_PATH}?collection=${key}`
}

export function productHref(slug: string): string {
  return `/product/${encodeURIComponent(slug)}`
}

export function searchHref(query: string): string {
  return `${SHOP_PATH}?q=${encodeURIComponent(query.trim())}`
}
