'use client';

import * as React from 'react';
import Link from 'next/link';
import { Heart, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnnouncementBar } from './announcement-bar';
import { NavMenu } from './nav-menu';
import { SearchCommand } from './search-command';
import { CartTrigger } from './cart-trigger';
import { UserMenu } from './user-menu';
import { MobileNav } from './mobile-nav';
import { Button } from '@/components/ui/button';
import { type CartItemType } from '@/components/cart/CartSheet';

export type HeaderTab = 'home' | 'shop' | 'about';

export interface HeaderProps {
  activeTab?: HeaderTab;
  onTabChange?: (tab: HeaderTab) => void;
  onScrollToSection?: (id: string) => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  wishlistCount?: number;
  onWishlistClick?: () => void;
  cartCount?: number;
  cartItems?: CartItemType[];
  onCartClick?: () => void;
}

export function Header({
  activeTab,
  onTabChange,
  onScrollToSection,
  searchQuery,
  onSearchChange,
  wishlistCount = 0,
  onWishlistClick,
  cartCount = 2,
  cartItems,
  onCartClick,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Monitor scroll for dynamic elevation transition
  React.useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 12);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full flex-col transition-all duration-300">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Bold & Spacious Main Navigation Bar */}
      <div
        className={cn(
          'w-full border-b transition-all duration-300 backdrop-blur-xl',
          isScrolled
            ? 'bg-background/90 border-border/80 shadow-xs py-3.5 sm:py-4'
            : 'bg-background/80 border-border/40 py-5 sm:py-6'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
          {/* Left: Mobile Nav Drawer + Architectural Brand Logo */}
          <div className="flex items-center gap-4">
            <MobileNav
              cartCount={cartCount}
              wishlistCount={wishlistCount}
            />

            <Link
              href="/"
              onClick={() => onTabChange?.('home')}
              className="group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                <Zap className="size-4.5 fill-current" />
              </div>
              <span className="font-sans text-2xl sm:text-3xl tracking-wider font-black text-foreground group-hover:text-primary transition-colors uppercase">
                AURA
              </span>
              <span className="hidden md:inline-block text-[10px] font-semibold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Tech & Apparel
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation Menu */}
          <NavMenu
            activeTab={activeTab}
            onTabChange={onTabChange}
            onScrollToSection={onScrollToSection}
          />

          {/* Right Action Group: Search, Wishlist, Cart Trigger & User Auth Menu */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Interactive Search Command Palette */}
            <SearchCommand
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
            />

            {/* Saved Wishlist Shortcut */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onWishlistClick}
              className="relative size-11 rounded-full hover:bg-muted/80 transition-colors"
              aria-label="Saved Wishlist"
              asChild={!onWishlistClick}
            >
              {onWishlistClick ? (
                <>
                  <Heart className={cn('size-5', wishlistCount > 0 && 'text-destructive fill-destructive/30')} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground font-mono text-[10px] font-bold size-4.5 rounded-full flex items-center justify-center shadow-2xs">
                      {wishlistCount}
                    </span>
                  )}
                </>
              ) : (
                <Link href="/wishlist">
                  <Heart className={cn('size-5', wishlistCount > 0 && 'text-destructive fill-destructive/30')} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground font-mono text-[10px] font-bold size-4.5 rounded-full flex items-center justify-center shadow-2xs">
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
  );
}
