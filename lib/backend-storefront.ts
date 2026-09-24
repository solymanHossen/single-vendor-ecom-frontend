import { backendFetch, parseJson } from "./backend-client"
import type { StorefrontNavigation } from "./storefront-types"

export const NAVIGATION_CACHE_TAG = "storefront-navigation"

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
