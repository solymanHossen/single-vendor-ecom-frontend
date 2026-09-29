import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { getAdminAccess } from "@/lib/admin-access"
import { getSupportQueueCount } from "@/lib/backend-tickets"
import { getPendingReviewCount } from "@/lib/backend-reviews"

/**
 * Admin console shell. The storefront header is replaced by a dedicated
 * sidebar so admin work has its own focused, app-like frame. Access is read
 * fresh from the API on every request, so a changed role applies at once.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile, accessToken, can } = await getAdminAccess()
  const [supportQueue, pendingReviews] = await Promise.all([
    can("tickets.manage") ? getSupportQueueCount(accessToken) : 0,
    can("reviews.moderate") ? getPendingReviewCount(accessToken) : 0,
  ])
  const roleLabel =
    profile.role === "SUPER_ADMIN" ? "Super admin" : (profile.staffRole?.name ?? "Staff · no role yet")

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-dvh bg-muted/30 lg:flex">
        <AdminSidebar
          user={{
            name: profile.name,
            email: profile.email,
            avatarUrl: profile.avatarUrl,
            roleLabel,
            access: { role: profile.role, permissions: profile.permissions },
            badges: { "/admin/tickets": supportQueue, "/admin/reviews": pendingReviews },
          }}
        />
        <main className="min-w-0 flex-1">
          <div className="w-full px-4 py-8 sm:px-8 lg:px-10 lg:py-10 2xl:px-14">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
