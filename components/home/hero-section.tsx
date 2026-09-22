'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  BadgeCheck,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface MainBannerSlide {
  id: string;
  title: string;
  image: string;
  href: string;
}

export interface SideBannerCard {
  id: string;
  title: string;
  image: string;
  href: string;
}

export interface TrustItem {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
}

// ============================================================================
// Trust Strip Data (static — icons aren't serializable, so this stays out of
// the backend-driven banner system)
// ============================================================================

const TRUST_ITEMS_DATA: TrustItem[] = [
  {
    id: 'trust-1',
    icon: Truck,
    title: 'সারাদেশে দ্রুত ডেলিভারি',
    subtitle: '৬৪ জেলায় Cash on Delivery',
  },
  {
    id: 'trust-2',
    icon: BadgeCheck,
    title: '১০০% অরিজিনাল প্রোডাক্ট',
    subtitle: 'Brand Warranty & Authenticity',
  },
  {
    id: 'trust-3',
    icon: ShieldCheck,
    title: 'নিরাপদ পেমেন্ট',
    subtitle: 'bKash • Nagad • Card • COD',
  },
  {
    id: 'trust-4',
    icon: RotateCcw,
    title: '৭ দিনের সহজ রিটার্ন',
    subtitle: 'সহজ Replacement Policy',
  },
];

// ============================================================================
// Main HeroSection Component
// ============================================================================

export interface HeroSectionProps {
  mainSlides: MainBannerSlide[];
  sideCards: SideBannerCard[];
}

export function HeroSection({ mainSlides, sideCards }: HeroSectionProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [topCard, bottomCard] = sideCards;

  // Sync Shadcn Carousel API state
  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Auto-play timer for main banner slider
  React.useEffect(() => {
    if (!api || isPaused) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 5500);
    return () => clearInterval(interval);
  }, [api, isPaused]);

  return (
    <section
      className="w-full bg-background py-4 sm:py-6 lg:py-8 transition-colors"
      aria-label="Homepage Clickable Banner Hero"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 lg:space-y-6">
        
        {/* =================================================================== */}
        {/* 3-IMAGE HERO GRID ARCHITECTURE (8-cols Main Slider + 4-cols Cards) */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
          
          {/* ========================================== */}
          {/* LEFT 8 COLUMNS: Shadcn UI Carousel Slider  */}
          {/* ========================================== */}
          <div
            className="lg:col-span-8 relative rounded-3xl border border-border/60 overflow-hidden bg-card shadow-xs min-h-[400px] sm:min-h-[440px] lg:min-h-[480px] flex flex-col justify-between group/carousel"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Shadcn UI Carousel Primitives */}
            <Carousel
              setApi={setApi}
              opts={{ loop: true }}
              className="w-full h-full flex-1"
            >
              <CarouselContent className="-ml-0 h-full">
                {mainSlides.map((slide) => (
                  <CarouselItem key={slide.id} className="pl-0 h-full relative">
                    <Link
                      href={slide.href}
                      className="relative block w-full h-full min-h-[400px] sm:min-h-[440px] lg:min-h-[480px] group/slide"
                    >
                      {/* Full-Bleed Banner Image */}
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        priority
                        className="object-cover object-center group-hover/slide:scale-[1.02] transition-transform duration-700 ease-out"
                        sizes="(max-width: 768px) 100vw, 68vw"
                      />

                      {/* Gentle subtle overlay gradient for visual polish */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover/slide:opacity-40 transition-opacity" />
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Carousel Controls Overlay (Pill Dots + Frosted Glass Arrows) */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
              {/* Embla Active Snap Pill Indicators */}
              <div className="flex items-center gap-2 pointer-events-auto bg-background/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/40 shadow-2xs">
                {mainSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => api?.scrollTo(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={cn(
                      'h-2 rounded-full transition-all duration-300 focus:outline-none cursor-pointer',
                      idx === current
                        ? 'w-7 bg-primary shadow-xs'
                        : 'w-2 bg-foreground/30 hover:bg-foreground/60'
                    )}
                  />
                ))}
              </div>

              {/* Prev / Next Arrows calling Embla API */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => api?.scrollPrev()}
                  className="size-9 rounded-full bg-background/70 backdrop-blur-md border-border/60 hover:bg-background transition-all shadow-2xs cursor-pointer"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="size-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => api?.scrollNext()}
                  className="size-9 rounded-full bg-background/70 backdrop-blur-md border-border/60 hover:bg-background transition-all shadow-2xs cursor-pointer"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>

          </div>

          {/* ========================================== */}
          {/* RIGHT 4 COLUMNS: 2 Clickable Banner Cards  */}
          {/* ========================================== */}
          <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-5 justify-between">

            {/* Top Feature Banner Card (Card 1) */}
            {topCard && (
              <Link
                href={topCard.href}
                className="group relative rounded-2xl border border-border/60 overflow-hidden min-h-[190px] sm:min-h-[210px] lg:min-h-[230px] flex-1 hover:border-primary/50 hover:shadow-xs transition-all duration-300"
              >
                <Image
                  src={topCard.image}
                  alt={topCard.title}
                  fill
                  className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 32vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />
              </Link>
            )}

            {/* Bottom Feature Banner Card (Card 2) */}
            {bottomCard && (
              <Link
                href={bottomCard.href}
                className="group relative rounded-2xl border border-border/60 overflow-hidden min-h-[190px] sm:min-h-[210px] lg:min-h-[230px] flex-1 hover:border-primary/50 hover:shadow-xs transition-all duration-300"
              >
                <Image
                  src={bottomCard.image}
                  alt={bottomCard.title}
                  fill
                  className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 32vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />
              </Link>
            )}

          </div>

        </div>

        {/* =================================================================== */}
        {/* BOTTOM FULL-WIDTH MICRO TRUST STRIP                                */}
        {/* =================================================================== */}
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
            {TRUST_ITEMS_DATA.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 pt-3 sm:pt-0',
                    idx !== 0 && 'sm:pl-4 lg:pl-6'
                  )}
                >
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                    <Icon className="size-4.5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {item.subtitle}
                    </p>
                  </div>
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
