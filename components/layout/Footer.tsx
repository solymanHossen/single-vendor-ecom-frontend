'use client';

import * as React from 'react';
import Link from 'next/link';
import { Globe, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/logo';

export function Footer() {
  return (
    <footer className="w-full bg-muted/40 border-t border-border/80 text-muted-foreground text-xs font-sans transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Main Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-8 lg:gap-10">
          {/* Brand & Value Proposition (Spans 2 columns on md+) */}
          <div className="md:col-span-2 space-y-3.5 pr-0 md:pr-4">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="focus:outline-none"
              >
                <Logo size="md" />
              </Link>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <ShieldCheck className="size-3 text-primary" />
                Verified Authentic
              </span>
            </div>

            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Next-gen consumer electronics and curated urban streetwear. Engineered for performance, styled for modern lifestyle.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-lg bg-background border border-border/60 hover:border-primary/40 hover:text-primary hover:scale-105 transition-all shadow-2xs"
              >
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="p-2 rounded-lg bg-background border border-border/60 hover:border-primary/40 hover:text-primary hover:scale-105 transition-all shadow-2xs"
              >
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.714 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="p-2 rounded-lg bg-background border border-border/60 hover:border-primary/40 hover:text-primary hover:scale-105 transition-all shadow-2xs"
              >
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="p-2 rounded-lg bg-background border border-border/60 hover:border-primary/40 hover:text-primary hover:scale-105 transition-all shadow-2xs"
              >
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 1: Electronics */}
          <div className="space-y-3">
            <h4 className="font-semibold uppercase tracking-wider text-[11px] text-foreground">Electronics</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/shop?category=electronics" className="hover:text-foreground transition-colors inline-block">
                  Smartwatches
                </Link>
              </li>
              <li>
                <Link href="/shop?category=audio" className="hover:text-foreground transition-colors inline-block">
                  Wireless Earbuds & ANC
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="hover:text-foreground transition-colors inline-block">
                  GaN Fast Chargers
                </Link>
              </li>
              <li>
                <Link href="/shop?category=gaming" className="hover:text-foreground transition-colors inline-block">
                  Gaming Keyboards
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=bestsellers" className="hover:text-foreground transition-colors inline-block">
                  Tech Bestsellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Fashion & Apparel */}
          <div className="space-y-3">
            <h4 className="font-semibold uppercase tracking-wider text-[11px] text-foreground">Fashion</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/shop?category=fashion" className="hover:text-foreground transition-colors inline-block">
                  Streetwear Hoodies
                </Link>
              </li>
              <li>
                <Link href="/shop?category=fashion" className="hover:text-foreground transition-colors inline-block">
                  Techwear Jackets
                </Link>
              </li>
              <li>
                <Link href="/shop?category=fashion" className="hover:text-foreground transition-colors inline-block">
                  Oversized Tees
                </Link>
              </li>
              <li>
                <Link href="/shop?category=bags" className="hover:text-foreground transition-colors inline-block">
                  Urban Backpacks
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=new" className="hover:text-foreground transition-colors inline-block">
                  New Season Drops
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-3">
            <h4 className="font-semibold uppercase tracking-wider text-[11px] text-foreground">Customer Care</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/track-order" className="hover:text-foreground transition-colors inline-block">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="hover:text-foreground transition-colors inline-block">
                  2-Year Tech Warranty
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-foreground transition-colors inline-block">
                  Easy Returns & Exchange
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors inline-block">
                  24/7 Support Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company & Legal */}
          <div className="space-y-3">
            <h4 className="font-semibold uppercase tracking-wider text-[11px] text-foreground">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors inline-block">
                  About AURA
                </Link>
              </li>
              <li>
                <Link href="/stores" className="hover:text-foreground transition-colors inline-block">
                  Flagship Stores
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors inline-block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors inline-block">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          {/* Copyright */}
          <p>© 2026 AURA Electronics & Fashion. All rights reserved.</p>

          {/* Accepted Payment Method Badges */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-muted-foreground mr-1 hidden sm:inline-block">
              Secure Payments:
            </span>
            <span className="px-2 py-0.5 rounded bg-background border border-border/80 font-mono text-[10px] font-semibold text-foreground/80">
              VISA
            </span>
            <span className="px-2 py-0.5 rounded bg-background border border-border/80 font-mono text-[10px] font-semibold text-foreground/80">
              MC
            </span>
            <span className="px-2 py-0.5 rounded bg-background border border-border/80 font-mono text-[10px] font-semibold text-foreground/80">
              AMEX
            </span>
            <span className="px-2 py-0.5 rounded bg-background border border-border/80 font-mono text-[10px] font-semibold text-foreground/80">
              bKash
            </span>
            <span className="px-2 py-0.5 rounded bg-background border border-border/80 font-mono text-[10px] font-semibold text-foreground/80">
              Nagad
            </span>
          </div>

          {/* Region & Currency Selector */}
          <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <Globe className="size-3.5" />
            <span className="font-medium">BDT (৳)</span>
            <span>•</span>
            <span className="font-medium">English</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
