'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Globe,
  ShieldCheck,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface LuxurySlide {
  id: string;
  categoryTag: string;
  headline: string;
  headlineHighlight?: string;
  description: string;
  priceBDT: string;
  priceUSD?: string;
  image: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  radialGlowColor?: string;
}

export interface MicroTrustItem {
  id: string;
  icon: React.ElementType;
  label: string;
}

// ============================================================================
// Pristine Luxury Mock Data (Apple & Linear Inspired)
// ============================================================================

const SLIDES: LuxurySlide[] = [
  {
    id: 'slide-audio',
    categoryTag: 'COLLECTION 2026 // PREMIUM AUDIO',
    headline: 'Pure Sound.',
    headlineHighlight: 'Zero Noise.',
    description: 'Next-generation adaptive active noise cancelling with 40-hour playtime and Hi-Res audio.',
    priceBDT: 'BDT 32,500',
    priceUSD: '$299',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    primaryCta: { label: 'Shop Now', href: '/shop?category=audio' },
    secondaryCta: { label: 'Explore Series', href: '/shop?category=audio' },
    radialGlowColor: 'from-blue-500/10 via-indigo-500/5 to-transparent',
  },
  {
    id: 'slide-workstation',
    categoryTag: 'PRO COMPUTING // M3 MAX ARCHITECTURE',
    headline: 'Power Meets',
    headlineHighlight: 'Precision.',
    description: 'Engineered for creators with 16-core CPU performance and Liquid Retina XDR display.',
    priceBDT: 'BDT 245,000',
    priceUSD: '$2,199',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
    primaryCta: { label: 'Shop Now', href: '/shop?category=laptops' },
    secondaryCta: { label: 'View Tech Specs', href: '/shop?category=laptops' },
    radialGlowColor: 'from-purple-500/10 via-rose-500/5 to-transparent',
  },
  {
    id: 'slide-keyboard',
    categoryTag: 'WORKSPACE ESSENTIALS // SERIF ED.',
    headline: 'Tactile',
    headlineHighlight: 'Elegance.',
    description: 'Custom gasket-mounted wireless mechanical keyboard with anodized aluminum body.',
    priceBDT: 'BDT 18,900',
    priceUSD: '$169',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
    primaryCta: { label: 'Shop Now', href: '/shop?category=keyboards' },
    secondaryCta: { label: 'Discover Switches', href: '/shop?category=keyboards' },
    radialGlowColor: 'from-amber-500/10 via-orange-500/5 to-transparent',
  },
  {
    id: 'slide-wearable',
    categoryTag: 'LIFESTYLE GEAR // WEARABLES',
    headline: 'Timeless',
    headlineHighlight: 'Craftsmanship.',
    description: 'Titanium casing with sapphire crystal glass and precision health telemetry.',
    priceBDT: 'BDT 42,000',
    priceUSD: '$379',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
    primaryCta: { label: 'Shop Now', href: '/shop?category=wearables' },
    secondaryCta: { label: 'Explore Features', href: '/shop?category=wearables' },
    radialGlowColor: 'from-emerald-500/10 via-teal-500/5 to-transparent',
  },
];

const MICRO_TRUST_ITEMS: MicroTrustItem[] = [
  {
    id: 'trust-shipping',
    icon: Globe,
    label: 'Worldwide Tracked Shipping',
  },
  {
    id: 'trust-warranty',
    icon: ShieldCheck,
    label: 'Official 2-Year Warranty',
  },
  {
    id: 'trust-checkout',
    icon: Lock,
    label: 'Secure Checkout',
  },
  {
    id: 'trust-returns',
    icon: RotateCcw,
    label: '30-Day Hassle-Free Returns',
  },
];

