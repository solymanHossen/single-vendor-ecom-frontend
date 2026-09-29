"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  ArrowUpRight,
  Headset,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ScrollText,
  Settings,
  ShieldCheck,
  ReceiptText,
  Users,
  ShoppingBag,
  Star,
  Store,
  TicketPercent,
  type LucideIcon,
} from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { useStoreSettings } from "@/components/store-settings-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn, getInitials } from "@/lib/utils"
import { can, type Access, type Requirement } from "@/lib/permissions"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** Hidden unless the viewer has this (mirrors the page's own guard). */
  requires?: Requirement
}

const SECTIONS: ReadonlyArray<{ title: string; items: readonly NavItem[] }> = [
  {
    title: "Manage",
    items: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard },
      { label: "Orders", href: "/admin/orders", icon: ReceiptText, requires: "orders.view" },
      { label: "Products", href: "/admin/products", icon: Package, requires: "catalog.manage" },
      { label: "Coupons", href: "/admin/coupons", icon: TicketPercent, requires: "coupons.manage" },
      { label: "Support", href: "/admin/tickets", icon: Headset, requires: "tickets.manage" },
      { label: "Reviews", href: "/admin/reviews", icon: Star, requires: "reviews.moderate" },
      { label: "Hero banners", href: "/admin/hero-banners", icon: Images, requires: "banners.manage" },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Users", href: "/admin/users", icon: Users, requires: "customers.view" },
      { label: "Roles & permissions", href: "/admin/roles", icon: ShieldCheck, requires: "owner" },
      { label: "Activity log", href: "/admin/activity", icon: ScrollText, requires: "owner" },
    ],
  },
  {
    title: "Store",
    items: [{ label: "Settings", href: "/admin/settings", icon: Settings, requires: "settings.manage" }],
  },
]

function StoreName() {
  return <>{useStoreSettings().storeName}</>
}

const STOREFRONT_ITEMS: readonly NavItem[] = [
  { label: "View store", href: "/", icon: Store },
  { label: "Browse products", href: "/products", icon: ShoppingBag },
]

export interface AdminUser {
  name: string | null
  email: string | null
  avatarUrl: string | null
  roleLabel: string
  access: Access
  /** Counts shown next to nav items, keyed by href (e.g. tickets needing a reply). */
  badges?: Record<string, number>
}

function NavSection({
  title,
  items,
  pathname,
  external = false,
  onNavigate,
  badges = {},
}: {
  title: string
  items: readonly NavItem[]
  pathname: string
  external?: boolean
  onNavigate?: () => void
  badges?: Record<string, number>
}) {
  return (
    <div className="space-y-1.5">
      <p className="px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {title}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon
          const active =
            !external &&
            (item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href))
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors duration-150",
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {(badges[item.href] ?? 0) > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                      active ? "bg-background text-foreground" : "bg-primary text-primary-foreground"
                    )}
                    aria-label={`${badges[item.href]} waiting`}
                  >
                    {badges[item.href]}
                  </span>
                )}
                {external && (
                  <ArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SidebarBody({
  user,
  onNavigate,
}: {
  user: AdminUser
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const sections = SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.requires || can(user.access, item.requires)),
  })).filter((section) => section.items.length > 0)

  return (
    <div className="flex h-full flex-col gap-8 p-4">
      <Link
        href="/admin"
        onClick={onNavigate}
        className="flex items-center gap-3 px-2 pt-2"
      >
        <Logo size="sm" framed={false} />
        <span className="leading-tight">
          <span className="block text-base font-semibold text-foreground">
            <StoreName />
          </span>
          <span className="block text-xs font-medium text-muted-foreground">
            Admin console
          </span>
        </span>
      </Link>

      <nav className="-mx-1 flex-1 space-y-7 overflow-y-auto px-1" aria-label="Admin">
        {sections.map((section) => (
          <NavSection
            key={section.title}
            title={section.title}
            items={section.items}
            pathname={pathname}
            onNavigate={onNavigate}
            badges={user.badges}
          />
        ))}
        <NavSection
          title="Storefront"
          items={STOREFRONT_ITEMS}
          pathname={pathname}
          external
          onNavigate={onNavigate}
        />
      </nav>

      <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
        <Avatar className="size-10">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
            {getInitials(user.name, user.email)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {user.name ?? "Admin"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user.roleLabel}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut({ callbackUrl: "/" })}
          aria-label="Sign out"
          className="size-9 rounded-lg text-muted-foreground hover:text-destructive"
        >
          <LogOut className="size-4.5" />
        </Button>
      </div>
    </div>
  )
}

/** Fixed sidebar on desktop; a slim top bar with a slide-in drawer on mobile. */
export function AdminSidebar({ user }: { user: AdminUser }) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-68 shrink-0 border-r border-border/70 bg-background lg:block">
        <SidebarBody user={user} />
      </aside>

      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/70 bg-background/90 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Logo size="xs" framed={false} />
          <span className="text-[15px] font-semibold text-foreground">
            <StoreName /> Admin
          </span>
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-10 rounded-xl"
              aria-label="Open admin menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Admin navigation</SheetTitle>
            <SidebarBody user={user} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
