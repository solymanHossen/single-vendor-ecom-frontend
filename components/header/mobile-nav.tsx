'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  Menu,
  Search,
  Heart,
  Watch,
  Shirt,
  Headphones,
  Gamepad2,
  LogIn,
  UserPlus,
  LogOut,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

const MOBILE_CATEGORIES = [
  { title: 'Smart Tech & Wearables', href: '/shop?category=electronics', icon: Watch },
  { title: 'Urban Streetwear & Apparel', href: '/shop?category=fashion', icon: Shirt },
  { title: 'Audio & Wireless Hi-Fi', href: '/shop?category=audio', icon: Headphones },
  { title: 'Gaming & Smart Accessories', href: '/shop?category=accessories', icon: Gamepad2 },
];

export interface MobileNavProps {
  onSearchOpen?: () => void;
  cartCount?: number;
  wishlistCount?: number;
}

export function MobileNav({ onSearchOpen, cartCount = 0, wishlistCount = 0 }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const { data: session } = useSession();

  const handleNavigate = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden size-10 rounded-full hover:bg-muted/70"
          aria-label="Toggle Mobile Menu"
        >
          <Menu className="size-5 text-foreground" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[310px] sm:w-[350px] p-0 flex flex-col justify-between">
        <SheetHeader className="p-6 border-b border-border space-y-1">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={handleNavigate}
              className="font-sans text-2xl font-bold tracking-tight text-foreground flex items-center gap-1.5"
            >
              <Zap className="size-5 text-primary" />
              AURA
            </Link>
            <Badge variant="secondary" className="text-[10px] font-mono">
              Tech & Fashion
            </Badge>
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Next-Gen Electronics & Streetwear.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Quick Actions Bar */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleNavigate();
                onSearchOpen?.();
              }}
              className="w-full justify-start rounded-xl text-xs gap-2"
            >
              <Search className="size-3.5 text-muted-foreground" />
              Search
            </Button>
            <Button variant="outline" size="sm" onClick={handleNavigate} asChild className="w-full justify-start rounded-xl text-xs gap-2">
              <Link href="/wishlist">
                <Heart className="size-3.5 text-destructive" />
                Wishlist ({wishlistCount})
              </Link>
            </Button>
          </div>

          <Separator />

          {/* Catalog Categories */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Shop Categories
            </p>
            <div className="space-y-1">
              {MOBILE_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.title}
                    href={cat.href}
                    onClick={handleNavigate}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted transition-colors text-xs font-medium text-foreground group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </div>
                      <span>{cat.title}</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Additional Links */}
          <div className="space-y-1">
            <Link
              href="/shop"
              onClick={handleNavigate}
              className="flex items-center justify-between p-2 text-xs font-medium text-foreground hover:text-primary transition-colors"
            >
              All Products
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </Link>
            <Link
              href="/about"
              onClick={handleNavigate}
              className="flex items-center justify-between p-2 text-xs font-medium text-foreground hover:text-primary transition-colors"
            >
              About Us
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* User Auth Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          {session ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                    {session.user?.name?.slice(0, 1) || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground truncate max-w-[130px]">
                      {session.user?.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    handleNavigate();
                    signOut({ callbackUrl: '/' });
                  }}
                  className="size-8 text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={handleNavigate} className="rounded-xl text-xs" asChild>
                <Link href="/login">
                  <LogIn className="size-3.5 mr-1" />
                  Sign In
                </Link>
              </Button>
              <Button size="sm" onClick={handleNavigate} className="rounded-xl text-xs font-semibold" asChild>
                <Link href="/register">
                  <UserPlus className="size-3.5 mr-1" />
                  Register
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
