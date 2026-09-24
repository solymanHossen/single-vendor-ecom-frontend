"use client"

import * as React from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import {
  Menu,
  Search,
  Heart,
  LogIn,
  UserPlus,
  LogOut,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
} from "lucide-react"
import Image from "next/image"
import { isOptimizableImage } from "@/lib/images"
import { categoryHref, collectionHref, SHOP_PATH } from "@/lib/routes"
import type { StorefrontNavigation } from "@/lib/storefront-types"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/brand/logo"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

export interface MobileNavProps {
  navigation: StorefrontNavigation
  onSearchOpen?: () => void
  cartCount?: number
  wishlistCount?: number
}

export function MobileNav({
  navigation,
  onSearchOpen,
  cartCount = 0,
  wishlistCount = 0,
}: MobileNavProps) {
  const [open, setOpen] = React.useState(false)
  const { data: session } = useSession()

  const handleNavigate = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full hover:bg-muted/70 md:hidden"
          aria-label="Toggle Mobile Menu"
        >
          <Menu className="size-5 text-foreground" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex w-[310px] flex-col justify-between p-0 sm:w-[350px]"
      >
        <SheetHeader className="space-y-1 border-b border-border p-6">
          <SheetTitle className="sr-only">Store menu</SheetTitle>
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={handleNavigate}
              className="focus:outline-none"
            >
              <Logo size="sm" />
            </Link>
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Next-Gen Electronics & Streetwear.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {/* Quick Actions Bar */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleNavigate()
                onSearchOpen?.()
              }}
              className="w-full justify-start gap-2 rounded-xl text-xs"
            >
              <Search className="size-3.5 text-muted-foreground" />
              Search
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNavigate}
              asChild
              className="w-full justify-start gap-2 rounded-xl text-xs"
            >
              <Link href="/wishlist">
                <Heart className="size-3.5 text-destructive" />
                Wishlist ({wishlistCount})
              </Link>
            </Button>
          </div>

          <Separator />

          {/* Catalog categories — expandable department tree from the API */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Shop Categories
            </p>
            {navigation.categories.length === 0 ? (
              <p className="px-2.5 text-xs text-muted-foreground">
                Catalog coming soon.
              </p>
            ) : (
              <div className="space-y-1">
                {navigation.categories.map((category) => (
                  <details
                    key={category.id}
                    className="group rounded-xl open:bg-muted/40"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl p-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center gap-3">
                        {category.iconUrl ? (
                          <Image
                            src={category.iconUrl}
                            alt=""
                            width={28}
                            height={28}
                            sizes="28px"
                            unoptimized={!isOptimizableImage(category.iconUrl)}
                            className="size-7 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <LayoutGrid className="size-4" />
                          </span>
                        )}
                        <span>{category.name}</span>
                      </span>
                      <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        {category.productCount}
                        <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                      </span>
                    </summary>
                    <div className="space-y-0.5 pr-2 pb-2 pl-12">
                      <Link
                        href={categoryHref(category.slug)}
                        onClick={handleNavigate}
                        className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold text-primary hover:bg-muted"
                      >
                        All {category.name}
                        <ChevronRight className="size-3.5" />
                      </Link>
                      {category.children.map((child) => (
                        <Link
                          key={child.id}
                          href={categoryHref(child.slug)}
                          onClick={handleNavigate}
                          className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs text-foreground hover:bg-muted"
                        >
                          {child.name}
                          <span className="text-[11px] text-muted-foreground">
                            {child.productCount}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>

          {navigation.collections.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Collections
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {navigation.collections.map((collection) => (
                    <Link
                      key={collection.key}
                      href={collectionHref(collection.key)}
                      onClick={handleNavigate}
                      className="rounded-xl border border-border/60 p-2.5 transition-colors hover:bg-muted"
                    >
                      <p className="text-xs font-semibold text-foreground">
                        {collection.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {collection.productCount} products
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Additional Links */}
          <div className="space-y-1">
            <Link
              href={SHOP_PATH}
              onClick={handleNavigate}
              className="flex items-center justify-between p-2 text-xs font-medium text-foreground transition-colors hover:text-primary"
            >
              All Products
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </Link>
            <Link
              href="/about"
              onClick={handleNavigate}
              className="flex items-center justify-between p-2 text-xs font-medium text-foreground transition-colors hover:text-primary"
            >
              About Us
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* User Auth Footer */}
        <div className="border-t border-border bg-muted/30 p-4">
          {session ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {session.user?.name?.slice(0, 1) || "U"}
                  </div>
                  <div>
                    <p className="max-w-[130px] truncate text-xs font-semibold text-foreground">
                      {session.user?.name}
                    </p>
                    <p className="max-w-[130px] truncate text-[10px] text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    handleNavigate()
                    signOut({ callbackUrl: "/" })
                  }}
                  className="size-8 text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNavigate}
                className="rounded-xl text-xs"
                asChild
              >
                <Link href="/login">
                  <LogIn className="mr-1 size-3.5" />
                  Sign In
                </Link>
              </Button>
              <Button
                size="sm"
                onClick={handleNavigate}
                className="rounded-xl text-xs font-semibold"
                asChild
              >
                <Link href="/register">
                  <UserPlus className="mr-1 size-3.5" />
                  Register
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
