import { backendFetch, parseJson, type UploadedFile } from "./backend-client"

export type HeroBannerPlacement = "MAIN" | "SIDE"

export interface HeroBanner {
  id: number
  placement: HeroBannerPlacement
  title: string
  href: string
  imageUrl: string
  imageKey: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface HeroBannerInput {
  placement: HeroBannerPlacement
  title: string
  href: string
  imageUrl: string
  imageKey: string
  isActive?: boolean
}

export type UpdateHeroBannerInput = Partial<HeroBannerInput>

// Public, cacheable storefront content — unlike the auth module's blanket
// no-store, this is tagged + time-revalidated so the homepage doesn't hit
// the backend on every request, and the admin actions below invalidate the
// tag on write so edits still show up immediately.
export async function getHeroBanners(
  placement?: HeroBannerPlacement
): Promise<HeroBanner[]> {
  const query = placement ? `?placement=${placement}` : ""
  const response = await backendFetch(`/hero-banners${query}`, {
    next: { tags: ["hero-banners"], revalidate: 60 },
  })

  const parsed = await parseJson<{ data: HeroBanner[] }>(response)
  return parsed.data
}

export async function getAllHeroBannersAdmin(
  accessToken: string
): Promise<HeroBanner[]> {
  const response = await backendFetch("/hero-banners/admin", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const parsed = await parseJson<{ data: HeroBanner[] }>(response)
  return parsed.data
}

export async function createHeroBanner(
  accessToken: string,
  data: HeroBannerInput
): Promise<HeroBanner> {
  const response = await backendFetch("/hero-banners", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  })

  const parsed = await parseJson<{ data: HeroBanner }>(response)
  return parsed.data
}

export async function updateHeroBanner(
  accessToken: string,
  id: number,
  data: UpdateHeroBannerInput
): Promise<HeroBanner> {
  const response = await backendFetch(`/hero-banners/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  })

  const parsed = await parseJson<{ data: HeroBanner }>(response)
  return parsed.data
}

export async function deleteHeroBanner(
  accessToken: string,
  id: number
): Promise<void> {
  const response = await backendFetch(`/hero-banners/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  await parseJson(response)
}

export async function reorderHeroBanners(
  accessToken: string,
  items: { id: number; sortOrder: number }[]
): Promise<void> {
  const response = await backendFetch("/hero-banners/reorder", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ items }),
  })

  await parseJson(response)
}

export async function uploadHeroBannerImage(
  accessToken: string,
  file: File
): Promise<UploadedFile> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("folder", "hero-banners")

  const response = await backendFetch("/storage/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  })

  const parsed = await parseJson<{ data: UploadedFile }>(response)
  return parsed.data
}