// ============================================================================
// Main HeroSection Component
// ============================================================================

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  // Auto-advance timer (5.5 seconds)
  React.useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = React.useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  }, []);

  const handleNext = React.useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const activeSlideData = SLIDES[currentSlide];

  return (
    <section
      className="w-full bg-background py-4 sm:py-6 lg:py-8 transition-colors"
      aria-label="Marketplace Featured Showcase"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6">
        
        {/* =================================================================== */}
        {/* COMPACT LUXURY HERO CAROUSEL CANVAS                                 */}
        {/* =================================================================== */}
        <div
          className="relative w-full rounded-3xl border border-border/40 bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden group/hero min-h-[400px] sm:min-h-[420px] lg:min-h-[440px] xl:min-h-[460px] flex flex-col justify-between p-6 sm:p-10 lg:p-12 transition-all"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Subtle Radial Ambient Backdrop Glow */}
          <div
            className={cn(
              'absolute right-0 top-0 size-96 rounded-full blur-3xl pointer-events-none transition-all duration-1000 bg-radial',
              activeSlideData.radialGlowColor || 'from-primary/10 to-transparent'
            )}
          />

          {/* Right Column: Floating Focal Product Asset */}
          <div className="absolute right-0 bottom-0 top-0 w-full md:w-1/2 pointer-events-none z-0 overflow-hidden flex items-center justify-end p-6 md:p-10">
            <div className="relative w-full h-full max-h-[340px] md:max-h-[380px] aspect-square flex items-center justify-center">
              <Image
                key={activeSlideData.id}
                src={activeSlideData.image}
                alt={activeSlideData.headline}
                fill
                priority
                className="object-contain object-center md:object-right transition-transform duration-700 ease-out group-hover/hero:scale-103"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Subtle side fade for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-50 via-zinc-50/70 to-transparent dark:from-zinc-900/50 dark:via-zinc-900/30 z-10" />
            </div>
          </div>

          {/* Left Column: Minimalist Typography & Actions */}
          <div className="relative z-10 max-w-xl space-y-6">
            
            {/* Category Subtitle Pill */}
            <span className="inline-block text-[11px] font-mono font-semibold tracking-wider text-muted-foreground uppercase">
              {activeSlideData.categoryTag}
            </span>

            {/* Headline & Description */}
            <div className="space-y-2.5">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                {activeSlideData.headline}{' '}
                {activeSlideData.headlineHighlight && (
                  <span className="text-muted-foreground font-normal">
                    {activeSlideData.headlineHighlight}
                  </span>
                )}
              </h1>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
                {activeSlideData.description}
              </p>
            </div>

            {/* Minimal Inline Price Display */}
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono text-foreground tracking-tight">
                {activeSlideData.priceBDT}
              </span>
              {activeSlideData.priceUSD && (
                <span className="text-xs text-muted-foreground font-mono">
                  ({activeSlideData.priceUSD})
                </span>
              )}
            </div>

            {/* Micro Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                size="sm"
                className="rounded-full px-5 h-10 text-xs font-semibold shadow-2xs gap-1.5 group/btn cursor-pointer"
                asChild
              >
                <Link href={activeSlideData.primaryCta.href}>
                  <span>{activeSlideData.primaryCta.label}</span>
                  <ArrowUpRight className="size-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="rounded-full px-4 h-10 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
                asChild
              >
                <Link href={activeSlideData.secondaryCta.href}>
                  {activeSlideData.secondaryCta.label}
                </Link>
              </Button>
            </div>

          </div>

          {/* Bottom Slider Navigation: Pill Indicators (Left) + Micro Frosted Arrows (Right) */}
          <div className="relative z-10 pt-6 flex items-center justify-between border-t border-border/20 mt-auto">
            
            {/* Bottom-Left: Slim Horizontal Pill Indicators */}
            <div className="flex items-center gap-2">
              {SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300 focus:outline-none cursor-pointer',
                    idx === currentSlide
                      ? 'w-8 bg-foreground'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                  )}
                />
              ))}
            </div>

            {/* Bottom-Right: Micro Frosted Circular Arrow Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                className="size-9 rounded-full bg-background/60 backdrop-blur-md border-border/40 hover:bg-background transition-all shadow-2xs cursor-pointer"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="size-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="size-9 rounded-full bg-background/60 backdrop-blur-md border-border/40 hover:bg-background transition-all shadow-2xs cursor-pointer"
                aria-label="Next Slide"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

          </div>
        </div>

        {/* =================================================================== */}
        {/* ULTRA-SLIM 4-ITEM MICRO TRUST STRIP                                */}
        {/* =================================================================== */}
        <div className="py-2 px-1 border-t border-border/40">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
            {MICRO_TRUST_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-center justify-center sm:justify-start gap-2">
                  <Icon className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground font-medium truncate">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

export default HeroSection;
