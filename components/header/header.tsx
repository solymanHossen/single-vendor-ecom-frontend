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

export type HeaderTab = 'home' | 'shop' | 'about';

export interface HeaderProps {
  /** Only meaningful on storefront tabs — optional everywhere else. */
  activeTab?: HeaderTab;
  onTabChange?: (tab: HeaderTab) => void;
  onScrollToSection?: (id: string) => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  wishlistCount?: number;
  onWishlistClick?: () => void;
  cartCount?: number;
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
  cartCount = 0,
  onCartClick,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Monitor scroll for elevation transition
  React.useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 10);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full flex-col transition-all duration-300">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Main Bar */}
      <div
        className={cn(
          'w-full border-b transition-all duration-300 backdrop-blur-md',
          isScrolled
            ? 'bg-background/90 border-border/80 shadow-xs py-3'
            : 'bg-background/80 border-border/40 py-4'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Mobile Nav Drawer + Brand Logo */}
          <div className="flex items-center gap-3">
            <MobileNav
              cartCount={cartCount}
              wishlistCount={wishlistCount}
            />

            <Link
              href="/"
              onClick={() => onTabChange?.('home')}
              className="group flex items-center gap-2 focus:outline-none"
            >
              <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                <Zap className="size-4 fill-current" />
              </div>
              <span className="font-sans text-2xl sm:text-3xl tracking-tight font-black text-foreground group-hover:text-primary transition-colors uppercase">
                AURA
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
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

          {/* Right: Actions (Search, Wishlist, Cart, User Auth Menu) */}
          <div className="flex items-center gap-2 sm:gap-3">
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
              className="relative size-10 rounded-full hover:bg-muted/70 transition-colors"
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

            {/* Cart Flyout Trigger */}
            <CartTrigger cartCount={cartCount} onCartClick={onCartClick} />

            {/* User Profile / Auth Dropdown */}
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
