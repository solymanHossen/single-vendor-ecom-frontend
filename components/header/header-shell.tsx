"use client"

import * as React from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/brand/logo"
import { AnnouncementBar } from "./announcement-bar"
import { NavMenu } from "./nav-menu"
import { SearchCommand } from "./search-command"
import { CartTrigger } from "./cart-trigger"
import { useCart } from "@/components/cart/cart-provider"
import { UserMenu } from "./user-menu"
import { MobileNav } from "./mobile-nav"
import { Button } from "@/components/ui/button"
import type { StorefrontNavigation } from "@/lib/storefront-types"

export type HeaderTab = "home" | "shop" | "about"

export interface HeaderProps {
  activeTab?: HeaderTab
  onTabChange?: (tab: HeaderTab) => void
  onScrollToSection?: (id: string) => void
  searchQuery?: string
  onSearchChange?: (value: string) => void
  wishlistCount?: number
  onWishlistClick?: () => void
}

export interface HeaderShellProps extends HeaderProps {
  navigation: StorefrontNavigation
}

/**
 * Interactive half of the header (scroll elevation, menus, search palette).
 * Data is fetched by the server `Header` and handed in as `navigation`.
 */
export function HeaderShell({
  navigation,
  activeTab,
  onTabChange,
  onScrollToSection,
  searchQuery,
  onSearchChange,
  wishlistCount = 0,
  onWishlistClick,
}: HeaderShellProps) {
  const cartCount = useCart().cart.totalItems
  const [isScrolled, setIsScrolled] = React.useState(false)
  // Shared so the mobile drawer's "Search" button opens the same palette.
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)

  // Monitor scroll for dynamic elevation transition
  React.useEffect(() => {
    // Hysteresis (collapse past 48px, expand under 8px) plus rAF throttling:
    // collapsing the promo bar shortens the page, and a single threshold
    // would make the header flicker when the scroll position sits near it.
    let frame = 0
    function handleScroll() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const y = window.scrollY
        setIsScrolled((previous) => (previous ? y > 8 : y > 48))
      })
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Promo bar folds away on scroll (animated grid-rows 1fr → 0fr), so
          the sticky header shrinks to a single slim bar while browsing. */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          isScrolled ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
        )}
        inert={isScrolled}
      >
        <div className="overflow-hidden">
          <AnnouncementBar promotion={navigation.promotion} />
        </div>
      </div>

      {/* Main navigation bar — fixed heights (64px → 56px) animate smoothly,
          unlike padding changes, and keep every control vertically centred. */}
      <div
        className={cn(
          "w-full border-b backdrop-blur-xl backdrop-saturate-150 transition-[background-color,border-color,box-shadow] duration-300",
          isScrolled
            ? "border-border/70 bg-background/85 shadow-[0_4px_20px_-12px_rgb(0_0_0/0.18)]"
            : "border-border/50 bg-background"
        )}
      >
        <div
          className={cn(
            "page-container flex items-center justify-between gap-6 transition-[height] duration-300 ease-out motion-reduce:transition-none",
            isScrolled ? "h-14" : "h-16"
          )}
        >
          {/* Left: Mobile Nav Drawer + Architectural Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <MobileNav
              navigation={navigation}
              onSearchOpen={() => setIsSearchOpen(true)}
              cartCount={cartCount}
              wishlistCount={wishlistCount}
            />

            <Link
              href="/"
              onClick={() => onTabChange?.("home")}
              className="focus:outline-none"
            >
              <Logo size="xs" framed={false} />
            </Link>
          </div>

          {/* Center: Desktop Navigation Menu */}
          <NavMenu
            navigation={navigation}
            activeTab={activeTab}
            onTabChange={onTabChange}
            onScrollToSection={onScrollToSection}
          />

          {/* Right Action Group: Search, Wishlist, Cart Trigger & User Auth Menu */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Interactive Search Command Palette */}
            <SearchCommand
              navigation={navigation}
              open={isSearchOpen}
              onOpenChange={setIsSearchOpen}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
            />

            {/* Saved Wishlist Shortcut */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onWishlistClick}
              className="relative size-9 rounded-full transition-colors hover:bg-muted/80"
              aria-label="Saved Wishlist"
              asChild={!onWishlistClick}
            >
              {onWishlistClick ? (
                <>
                  <Heart
                    className={cn(
                      "size-[18px]",
                      wishlistCount > 0 &&
                        "fill-destructive/30 text-destructive"
                    )}
                  />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive font-mono text-[10px] font-bold text-destructive-foreground shadow-2xs">
                      {wishlistCount}
                    </span>
                  )}
                </>
              ) : (
                <Link href="/wishlist">
                  <Heart
                    className={cn(
                      "size-[18px]",
                      wishlistCount > 0 &&
                        "fill-destructive/30 text-destructive"
                    )}
                  />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive font-mono text-[10px] font-bold text-destructive-foreground shadow-2xs">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}
            </Button>

            {/* Cart Flyout Sheet Trigger */}
            <CartTrigger />

            {/* User Profile / Auth Dropdown */}
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
