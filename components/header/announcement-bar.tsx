'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sparkles, Truck, Phone, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-primary text-primary-foreground px-4 py-2 text-xs font-medium transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left / Center Promo Message */}
        <div className="flex items-center gap-2 overflow-hidden mx-auto sm:mx-0">
          <span className="inline-flex items-center gap-1 bg-primary-foreground/15 px-2 py-0.5 rounded-full font-semibold shrink-0">
            <Sparkles className="size-3 text-accent" />
            Special Offer
          </span>
          <span className="truncate">
            Complimentary express shipping on orders over <strong className="font-bold">$100</strong>. Use code{' '}
            <span className="underline decoration-accent underline-offset-2 font-mono font-bold">FREESHIP</span>
          </span>
        </div>

        {/* Right Quick Support / Info Links */}
        <div className="hidden sm:flex items-center gap-6 text-primary-foreground/90 shrink-0">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 hover:text-primary-foreground transition-colors"
          >
            <Phone className="size-3.5" />
            <span>24/7 Support</span>
          </Link>
          <span className="text-primary-foreground/30">•</span>
          <Link
            href="/track-order"
            className="inline-flex items-center gap-1 hover:text-primary-foreground transition-colors group"
          >
            <Truck className="size-3.5" />
            <span>Track Order</span>
            <ChevronRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-full hover:bg-primary-foreground/10 transition-colors text-primary-foreground/80 hover:text-primary-foreground ml-2"
            aria-label="Close announcement bar"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
