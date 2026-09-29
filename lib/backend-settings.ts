import { backendFetch, parseJson, type UploadedFile } from "@/lib/backend-client"

/** Mirrors the API's SettingsEntity (the `app_settings` singleton). */
export interface StoreSettings {
  allowRegistration: boolean
  enableGoogleLogin: boolean
  storeName: string
  tagline: string
  logoUrl: string | null
  faviconUrl: string | null
  supportEmail: string | null
  supportPhone: string | null
  whatsappNumber: string | null
  storeAddress: string | null
  businessHours: string | null
  facebookUrl: string | null
  instagramUrl: string | null
  youtubeUrl: string | null
  tiktokUrl: string | null
  shippingFeeInsideDhaka: number
  shippingFeeOutsideDhaka: number
  freeShippingThreshold: number
  lowStockThreshold: number
  announcementEnabled: boolean
  announcementMessage: string
  announcementPromotion: boolean
  metaTitle: string | null
  metaDescription: string | null
}

export type StoreSettingsPatch = Partial<StoreSettings>

export const STORE_SETTINGS_CACHE_TAG = "store-settings"

/** Used if the API is unreachable, so the storefront still renders. */
export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  allowRegistration: true,
  enableGoogleLogin: true,
  storeName: "AURA",
  tagline: "Next-gen tech & streetwear",
  logoUrl: null,
  faviconUrl: null,
  supportEmail: null,
  supportPhone: null,
  whatsappNumber: null,
  storeAddress: null,
  businessHours: null,
  facebookUrl: null,
  instagramUrl: null,
  youtubeUrl: null,
  tiktokUrl: null,
  shippingFeeInsideDhaka: 60,
  shippingFeeOutsideDhaka: 120,
  freeShippingThreshold: 10_000,
  lowStockThreshold: 5,
  announcementEnabled: true,
  announcementMessage: "100% authentic products · Cash on delivery nationwide · 7-day easy returns",
  announcementPromotion: true,
  metaTitle: null,
  metaDescription: null,
}

/**
 * Read on every page (layout, header, footer). Tagged so a save in the
 * admin console refreshes it at once; time-revalidated as a safety net.
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const response = await backendFetch("/settings/public", {
      next: { tags: [STORE_SETTINGS_CACHE_TAG], revalidate: 300 },
    })
    const data = (await parseJson<{ data: Partial<StoreSettings> }>(response)).data
    return { ...DEFAULT_STORE_SETTINGS, ...data }
  } catch (error: unknown) {
    console.error("[settings] unavailable, using defaults:", error)
    return DEFAULT_STORE_SETTINGS
  }
}

export async function getStoreSettingsFresh(accessToken: string): Promise<StoreSettings> {
  const response = await backendFetch("/settings", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return { ...DEFAULT_STORE_SETTINGS, ...(await parseJson<{ data: StoreSettings }>(response)).data }
}

export async function updateStoreSettings(
  accessToken: string,
  patch: StoreSettingsPatch
): Promise<StoreSettings> {
  const response = await backendFetch("/settings", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  })
  return (await parseJson<{ data: StoreSettings }>(response)).data
}

export async function uploadBrandingImage(accessToken: string, file: File): Promise<UploadedFile> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("folder", "branding")
  const response = await backendFetch("/storage/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  })
  return (await parseJson<{ data: UploadedFile }>(response)).data
}
