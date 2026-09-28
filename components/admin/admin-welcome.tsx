import Link from "next/link"
import {
  ArrowRight,
  Images,
  Package,
  ReceiptText,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react"
import type { Requirement } from "@/lib/permissions"
import { AdminPageHeader } from "./admin-page-header"

const SHORTCUTS: ReadonlyArray<{
  href: string
  label: string
  description: string
  icon: LucideIcon
  requires: Requirement
}> = [
  { href: "/admin/orders", label: "Orders", description: "Find, fulfil and follow up orders.", icon: ReceiptText, requires: "orders.view" },
  { href: "/admin/products", label: "Products", description: "Edit the catalogue, prices and stock.", icon: Package, requires: "catalog.manage" },
  { href: "/admin/hero-banners", label: "Hero banners", description: "Arrange the homepage carousel.", icon: Images, requires: "banners.manage" },
  { href: "/admin/users", label: "Users", description: "Look up and help customers.", icon: Users, requires: "customers.view" },
  { href: "/admin/settings", label: "Settings", description: "Brand, delivery and store preferences.", icon: Settings, requires: "settings.manage" },
]

/** Overview for staff whose role doesn't include the sales dashboard. */
export function AdminWelcome({
  firstName,
  can,
}: {
  firstName: string
  can: (requirement: Requirement) => boolean
}) {
  const available = SHORTCUTS.filter((shortcut) => can(shortcut.requires))
  return (
    <>
      <AdminPageHeader
        title={`Welcome, ${firstName}`}
        description={
          available.length > 0
            ? "Here's what your role lets you work on."
            : "Your account doesn't have a staff role yet. Ask the store's super admin to assign one."
        }
      />
      {available.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {available.map(({ href, label, description, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex h-full items-start gap-4 rounded-3xl border border-border/70 bg-card p-6 transition-[border-color,box-shadow] hover:border-foreground/30 hover:shadow-sm"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between font-semibold text-foreground">
                    {label}
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-1 block text-[15px] text-muted-foreground">{description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
