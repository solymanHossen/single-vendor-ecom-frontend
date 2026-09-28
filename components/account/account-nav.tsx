"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MapPin,
  Package,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, getInitials } from "@/lib/utils"

const LINKS: ReadonlyArray<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: Package },
  { href: "/dashboard/addresses", label: "Addresses", icon: MapPin },
  { href: "/dashboard/support", label: "Help & support", icon: LifeBuoy },
  { href: "/dashboard/profile", label: "Profile & security", icon: ShieldCheck },
]

const SUPPORT_HREF = "/dashboard/support"

function UnreadBadge({ count, active }: { count: number; active: boolean }) {
  if (count <= 0) return null
  return (
    <span
      className={cn(
        "ml-auto rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
        active ? "bg-background text-foreground" : "bg-primary text-primary-foreground"
      )}
      aria-label={`${count} new ${count === 1 ? "reply" : "replies"}`}
    >
      {count}
    </span>
  )
}

export interface AccountUser {
  name: string | null
  email: string
  avatarUrl: string | null
  memberSince: string
}

function isActive(pathname: string, href: string): boolean {
  // "/dashboard" is the parent of every other tab, so it matches exactly.
  if (href === "/dashboard") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AccountNav({ user, unreadSupport = 0 }: { user: AccountUser; unreadSupport?: number }) {
  const pathname = usePathname()

  return (
    <>
      {/* Phones: a compact identity row, then scrollable tabs. */}
      <div className="min-w-0 space-y-4 lg:hidden">
        <div className="flex items-center gap-3.5">
          <Avatar className="size-12">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
            <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{user.name ?? "Your account"}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <nav aria-label="Account" className="-mx-4 overflow-x-auto px-4 pb-1">
          <ul className="flex gap-2">
            {LINKS.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-foreground hover:border-foreground/40"
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                    {href === SUPPORT_HREF && <UnreadBadge count={unreadSupport} active={active} />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Desktop: a sticky identity card with the full menu. */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-2 rounded-3xl border border-border/70 bg-card p-3">
          <div className="flex items-center gap-3.5 rounded-2xl p-3">
            <Avatar className="size-14">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
              <AvatarFallback className="text-base">{getInitials(user.name, user.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{user.name ?? "Your account"}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Member since {user.memberSince}</p>
            </div>
          </div>
          <nav aria-label="Account" className="border-t border-border/70 pt-2">
            <ul className="space-y-1">
              {LINKS.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href)
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-11 items-center gap-3 rounded-xl px-3.5 text-[15px] font-medium transition-colors",
                        active
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="size-[18px]" aria-hidden="true" />
                      {label}
                      {href === SUPPORT_HREF && <UnreadBadge count={unreadSupport} active={active} />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div className="border-t border-border/70 pt-2">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex h-11 w-full items-center gap-3 rounded-xl px-3.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-[18px]" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
