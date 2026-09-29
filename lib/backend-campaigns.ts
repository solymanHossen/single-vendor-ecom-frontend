import { backendFetch, parseJson, type UploadedFile } from "@/lib/backend-client"
import { CATALOG_CACHE_TAG } from "@/lib/backend-storefront"
import type { CatalogPage, CatalogProductCard, CatalogSort } from "@/lib/storefront-types"

// Mirrors the API's campaign entities (/storefront/campaigns, /admin/campaigns).

export type CampaignStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "ENDED"
export type CampaignDiscountType = "PERCENTAGE" | "FIXED_AMOUNT"

export interface PublicCampaign {
  id: number
  name: string
  slug: string
  tagline: string | null
  description: string | null
  discountType: CampaignDiscountType
  discountValue: string
  maxDiscountAmount: string | null
  /** "20% off" */
  label: string
  startsAt: string
  endsAt: string
  status: CampaignStatus
  bannerUrl: string | null
  accentColor: string | null
}

export interface Campaign extends PublicCampaign {
  isActive: boolean
  isFeatured: boolean
  productCount: number
  categoryCount: number
  stats: { orders: number; units: number; revenue: string }
  createdAt: string
  updatedAt: string
}

export interface CampaignProduct {
  id: number
  name: string
  imageUrl: string | null
  price: string
  campaignPrice: string
  stockQuantity: number
  isPublished: boolean
}

export interface CampaignDetail extends Campaign {
  products: CampaignProduct[]
  categories: Array<{ id: number; name: string; productCount: number }>
  coveredProductCount: number
}

export interface CampaignPage {
  items: Campaign[]
  meta: { page: number; limit: number; total: number; totalPages: number }
  counts: Record<CampaignStatus | "ALL", number>
}

export interface FeaturedCampaign {
  campaign: PublicCampaign
  products: CatalogProductCard[]
  productCount: number
}

export interface CampaignInput {
  name: string
  slug?: string
  tagline: string | null
  description: string | null
  discountType: CampaignDiscountType
  discountValue: number
  maxDiscountAmount: number | null
  startsAt: string
  endsAt: string
  isActive: boolean
  isFeatured: boolean
  bannerUrl: string | null
  accentColor: string | null
  productIds: number[]
  categoryIds: number[]
}

export const CAMPAIGN_PRODUCTS_PAGE_SIZE = 24
export const ADMIN_CAMPAIGNS_PAGE_SIZE = 20

const cached = { next: { tags: [CATALOG_CACHE_TAG], revalidate: 60 } }

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

// ── Storefront ──────────────────────────────────────────────────────────────

/** Never throws — the homepage just skips the section. */
export async function getFeaturedCampaign(): Promise<FeaturedCampaign | null> {
  try {
    const response = await backendFetch("/storefront/campaigns/featured", cached)
    return (await parseJson<{ data: FeaturedCampaign | null }>(response)).data
  } catch (error: unknown) {
    console.error("[storefront] featured campaign unavailable:", error)
    return null
  }
}

/** Null when it doesn't exist or is a draft. */
export async function getPublicCampaign(slug: string): Promise<PublicCampaign | null> {
  const response = await backendFetch(`/storefront/campaigns/${encodeURIComponent(slug)}`, cached)
  if (response.status === 404) return null
  return (await parseJson<{ data: PublicCampaign }>(response)).data
}

export async function getCampaignProducts(
  slug: string,
  query: { page: number; sort: CatalogSort }
): Promise<CatalogPage> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(CAMPAIGN_PRODUCTS_PAGE_SIZE),
    sort: query.sort,
  })
  const response = await backendFetch(
    `/storefront/campaigns/${encodeURIComponent(slug)}/products?${params.toString()}`,
    cached
  )
  return (await parseJson<{ data: CatalogPage }>(response)).data
}

// ── Admin ───────────────────────────────────────────────────────────────────

export function getAdminCampaigns(
  accessToken: string,
  query: { page: number; status: CampaignStatus | "ALL"; search?: string }
): Promise<CampaignPage> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(ADMIN_CAMPAIGNS_PAGE_SIZE),
    status: query.status,
  })
  if (query.search) params.set("search", query.search)
  return request(accessToken, `/admin/campaigns?${params.toString()}`)
}

export async function getAdminCampaign(accessToken: string, id: number): Promise<CampaignDetail | null> {
  const response = await backendFetch(`/admin/campaigns/${id}`, authed(accessToken))
  if (response.status === 404) return null
  return (await parseJson<{ data: CampaignDetail }>(response)).data
}

/** Create omits empty fields (the API treats absent as "none"); update sends null to clear. */
export const createCampaign = (accessToken: string, input: CampaignInput) =>
  request<CampaignDetail>(accessToken, "/admin/campaigns", {
    method: "POST",
    body: JSON.stringify(Object.fromEntries(Object.entries(input).filter(([, value]) => value !== null))),
  })

export const updateCampaign = (accessToken: string, id: number, input: Partial<CampaignInput>) =>
  request<CampaignDetail>(accessToken, `/admin/campaigns/${id}`, { method: "PATCH", body: JSON.stringify(input) })

export const endCampaign = (accessToken: string, id: number) =>
  request<CampaignDetail>(accessToken, `/admin/campaigns/${id}/end`, { method: "POST" })

export const deleteCampaign = (accessToken: string, id: number) =>
  request<null>(accessToken, `/admin/campaigns/${id}`, { method: "DELETE" })

export async function uploadCampaignBanner(accessToken: string, file: File): Promise<UploadedFile> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("folder", "campaigns")
  const response = await backendFetch("/storage/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  })
  return (await parseJson<{ data: UploadedFile }>(response)).data
}
