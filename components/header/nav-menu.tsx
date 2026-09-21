'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Watch,
  Shirt,
  Headphones,
  Gamepad2,
  Zap,
  Sparkles,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';

const CATEGORIES = [
  {
    title: 'Smart Tech & Wearables',
    href: '/shop?category=electronics',
    description: 'ChronoSmart watches, fitness bands, and AR smart glasses.',
    icon: Watch,
    badge: 'Trending Tech',
  },
  {
    title: 'Urban Streetwear & Apparel',
    href: '/shop?category=fashion',
    description: 'Heavyweight hoodies, techwear outerwear, and streetwear denim.',
    icon: Shirt,
    badge: 'New Season',
  },
  {
    title: 'Audio & Wireless Hi-Fi',
    href: '/shop?category=audio',
    description: 'Active noise-canceling headphones, earbuds, and spatial speakers.',
    icon: Headphones,
    badge: 'Top Rated',
  },
  {
    title: 'Gaming & Smart Accessories',
    href: '/shop?category=accessories',
    description: 'Custom mechanical keyboards, fast GaN chargers, and tech packs.',
    icon: Gamepad2,
    badge: 'Hot Drop',
  },
];

const FEATURED_COLLECTIONS = [
  { name: 'Autumn Techwear Drop', href: '/shop?filter=autumn-tech', icon: Sparkles },
  { name: 'Wireless Audio Elite', href: '/shop?filter=audio-elite', icon: Headphones },
  { name: 'Best Sellers', href: '/shop?filter=bestsellers', icon: Flame },
  { name: '2-Year Warranty Pledge', href: '/warranty', icon: ShieldCheck },
];

export interface NavMenuProps {
  activeTab?: string;
  onTabChange?: (tab: 'home' | 'shop' | 'about') => void;
  onScrollToSection?: (id: string) => void;
}

export function NavMenu({ activeTab, onTabChange, onScrollToSection }: NavMenuProps) {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList className="flex items-center gap-1">
        {/* Shop Category Mega-Menu */}
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary focus:text-primary bg-transparent hover:bg-muted/50 data-[state=open]:bg-muted/60',
              activeTab === 'shop' && 'text-primary font-semibold'
            )}
          >
            Explore Catalog
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid grid-cols-12 gap-4 p-6 w-[800px]">
              {/* Category Grid */}
              <div className="col-span-7 grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <NavigationMenuLink key={cat.title} asChild>
                      <Link
                        href={cat.href}
                        onClick={() => onTabChange?.('shop')}
                        className="group flex flex-col gap-1.5 p-3 rounded-xl hover:bg-muted/70 transition-all border border-transparent hover:border-border/60"
                      >
                        <div className="flex items-center justify-between">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Icon className="size-4" />
                          </div>
                          {cat.badge && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">
                              {cat.badge}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                            {cat.title}
                            <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                          </p>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                            {cat.description}
                          </p>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  );
                })}
              </div>

              {/* Spotlight Product Card */}
              <div className="col-span-5 bg-muted/40 rounded-xl p-4 flex flex-col justify-between border border-border/40">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Tech Spotlight
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                      SAVE $50
                    </span>
                  </div>
                  <h4 className="font-sans font-bold text-base text-foreground">
                    AuraSonic Studio ANC
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Hybrid Active Noise Cancellation with 50h battery life and spatial audio driver.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground line-through">$199.00</span>
                    <span className="text-sm font-bold text-primary ml-1.5">$149.00</span>
                  </div>
                  <Link
                    href="/shop?product=aurasonic-anc"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Shop Drop
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Collections Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-sm font-medium transition-colors hover:text-primary focus:text-primary bg-transparent hover:bg-muted/50">
            Collections
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[360px] p-4 grid gap-2">
              {FEATURED_COLLECTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavigationMenuLink key={item.name} asChild>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <div className="p-2 rounded-md bg-secondary/15 text-secondary-foreground group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                        <Icon className="size-4" />
                      </div>
                      <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                        {item.name}
                      </span>
                    </Link>
                  </NavigationMenuLink>
                );
              })}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Direct Link: Electronics */}
        <NavigationMenuItem>
          <Link
            href="/shop?category=electronics"
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
          >
            Electronics
          </Link>
        </NavigationMenuItem>

        {/* Direct Link: Fashion */}
        <NavigationMenuItem>
          <Link
            href="/shop?category=fashion"
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
          >
            Fashion
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
