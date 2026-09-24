"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  ArrowUpRight,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  Store,
  type LucideIcon,
} from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn, getInitials } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** Only SUPER_ADMIN may open this screen (mirrors the page's own guard). */
  superAdminOnly?: boolean
}

const MANAGE_ITEMS: readonly NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  {
    label: "Hero banners",
    href: "/admin/hero-banners",
    icon: Images,
    superAdminOnly: true,
  },
]

const STOREFRONT_ITEMS: readonly NavItem[] = [
  { label: "View store", href: "/", icon: Store },
  { label: "Browse products", href: "/products", icon: ShoppingBag },
]

export interface AdminUser {
  name: string | null
  email: string | null
  avatarUrl: string | null
  roleLabel: string
  isSuperAdmin: boolean
}

function NavSection({
  title,
  items,
  pathname,
  external = false,
  onNavigate,
}: {
  title: string
  items: readonly NavItem[]
  pathname: string
  external?: boolean
  onNavigate?: () => void
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
  const manage = MANAGE_ITEMS.filter(
    (item) => !item.superAdminOnly || user.isSuperAdmin
  )

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
            AURA
          </span>
          <span className="block text-xs font-medium text-muted-foreground">
            Admin console
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-7" aria-label="Admin">
        <NavSection
          title="Manage"
          items={manage}
          pathname={pathname}
          onNavigate={onNavigate}
        />
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
            AURA Admin
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
