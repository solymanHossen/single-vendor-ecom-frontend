import { getStoreSettings } from "@/lib/backend-settings"

/**
 * Browsers still ask for /favicon.ico directly (bookmarks, downloads, some
 * crawlers). Point them at whatever icon the admin set in Settings.
 */
export async function GET(request: Request): Promise<Response> {
  const settings = await getStoreSettings()
  const icon = settings.faviconUrl ?? settings.logoUrl ?? "/aura-logo.png"
  return Response.redirect(new URL(icon, request.url), 307)
}
