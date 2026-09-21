'use client';

import * as React from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import {
  Search, ShoppingBag, Heart, X, User, LogOut, LogIn, UserPlus,
  LayoutDashboard, ShieldCheck, UserCircle,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { ADMIN_ROLES, hasRole } from '@/auth.config';
import {
  Avatar, AvatarImage, AvatarFallback,
} from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export type HeaderTab = 'home' | 'shop' | 'about';

interface HeaderProps {
  /** Only meaningful on the storefront page — omit everywhere else. */
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

/** Nav item that behaves as an in-page tab switch on the storefront, or a
 * plain link back home from anywhere else. */
function NavItem({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const className = cn(
    'hover:text-primary-foreground transition-colors',
    active ? 'text-accent border-b-2 border-accent pb-0.5' : 'text-primary-foreground/70',
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        {children}
      </button>
    );
  }

  return (
    <Link href="/" className={className}>
      {children}
    </Link>
  );
}

export function Header({
  activeTab,
  onTabChange,
  onScrollToSection,
  searchQuery,
  onSearchChange,
  wishlistCount,
  onWishlistClick,
  cartCount,
  onCartClick,
}: HeaderProps) {
  const { data: session, status } = useSession();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  const isAdmin = hasRole(session?.user.role, ADMIN_ROLES);

  return (
    <header className="sticky top-0 z-40 bg-primary/95 backdrop-blur-md border-b border-primary-foreground/10 text-primary-foreground transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide">
          <NavItem active={activeTab === 'shop'} onClick={onTabChange ? () => onTabChange('shop') : undefined}>
            Shop
          </NavItem>
          <NavItem onClick={onScrollToSection ? () => onScrollToSection('bestsellers-section') : undefined}>
            Bestsellers
          </NavItem>
          <NavItem onClick={onScrollToSection ? () => onScrollToSection('gallery-section') : undefined}>
            Gallery
          </NavItem>
          <NavItem active={activeTab === 'about'} onClick={onTabChange ? () => onTabChange('about') : undefined}>
            About
          </NavItem>
        </nav>

        <div className="flex items-center">
          {onTabChange ? (
            <button
              onClick={() => onTabChange('home')}
              className="font-serif text-3xl sm:text-4xl tracking-tight italic font-bold text-primary-foreground hover:opacity-95 transition-opacity"
            >
              Homedine
            </button>
          ) : (
            <Link
              href="/"
              className="font-serif text-3xl sm:text-4xl tracking-tight italic font-bold text-primary-foreground hover:opacity-95 transition-opacity"
            >
              Homedine
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onSearchChange && (
            <>
              <div className="relative hidden sm:block w-48 md:w-64">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Product..."
                  value={searchQuery ?? ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-background text-foreground text-xs sm:text-sm pl-9 pr-4 py-2 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsSearchOpen((v) => !v)}
                className="sm:hidden p-2 rounded-full hover:bg-primary-foreground/10 text-primary-foreground"
              >
                <Search className="w-5 h-5" />
              </button>
            </>
          )}

          {onWishlistClick && (
            <button
              onClick={onWishlistClick}
              className="relative p-2.5 rounded-full hover:bg-primary-foreground/10 text-primary-foreground transition-colors"
              title="Saved items"
            >
              <Heart className={cn('w-5 h-5', !!wishlistCount && 'text-destructive fill-destructive/30')} />
              {!!wishlistCount && (
                <span className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>
          )}

          {onCartClick && (
            <button
              onClick={onCartClick}
              className="relative p-2.5 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground transition-all duration-200 flex items-center justify-center"
            >
              <ShoppingBag className="w-5 h-5" />
              {!!cartCount && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground border-2 border-primary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-full hover:bg-primary-foreground/10 transition-colors p-1"
                aria-label="Account menu"
              >
                <Avatar>
                  {session?.user.avatarUrl && <AvatarImage src={session.user.avatarUrl} alt="" />}
                  <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground">
                    {status === 'authenticated' ? getInitials(session.user.name, session.user.email) : (
                      <User className="w-4 h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              {session ? (
                <>
                  <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
                    <span className="text-sm font-medium">{session.user.name || 'Your account'}</span>
                    <span className="text-xs text-muted-foreground truncate">{session.user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <UserCircle />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <ShieldCheck />
                        Admin panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={() => signOut({ callbackUrl: '/' })}>
                    <LogOut />
                    Sign out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login">
                      <LogIn />
                      Sign in
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register">
                      <UserPlus />
                      Create account
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isSearchOpen && onSearchChange && (
        <div className="sm:hidden px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search eco kitchenware..."
              value={searchQuery ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-background text-foreground text-sm pl-9 pr-4 py-2 rounded-full focus:outline-none"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
