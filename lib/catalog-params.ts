import { z } from "zod"
import { PRODUCTS_PATH } from "./routes"
import {
  CATALOG_SORTS,
  type CatalogSort,
  type CollectionKey,
} from "./storefront-types"

/**
 * The catalog's state lives entirely in the URL: every filter, sort and page
 * is a query param. That makes results shareable and bookmarkable, keeps the
 * back button meaningful, lets the page render on the server, and means
 * every filter works as a plain link even before JavaScript loads.
 */
export interface CatalogFilters {
  q?: string
  category?: string
  collection?: CollectionKey
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  sort: CatalogSort
  page: number
}

export type RawSearchParams = Record<string, string | string[] | undefined>

export const CATALOG_PAGE_SIZE = 24

export const SORT_LABELS: Readonly<Record<CatalogSort, string>> = {
  featured: "Featured",
  newest: "Newest arrivals",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
  "best-selling": "Best selling",
}

const COLLECTION_KEYS = [
  "new-arrivals",
  "on-sale",
  "best-sellers",
  "top-rated",
] as const

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value

// Each field is parsed independently: one malformed param (a hand-edited
// URL, a stale bookmark) is dropped instead of failing the whole page.
const fieldParsers = {
  q: z.string().trim().min(1).max(150),
  category: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{1,120}$/),
  collection: z.enum(COLLECTION_KEYS),
  minPrice: z.coerce.number().nonnegative().max(100_000_000),
  maxPrice: z.coerce.number().nonnegative().max(100_000_000),
  inStock: z.literal("true").transform(() => true),
  sort: z.enum(CATALOG_SORTS),
  page: z.coerce.number().int().min(1).max(1000),
}

function parseField<K extends keyof typeof fieldParsers>(
  key: K,
  params: RawSearchParams
): z.infer<(typeof fieldParsers)[K]> | undefined {
  const raw = first(params[key])
  if (raw === undefined || raw === "") return undefined
  const result = fieldParsers[key].safeParse(raw)
  return result.success
    ? (result.data as z.infer<(typeof fieldParsers)[K]>)
    : undefined
}

export function parseCatalogParams(params: RawSearchParams): CatalogFilters {
  let minPrice = parseField("minPrice", params)
  let maxPrice = parseField("maxPrice", params)
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    ;[minPrice, maxPrice] = [maxPrice, minPrice]
  }

  return {
    q: parseField("q", params),
    category: parseField("category", params),
    collection: parseField("collection", params),
    minPrice,
    maxPrice,
    inStock: parseField("inStock", params),
    sort: parseField("sort", params) ?? "featured",
    page: parseField("page", params) ?? 1,
  }
}

/** Serializes filters to a query string, omitting defaults for clean URLs. */
export function toSearchParams(filters: CatalogFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.q) params.set("q", filters.q)
  if (filters.category) params.set("category", filters.category)
  if (filters.collection) params.set("collection", filters.collection)
  if (filters.minPrice !== undefined)
    params.set("minPrice", String(filters.minPrice))
  if (filters.maxPrice !== undefined)
    params.set("maxPrice", String(filters.maxPrice))
  if (filters.inStock) params.set("inStock", "true")
  if (filters.sort !== "featured") params.set("sort", filters.sort)
  if (filters.page > 1) params.set("page", String(filters.page))
  return params
}

/**
 * Href for the current filters with `changes` applied. Any filter change
 * resets to page 1 — staying on page 5 of a narrower result set would
 * usually land on an empty page.
 */
export function catalogHref(
  filters: CatalogFilters,
  changes: Partial<CatalogFilters> = {}
): string {
  const resetsPage = Object.keys(changes).some((key) => key !== "page")
  const next: CatalogFilters = {
    ...filters,
    ...changes,
    page: changes.page ?? (resetsPage ? 1 : filters.page),
  }
  const query = toSearchParams(next).toString()
  return query ? `${PRODUCTS_PATH}?${query}` : PRODUCTS_PATH
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return Boolean(
    filters.q ||
    filters.category ||
    filters.collection ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.inStock
  )
}
