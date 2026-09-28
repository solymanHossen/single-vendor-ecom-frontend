import { getAllHeroBannersAdmin } from "@/lib/backend-hero"
import { HeroBannerManager } from "@/components/admin/hero-banner-manager"
import { AccessDenied } from "@/components/admin/access-denied"
import { getAdminAccess } from "@/lib/admin-access"

export default async function HeroBannersAdminPage() {
  const access = await getAdminAccess()
  if (!access.can("banners.manage")) return <AccessDenied area="homepage banners" />

  const banners = await getAllHeroBannersAdmin(access.accessToken)

  // The manager renders its own page header (it owns the "New banner" action).
  return <HeroBannerManager banners={banners} />
}
