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

// ── Catalog listing (GET /storefront/products) ──────────────────────────────

export const CATALOG_SORTS = [
  "featured",
  "newest",
  "price-asc",
  "price-desc",
  "rating",
  "best-selling",
] as const
export type CatalogSort = (typeof CATALOG_SORTS)[number]

export interface CatalogProductCard {
  id: number
  name: string
  slug: string
  thumbnailUrl: string | null
  hoverImageUrl: string | null
  basePrice: string
  discountPrice: string | null
  stockQuantity: number
  categoryName: string
  categorySlug: string
  ratingAverage: number
  reviewCount: number
  variantCount: number
  isNew: boolean
}

export interface CatalogCategoryRef {
  id: number
  name: string
  slug: string
}

export interface CatalogAppliedCategory extends CatalogCategoryRef {
  description: string | null
  parent: CatalogCategoryRef | null
}

export interface CatalogCategoryFacet extends CatalogCategoryRef {
  productCount: number
  children: CatalogCategoryFacet[]
}

export interface CatalogPage {
  items: CatalogProductCard[]
  meta: { page: number; limit: number; total: number; totalPages: number }
  facets: {
    categories: CatalogCategoryFacet[]
    priceRange: { min: string; max: string } | null
  }
  category: CatalogAppliedCategory | null
}

// ── Product detail (GET /storefront/products/:idOrSlug) ─────────────────────

export interface ProductOptionGroup {
  attributeId: number
  name: string
  values: Array<{ id: number; value: string }>
}

export interface ProductVariant {
  id: number
  sku: string
  price: string
  stockQuantity: number
  imageUrl: string | null
  optionIds: number[]
}

export interface RatingSummary {
  average: number
  count: number
  distribution: Record<"1" | "2" | "3" | "4" | "5", number>
}

export interface ProductDetail {
  id: number
  name: string
  slug: string
  description: string
  basePrice: string
  discountPrice: string | null
  sku: string
  stockQuantity: number
  metaTitle: string | null
  metaDesc: string | null
  category: CatalogAppliedCategory
  images: Array<{ id: number; url: string; isThumbnail: boolean }>
  optionGroups: ProductOptionGroup[]
  variants: ProductVariant[]
  rating: RatingSummary
  recentlySold: number
  related: CatalogProductCard[]
  createdAt: string
}

// ── Reviews (GET /products/:id/reviews) ─────────────────────────────────────

export interface ProductReview {
  id: number
  reviewer: { id: number; name: string | null }
  orderId: number | null
  rating: number
  comment: string | null
  images: Array<{ id: number; imageUrl: string }>
  reply: { id: number; replyText: string; createdAt: string } | null
  createdAt: string
}

export interface ReviewPage {
  items: ProductReview[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}
