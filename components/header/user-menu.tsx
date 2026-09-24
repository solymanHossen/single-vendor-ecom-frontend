"use client"

import * as React from "react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import {
  User,
  UserCircle,
  LayoutDashboard,
  ShieldCheck,
  Package,
  Heart,
  LogOut,
  LogIn,
  ChevronDown,
} from "lucide-react"
import { cn, getInitials } from "@/lib/utils"
import { ADMIN_ROLES, hasRole } from "@/auth.config"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"

export function UserMenu() {
  const { data: session, status } = useSession()
  const isAdmin = hasRole(session?.user?.role, ADMIN_ROLES)

  if (status === "unauthenticated" || !session) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="rounded-full text-xs font-semibold shadow-xs"
        asChild
      >
        <Link href="/login">
          <LogIn className="mr-1.5 size-3.5" />
          Sign in
        </Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex h-10 items-center gap-2 rounded-full px-2 hover:bg-muted/70 focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="User Account Menu"
        >
          <Avatar className="size-8 border border-border/80">
            {session.user?.avatarUrl && (
              <AvatarImage
                src={session.user.avatarUrl}
                alt={session.user.name || ""}
              />
            )}
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {getInitials(session.user?.name, session.user?.email)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[100px] truncate text-xs font-medium text-foreground lg:inline-flex">
            {session.user?.name || "My Account"}
          </span>
          <ChevronDown className="hidden size-3.5 text-muted-foreground lg:inline-block" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-60 rounded-xl border border-border p-2 shadow-lg"
      >
        {/* User Identity Header */}
        <DropdownMenuLabel className="space-y-1 p-2">
          <div className="flex items-center justify-between">
            <p className="max-w-[140px] truncate text-xs font-semibold text-foreground">
              {session.user?.name || "Account"}
            </p>
            {isAdmin ? (
              <Badge
                variant="default"
                className="h-4 px-1.5 py-0 font-mono text-[9px]"
              >
                Admin
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="h-4 px-1.5 py-0 font-mono text-[9px]"
              >
                Member
              </Badge>
            )}
          </div>
          <p className="truncate text-[11px] text-muted-foreground">
            {session.user?.email}
          </p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Navigation Section */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-lg p-2 text-xs"
          >
            <Link href="/profile">
              <UserCircle className="mr-2 size-4 text-muted-foreground" />
              <span>My Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-lg p-2 text-xs"
          >
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 size-4 text-muted-foreground" />
              <span>Customer Dashboard</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-lg p-2 text-xs"
          >
            <Link href="/dashboard?tab=orders">
              <Package className="mr-2 size-4 text-muted-foreground" />
              <span>Order History</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-lg p-2 text-xs"
          >
            <Link href="/wishlist">
              <Heart className="mr-2 size-4 text-muted-foreground" />
              <span>Saved Wishlist</span>
            </Link>
          </DropdownMenuItem>

          {isAdmin && (
            <DropdownMenuItem
              asChild
              className="cursor-pointer rounded-lg p-2 text-xs font-medium text-primary"
            >
              <Link href="/admin">
                <ShieldCheck className="mr-2 size-4 text-primary" />
                <span>Admin Panel</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Logout Action */}
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => signOut({ callbackUrl: "/" })}
          className="cursor-pointer rounded-lg p-2 text-xs"
        >
          <LogOut className="mr-2 size-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
