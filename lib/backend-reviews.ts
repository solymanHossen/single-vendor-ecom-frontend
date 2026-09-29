import { ApiError, backendFetch, parseJson, type UploadedFile } from "@/lib/backend-client"
import { CATALOG_CACHE_TAG } from "@/lib/backend-storefront"

// Mirrors the API's review entities (/products/:id/reviews, /reviews, /admin/reviews).

export type ReviewSort = "recent" | "helpful" | "highest" | "lowest"
export type ReviewStatus = "PENDING" | "PUBLISHED" | "HIDDEN"
export type ReviewBlocker = "NOT_PURCHASED" | "NOT_DELIVERED" | "ALREADY_REVIEWED"

export interface Review {
  id: number
  rating: number
  title: string | null
  comment: string | null
  variantLabel: string | null
  verified: boolean
  helpfulCount: number
  images: Array<{ id: number; url: string }>
  reviewer: { name: string; avatarUrl: string | null }
  reply: { text: string; createdAt: string } | null
  edited: boolean
  createdAt: string
}

export interface OwnReview extends Review {
  productId: number
  status: ReviewStatus
}

export interface AdminReview extends OwnReview {
  product: { id: number; name: string; imageUrl: string | null }
  customer: { id: number; name: string | null; email: string }
  orderId: number | null
}

export interface ReviewSummary {
  average: number
  count: number
  distribution: Record<"1" | "2" | "3" | "4" | "5", number>
  withPhotos: number
  recommendRate: number | null
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProductReviews {
  items: Review[]
  meta: Meta
  summary: ReviewSummary
}

export interface MyReviewStatus {
  eligible: boolean
  blocker: ReviewBlocker | null
  review: OwnReview | null
  votedReviewIds: number[]
}

export interface ReviewInput {
  rating: number
  title: string
  comment: string
  images: string[]
}

export interface ReviewQuery {
  page: number
  sort: ReviewSort
  rating?: number
  withPhotos?: boolean
}

export const REVIEWS_PAGE_SIZE = 6
export const MAX_REVIEW_PHOTOS = 5
export const REVIEW_SORTS: ReadonlyArray<{ value: ReviewSort; label: string }> = [
  { value: "recent", label: "Most recent" },
  { value: "helpful", label: "Most helpful" },
  { value: "highest", label: "Highest rating" },
  { value: "lowest", label: "Lowest rating" },
]

/** Per-product cache tag, so one new review refreshes one product's page. */
export const reviewsTag = (productId: number) => `reviews:${productId}`

const EMPTY_SUMMARY: ReviewSummary = {
  average: 0,
  count: 0,
  distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
  withPhotos: 0,
  recommendRate: null,
}

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

// ── Public ──────────────────────────────────────────────────────────────────

export async function getProductReviews(productId: number, query: ReviewQuery): Promise<ProductReviews> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(REVIEWS_PAGE_SIZE),
    sort: query.sort,
  })
  if (query.rating) params.set("rating", String(query.rating))
  if (query.withPhotos) params.set("withPhotos", "true")
  try {
    const response = await backendFetch(`/products/${productId}/reviews?${params.toString()}`, {
      next: { tags: [CATALOG_CACHE_TAG, reviewsTag(productId)], revalidate: 60 },
    })
    return (await parseJson<{ data: ProductReviews }>(response)).data
  } catch (error: unknown) {
    // Reviews are secondary content: an outage hides them, not the product.
    if (!(error instanceof ApiError)) console.error("[storefront] reviews unavailable:", error)
    return {
      items: [],
      meta: { page: query.page, limit: REVIEWS_PAGE_SIZE, total: 0, totalPages: 0 },
      summary: EMPTY_SUMMARY,
    }
  }
}

// ── Signed-in shopper ───────────────────────────────────────────────────────

/** Null when it can't be loaded — the page then just shows the read-only view. */
export async function getMyReviewStatus(accessToken: string, productId: number): Promise<MyReviewStatus | null> {
  try {
    return await request<MyReviewStatus>(accessToken, `/products/${productId}/reviews/me`)
  } catch {
    return null
  }
}

export async function getMyReviews(accessToken: string): Promise<OwnReview[]> {
  try {
    return await request<OwnReview[]>(accessToken, "/reviews/mine")
  } catch {
    return []
  }
}

export const createReview = (accessToken: string, productId: number, input: ReviewInput) =>
  request<OwnReview>(accessToken, "/reviews", {
    method: "POST",
    body: JSON.stringify({ productId, ...input }),
  })

export const updateReview = (accessToken: string, id: number, input: ReviewInput) =>
  request<OwnReview>(accessToken, `/reviews/${id}`, { method: "PATCH", body: JSON.stringify(input) })

export const deleteReview = (accessToken: string, id: number) =>
  request<null>(accessToken, `/reviews/${id}`, { method: "DELETE" })

export const toggleHelpful = (accessToken: string, id: number) =>
  request<{ helpful: boolean; helpfulCount: number }>(accessToken, `/reviews/${id}/helpful`, { method: "POST" })

export async function uploadReviewPhoto(accessToken: string, file: File): Promise<UploadedFile> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("folder", "reviews")
  const response = await backendFetch("/storage/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  })
  return (await parseJson<{ data: UploadedFile }>(response)).data
}

// ── Moderation ──────────────────────────────────────────────────────────────

export interface AdminReviewPage {
  items: AdminReview[]
  meta: Meta
  counts: Record<ReviewStatus | "ALL", number>
}

export const ADMIN_REVIEWS_PAGE_SIZE = 20

export function getAdminReviews(
  accessToken: string,
  query: { page: number; status: ReviewStatus | "ALL"; rating?: number; search?: string }
): Promise<AdminReviewPage> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(ADMIN_REVIEWS_PAGE_SIZE),
    status: query.status,
  })
  if (query.rating) params.set("rating", String(query.rating))
  if (query.search) params.set("search", query.search)
  return request(accessToken, `/admin/reviews?${params.toString()}`)
}

/** Reviews waiting for a first look — the sidebar badge. Never throws. */
export async function getPendingReviewCount(accessToken: string): Promise<number> {
  try {
    return (await request<AdminReviewPage>(accessToken, "/admin/reviews?status=PENDING&limit=1")).meta.total
  } catch {
    return 0
  }
}

export const moderateReview = (accessToken: string, id: number, status: "PUBLISHED" | "HIDDEN") =>
  request<AdminReview>(accessToken, `/admin/reviews/${id}`, { method: "PATCH", body: JSON.stringify({ status }) })

export const replyToReview = (accessToken: string, id: number, replyText: string) =>
  request<AdminReview>(accessToken, `/admin/reviews/${id}/reply`, {
    method: "PUT",
    body: JSON.stringify({ replyText }),
  })

export const removeReviewReply = (accessToken: string, id: number) =>
  request<AdminReview>(accessToken, `/admin/reviews/${id}/reply`, { method: "DELETE" })
