"use client"

import * as React from "react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import {
  ChevronDown,
  ChevronRight,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  Package,
  ShieldCheck,
  UserCircle,
  type LucideIcon,
} from "lucide-react"
import { cn, getInitials } from "@/lib/utils"
import { ADMIN_ROLES, hasRole } from "@/auth.config"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"

const ROLE_LABELS: Readonly<Record<string, string>> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  USER: "Member",
}

interface MenuLink {
  label: string
  description: string
  href: string
  icon: LucideIcon
}

const ACCOUNT_LINKS: readonly MenuLink[] = [
  {
    label: "My profile",
    description: "Name, photo and contact details",
    href: "/profile",
    icon: UserCircle,
  },
  {
    label: "Orders",
    description: "Track, return or reorder",
    href: "/orders",
    icon: Package,
  },
  {
    label: "Wishlist",
    description: "Products you've saved",
    href: "/wishlist",
    icon: Heart,
  },
  {
    label: "Dashboard",
    description: "Your account at a glance",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
]

// shadcn's item recolours every descendant (even icon <path>s) on focus;
// overriding with `inherit` lets each row keep its own label/icon colours.
const ITEM_CLASS =
  "group/item cursor-pointer gap-3.5 rounded-xl px-2.5 py-2.5 text-[15px] transition-colors duration-150 focus:bg-muted focus:text-foreground not-data-[variant=destructive]:focus:**:text-inherit"

function MenuRow({ link }: { link: MenuLink }) {
  const Icon = link.icon
  return (
    <DropdownMenuItem asChild className={ITEM_CLASS}>
      <Link href={link.href}>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground! transition-colors group-focus/item:bg-background">
          <Icon className="size-5 text-foreground!" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-foreground!">
            {link.label}
          </span>
          <span className="block truncate text-sm text-muted-foreground!">
            {link.description}
          </span>
        </span>
      </Link>
    </DropdownMenuItem>
  )
}

export function UserMenu() {
  const { data: session, status } = useSession()
  const isAdmin = hasRole(session?.user?.role, ADMIN_ROLES)

  if (status === "unauthenticated" || !session) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="ml-1 h-9 rounded-full px-3.5 text-xs font-semibold shadow-xs"
        asChild
      >
        <Link href="/login">
          <LogIn className="mr-1.5 size-3.5" />
          Sign in
        </Link>
      </Button>
    )
  }

  const name = session.user?.name || "My account"
  const firstName = name.split(/\s+/)[0] ?? name
  const initials = getInitials(session.user?.name, session.user?.email)
  const roleLabel = ROLE_LABELS[session.user?.role ?? "USER"] ?? "Member"

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="group relative ml-1 flex h-10 items-center gap-2 rounded-full border border-border/70 bg-background py-1 pr-3 pl-1 shadow-xs transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted"
          aria-label="Account menu"
        >
          <Avatar className="size-8">
            {session.user?.avatarUrl && (
              <AvatarImage src={session.user.avatarUrl} alt="" />
            )}
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-28 truncate text-sm font-medium text-foreground lg:inline">
            {firstName}
          </span>
          <ChevronDown className="hidden size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 lg:block" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-80 rounded-2xl p-2 shadow-[0_20px_50px_-12px_rgb(0_0_0/0.25)] ring-foreground/8"
      >
        {/* Identity card */}
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center gap-3.5 rounded-xl bg-muted/60 p-3.5">
            <Avatar className="size-12">
              {session.user?.avatarUrl && (
                <AvatarImage src={session.user.avatarUrl} alt="" />
              )}
              <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-base font-semibold text-foreground">
                  {name}
                </p>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    isAdmin
                      ? "bg-foreground text-background"
                      : "bg-background text-foreground"
                  )}
                >
                  {roleLabel}
                </span>
              </div>
              <p className="truncate text-sm font-normal text-muted-foreground">
                {session.user?.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuGroup className="py-1.5">
          {ACCOUNT_LINKS.map((link) => (
            <MenuRow key={link.href} link={link} />
          ))}
        </DropdownMenuGroup>

        {isAdmin && (
          <>
            <DropdownMenuSeparator className="mx-1 my-1" />
            <DropdownMenuGroup className="py-1.5">
              <DropdownMenuItem
                asChild
                className={cn(ITEM_CLASS, "focus:bg-primary/10")}
              >
                <Link href="/admin">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground!">
                    <ShieldCheck className="size-5 text-primary-foreground!" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-foreground!">
                      Admin panel
                    </span>
                    <span className="block truncate text-sm text-muted-foreground!">
                      Manage store content and settings
                    </span>
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground!" />
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator className="mx-1 my-1" />
        <DropdownMenuItem
          onSelect={() => signOut({ callbackUrl: "/" })}
          className={cn(
            ITEM_CLASS,
            "py-2 text-muted-foreground focus:bg-destructive/8 focus:text-destructive"
          )}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl">
            <LogOut className="size-5" />
          </span>
          <span className="font-medium">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
