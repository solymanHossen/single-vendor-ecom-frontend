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
import { UserMenu } from "./user-menu"
import { MobileNav } from "./mobile-nav"
import { Button } from "@/components/ui/button"
import { type CartItemType } from "@/components/cart/CartSheet"
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
  cartCount?: number
  cartItems?: CartItemType[]
  onCartClick?: () => void
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
  cartCount = 0,
  cartItems,
  onCartClick,
}: HeaderShellProps) {
  const [isScrolled, setIsScrolled] = React.useState(false)
  // Shared so the mobile drawer's "Search" button opens the same palette.
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)

  // Monitor scroll for dynamic elevation transition
  React.useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 12)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full flex-col transition-all duration-300">
      {/* Top Announcement Bar */}
      <AnnouncementBar promotion={navigation.promotion} />

      {/* Bold & Spacious Main Navigation Bar */}
      <div
        className={cn(
          "w-full border-b backdrop-blur-xl transition-all duration-300",
          isScrolled
            ? "border-border/80 bg-background/90 py-3.5 shadow-xs sm:py-4"
            : "border-border/40 bg-background/80 py-5 sm:py-6"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          {/* Left: Mobile Nav Drawer + Architectural Brand Logo */}
          <div className="flex items-center gap-4">
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
              <Logo size="sm" />
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
          <div className="flex items-center gap-2.5 sm:gap-4">
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
              className="relative size-11 rounded-full transition-colors hover:bg-muted/80"
              aria-label="Saved Wishlist"
              asChild={!onWishlistClick}
            >
              {onWishlistClick ? (
                <>
                  <Heart
                    className={cn(
                      "size-5",
                      wishlistCount > 0 &&
                        "fill-destructive/30 text-destructive"
                    )}
                  />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-destructive font-mono text-[10px] font-bold text-destructive-foreground shadow-2xs">
                      {wishlistCount}
                    </span>
                  )}
                </>
              ) : (
                <Link href="/wishlist">
                  <Heart
                    className={cn(
                      "size-5",
                      wishlistCount > 0 &&
                        "fill-destructive/30 text-destructive"
                    )}
                  />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-destructive font-mono text-[10px] font-bold text-destructive-foreground shadow-2xs">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}
            </Button>

            {/* Cart Flyout Sheet Trigger */}
            <CartTrigger
              cartCount={cartCount}
              items={cartItems}
              onCartClick={onCartClick}
            />

            {/* User Profile / Auth Dropdown */}
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
