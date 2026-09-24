import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { hasRole, SUPER_ADMIN_ROLES } from "@/auth.config"
import { getAllHeroBannersAdmin } from "@/lib/backend-hero"
import { HeroBannerManager } from "@/components/admin/hero-banner-manager"

export default async function HeroBannersAdminPage() {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")
  // Layout already gates on ADMIN_ROLES — this screen is stricter, so a
  // plain ADMIN gets bounced here instead of seeing a 403 from every action.
  if (!hasRole(session.user.role, SUPER_ADMIN_ROLES)) redirect("/dashboard")

  const banners = await getAllHeroBannersAdmin(session.accessToken)

  // The manager renders its own page header (it owns the "New banner" action).
  return <HeroBannerManager banners={banners} />
}
