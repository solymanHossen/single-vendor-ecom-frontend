// Shapes returned by the backend's GET /storefront/navigation endpoint and
// the /api/search route handler. Kept in their own module (no server
// imports) so client components can share them with the data layer.

export type CollectionKey =
  | "new-arrivals"
  | "on-sale"
  | "best-sellers"
  | "top-rated"

export interface NavigationCategoryChild {
  id: number
  name: string
  slug: string
  iconUrl: string | null
  productCount: number
}

export interface NavigationCategory extends NavigationCategoryChild {
  description: string | null
  children: NavigationCategoryChild[]
}

export interface NavigationCollection {
  key: CollectionKey
  title: string
  description: string
  productCount: number
  previewImageUrl: string | null
}

/** Money fields are decimal strings, exactly as the API serializes them. */
export interface NavigationProduct {
  id: number
  name: string
  slug: string
  thumbnailUrl: string | null
  basePrice: string
  discountPrice: string | null
  categoryName: string
  categorySlug: string
  summary: string | null
}

export interface NavigationPromotion {
  code: string
  discountType: "PERCENTAGE" | "FIXED_AMOUNT"
  discountValue: string
  minOrderAmount: string | null
  maxDiscountAmount: string | null
  validUntil: string
}

export interface StorefrontNavigation {
  categories: NavigationCategory[]
  collections: NavigationCollection[]
  spotlight: NavigationProduct | null
  trending: NavigationProduct[]
  promotion: NavigationPromotion | null
  generatedAt: string
}

export type SearchResult = Omit<NavigationProduct, "summary">

export interface SearchResponse {
  query: string
  results: SearchResult[]
  total: number
}
