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
    'hover:text-emerald-300 transition-colors',
    active ? 'text-emerald-300 border-b-2 border-emerald-400 pb-0.5' : 'text-gray-200',
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
    <header className="sticky top-0 z-40 bg-[#0e2c26]/90 backdrop-blur-md border-b border-white/10 text-white transition-all">
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
              className="font-serif text-3xl sm:text-4xl tracking-tight italic font-bold text-[#faf3de] hover:opacity-95 transition-opacity"
            >
              Homedine
            </button>
          ) : (
            <Link
              href="/"
              className="font-serif text-3xl sm:text-4xl tracking-tight italic font-bold text-[#faf3de] hover:opacity-95 transition-opacity"
            >
              Homedine
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onSearchChange && (
            <>
              <div className="relative hidden sm:block w-48 md:w-64">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Product..."
                  value={searchQuery ?? ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-white text-gray-900 text-xs sm:text-sm pl-9 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-400 shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsSearchOpen((v) => !v)}
                className="sm:hidden p-2 rounded-full hover:bg-white/10 text-white"
              >
                <Search className="w-5 h-5" />
              </button>
            </>
          )}

          {onWishlistClick && (
            <button
              onClick={onWishlistClick}
              className="relative p-2.5 rounded-full hover:bg-white/10 text-white transition-colors"
              title="Saved items"
            >
              <Heart className={cn('w-5 h-5', !!wishlistCount && 'text-amber-300 fill-amber-300/30')} />
              {!!wishlistCount && (
                <span className="absolute top-1 right-1 bg-amber-400 text-gray-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>
          )}

          {onCartClick && (
            <button
              onClick={onCartClick}
              className="relative p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 flex items-center justify-center"
            >
              <ShoppingBag className="w-5 h-5" />
              {!!cartCount && (
                <span className="absolute -top-1 -right-1 bg-[#113f36] text-[#fbf0c9] border border-[#fbf0c9] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-full hover:bg-white/10 transition-colors p-1"
                aria-label="Account menu"
              >
                <Avatar>
                  {session?.user.avatarUrl && <AvatarImage src={session.user.avatarUrl} alt="" />}
                  <AvatarFallback className="bg-white/10 text-white">
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
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search eco kitchenware..."
              value={searchQuery ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-white text-gray-900 text-sm pl-9 pr-4 py-2 rounded-full focus:outline-none"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
