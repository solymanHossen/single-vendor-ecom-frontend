import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { ADMIN_ROLES, SUPER_ADMIN_ROLES, hasRole } from "@/auth.config"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

const ROLE_LABELS: Readonly<Record<string, string>> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
}

/**
 * Admin console shell. The storefront header is replaced by a dedicated
 * sidebar so admin work has its own focused, app-like frame.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")
  if (!hasRole(session.user.role, ADMIN_ROLES)) redirect("/dashboard")

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-dvh bg-muted/30 lg:flex">
        <AdminSidebar
          user={{
            name: session.user.name ?? null,
            email: session.user.email ?? null,
            avatarUrl: session.user.avatarUrl ?? null,
            roleLabel: ROLE_LABELS[session.user.role] ?? "Admin",
            isSuperAdmin: hasRole(session.user.role, SUPER_ADMIN_ROLES),
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
