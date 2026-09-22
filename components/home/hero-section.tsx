'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Flame,
  Truck,
  BadgeCheck,
  ShieldCheck,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface MainSlide {
  id: string;
  badge: string;
  badgeIcon?: React.ElementType;
  title: string;
  highlightedTitle?: string;
  description: string;
  subtitle?: string;
  priceBDT: number;
  originalPriceBDT?: number;
  image: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  bgGradient: string;
}

export interface SideFeatureCard {
  id: string;
  badge?: string;
  title: string;
  subtitle: string;
  priceText: string;
  image: string;
  href: string;
  theme: 'light' | 'dark';
}

export interface TrustItem {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
}

// ============================================================================
// Mock Data (3-Image System: 1 Main Slider + 2 Right Stacked Feature Cards)
// ============================================================================

const MAIN_SLIDES: MainSlide[] = [
  {
    id: 'main-slide-1',
    badge: '🔥 EXCLUSIVE TECH DEALS',
    badgeIcon: Zap,
    title: 'নেক্সট-জেন আরটিএক্স ৪২০৭ ও',
    highlightedTitle: 'গেমিং পিসি বিল্ড',
    description: 'অফিশিয়াল ব্র্যান্ড ওয়ারেন্টি সহ ৪K গেমিং এবং ভারী কন্টেন্ট ক্রিয়েশনের জন্য প্রস্তুত।',
    priceBDT: 124990,
    originalPriceBDT: 145000,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1000&q=80',
    primaryCta: { label: 'এখনই কিনুন', href: '/shop?category=gaming-pc' },
    secondaryCta: { label: 'অফারটি দেখুন', href: '/offers' },
    bgGradient: 'from-amber-500/10 via-rose-500/5 to-purple-600/10 dark:from-amber-950/20 dark:via-rose-950/15 dark:to-purple-950/20',
  },
  {
    id: 'main-slide-2',
    badge: '✨ NEW SEASON COLLECTION',
    badgeIcon: Sparkles,
    title: 'নতুন লুকে',
    highlightedTitle: 'নতুন আপনি',
    description: 'প্রিমিয়াম ডেনিম, ট্রেডি ক্যাজুয়াল শার্ট, পাঞ্জাবি ও ফুটওয়্যার কালেকশনে বিশেষ সমাহার।',
    priceBDT: 4490,
    originalPriceBDT: 6990,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
    primaryCta: { label: 'এখনই শপ করুন', href: '/shop?category=fashion' },
    secondaryCta: { label: 'কালেকশন দেখুন', href: '/fashion' },
    bgGradient: 'from-rose-500/10 via-amber-500/5 to-orange-500/10 dark:from-rose-950/20 dark:via-amber-950/15 dark:to-orange-950/20',
  },
  {
    id: 'main-slide-3',
    badge: '🎧 HI-FI AUDIO & SOUND',
    badgeIcon: Sparkles,
    title: 'অরিজিনাল নয়েজ ক্যানসেলিং',
    highlightedTitle: 'হেডফোন কালেকশন',
    description: 'Sony, Anker ও Soundcore-এর অফিশিয়াল গ্যাজেটে পেয়ে যান আকর্ষণীয় ক্যাশব্যাক ও ফ্রি ডেলিভারি।',
    priceBDT: 13990,
    originalPriceBDT: 18500,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    primaryCta: { label: 'অর্ডার করুন', href: '/shop?category=audio' },
    secondaryCta: { label: 'ক্যাটালগ দেখুন', href: '/audio' },
    bgGradient: 'from-blue-500/10 via-indigo-500/5 to-cyan-500/10 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-cyan-950/20',
  },
];

const SIDE_FEATURE_CARDS: SideFeatureCard[] = [
  {
    id: 'side-card-top',
    badge: 'MacBook Air Series',
    title: 'MacBook Air M3',
    subtitle: 'Pro Performance. All-Day Battery.',
    priceText: 'Only @ ৳৮৪,৯৯৯!',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    href: '/product/macbook-air-m3',
    theme: 'light',
  },
  {
    id: 'side-card-bottom',
    badge: 'Pro Sound',
    title: 'AirPods Pro (2nd Gen)',
    subtitle: 'Active Noise Cancellation with USB-C.',
    priceText: 'Only @ ৳২০,৯৯৯',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
    href: '/product/airpods-pro-2',
    theme: 'dark',
  },
];

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

function formatBDT(amount: number): string {
  return '৳' + amount.toLocaleString('en-BD');
}

// ============================================================================
// Main HeroSection Component
// ============================================================================

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  // Auto-play timer for main slider
  React.useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % MAIN_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? MAIN_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % MAIN_SLIDES.length);
  };

  const activeSlide = MAIN_SLIDES[currentSlide];
  const BadgeIcon = activeSlide.badgeIcon || Sparkles;

  return (
    <section
      className="w-full bg-background py-4 sm:py-6 lg:py-8 transition-colors"
      aria-label="Homepage 3-Image Hero System"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 lg:space-y-6">
        
        {/* =================================================================== */}
        {/* 3-IMAGE HERO GRID ARCHITECTURE (8-cols Main Slider + 4-cols Cards) */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
          
          {/* ========================================== */}
          {/* LEFT 8 COLUMNS: Main Campaign Slider       */}
          {/* ========================================== */}
          <div
            className="lg:col-span-8 relative rounded-3xl border border-border/60 overflow-hidden bg-card shadow-xs flex flex-col justify-between group/carousel min-h-[420px] sm:min-h-[450px] lg:min-h-[480px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Background Atmosphere Gradient */}
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-br transition-all duration-700 ease-out z-0 pointer-events-none',
                activeSlide.bgGradient
              )}
            />

            {/* Right-Side Image Showcase (No top dark overlay covers) */}
            <div className="absolute right-0 bottom-0 top-0 w-full md:w-1/2 pointer-events-none z-0 overflow-hidden">
              <div className="relative w-full h-full">
                <Image
                  key={activeSlide.id}
                  src={activeSlide.image}
                  alt={activeSlide.title}
                  fill
                  priority
                  className="object-cover object-center md:object-right transition-transform duration-700 ease-out group-hover/carousel:scale-102"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Subtle text side gradient blend */}
                <div className="absolute inset-0 bg-gradient-to-r from-card via-card/75 to-transparent z-10" />
              </div>
            </div>

            {/* Left Campaign Content Area */}
            <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex-1 flex flex-col justify-between max-w-xl">
              
              {/* Badge & Title */}
              <div className="space-y-3 sm:space-y-4">
                <Badge
                  variant="secondary"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 backdrop-blur-md"
                >
                  <BadgeIcon className="size-3.5 text-amber-500" />
                  <span>{activeSlide.badge}</span>
                </Badge>

                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.12]">
                    {activeSlide.title}{' '}
                    {activeSlide.highlightedTitle && (
                      <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent block sm:inline-block">
                        {activeSlide.highlightedTitle}
                      </span>
                    )}
                  </h1>

                  <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed font-normal max-w-lg">
                    {activeSlide.description}
                  </p>
                </div>
              </div>

              {/* Price & Call-to-Actions */}
              <div className="mt-6 sm:mt-8 space-y-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary font-mono tracking-tight">
                    {formatBDT(activeSlide.priceBDT)}
                  </span>
                  {activeSlide.originalPriceBDT && (
                    <span className="text-xs sm:text-sm text-muted-foreground line-through font-mono decoration-destructive/60">
                      {formatBDT(activeSlide.originalPriceBDT)}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    className="rounded-xl px-6 h-11 text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all gap-2 group/btn cursor-pointer"
                    asChild
                  >
                    <Link href={activeSlide.primaryCta.href}>
                      <span>{activeSlide.primaryCta.label}</span>
                      <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-xl px-5 h-11 text-xs sm:text-sm font-semibold border-border/80 hover:bg-muted/80 backdrop-blur-md cursor-pointer"
                    asChild
                  >
                    <Link href={activeSlide.secondaryCta.href}>
                      {activeSlide.secondaryCta.label}
                    </Link>
                  </Button>
                </div>
              </div>

            </div>

            {/* Slider Controls Bar */}
            <div className="relative z-10 p-4 sm:p-6 pt-0 flex items-center justify-between border-t border-border/20">
              {/* Dot Indicators */}
              <div className="flex items-center gap-2">
                {MAIN_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={cn(
                      'h-2 rounded-full transition-all duration-300 focus:outline-none cursor-pointer',
                      idx === currentSlide
                        ? 'w-8 bg-primary'
                        : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                    )}
                  />
                ))}
              </div>

              {/* Prev / Next Frosted Glass Arrows */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrev}
                  className="size-9 rounded-full bg-background/80 border-border/70 hover:bg-background transition-all shadow-2xs cursor-pointer"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="size-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  className="size-9 rounded-full bg-background/80 border-border/70 hover:bg-background transition-all shadow-2xs cursor-pointer"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>

          </div>

          {/* ========================================== */}
          {/* RIGHT 4 COLUMNS: 2 Stacked Feature Cards   */}
          {/* ========================================== */}
          <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-5 justify-between">
            
            {/* Top Feature Card (Card 1: Light Theme) */}
            <Link
              href={SIDE_FEATURE_CARDS[0].href}
              className="group relative rounded-2xl border border-border/60 bg-zinc-100 dark:bg-zinc-900 p-5 flex flex-col justify-between overflow-hidden hover:border-primary/40 transition-all min-h-[200px] sm:min-h-[215px] lg:min-h-[230px]"
            >
              <div className="relative z-10 space-y-2 max-w-[55%]">
                {SIDE_FEATURE_CARDS[0].badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono block">
                    {SIDE_FEATURE_CARDS[0].badge}
                  </span>
                )}
                <h3 className="text-base sm:text-lg font-black text-foreground leading-snug">
                  {SIDE_FEATURE_CARDS[0].title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {SIDE_FEATURE_CARDS[0].subtitle}
                </p>
                <div className="pt-2">
                  <span className="text-sm font-extrabold font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 inline-block">
                    {SIDE_FEATURE_CARDS[0].priceText}
                  </span>
                </div>
              </div>

              {/* Product Preview Image */}
              <div className="absolute right-2 bottom-2 top-2 w-[45%] pointer-events-none overflow-hidden flex items-center justify-end">
                <div className="relative w-full h-full">
                  <Image
                    src={SIDE_FEATURE_CARDS[0].image}
                    alt={SIDE_FEATURE_CARDS[0].title}
                    fill
                    className="object-contain object-right group-hover:scale-105 transition-transform duration-500"
                    sizes="200px"
                  />
                </div>
              </div>
            </Link>

            {/* Bottom Feature Card (Card 2: Dark Contrast Theme) */}
            <Link
              href={SIDE_FEATURE_CARDS[1].href}
              className="group relative rounded-2xl border border-zinc-800 bg-zinc-950 text-white p-5 flex flex-col justify-between overflow-hidden hover:border-primary/60 transition-all min-h-[200px] sm:min-h-[215px] lg:min-h-[230px] shadow-sm"
            >
              <div className="relative z-10 space-y-2 max-w-[55%]">
                {SIDE_FEATURE_CARDS[1].badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono block">
                    {SIDE_FEATURE_CARDS[1].badge}
                  </span>
                )}
                <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                  {SIDE_FEATURE_CARDS[1].title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-1">
                  {SIDE_FEATURE_CARDS[1].subtitle}
                </p>
                <div className="pt-2">
                  <span className="text-sm font-extrabold font-mono text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20 inline-block">
                    {SIDE_FEATURE_CARDS[1].priceText}
                  </span>
                </div>
              </div>

              {/* Product Preview Image */}
              <div className="absolute right-2 bottom-2 top-2 w-[45%] pointer-events-none overflow-hidden flex items-center justify-end">
                <div className="relative w-full h-full">
                  <Image
                    src={SIDE_FEATURE_CARDS[1].image}
                    alt={SIDE_FEATURE_CARDS[1].title}
                    fill
                    className="object-contain object-right group-hover:scale-105 transition-transform duration-500"
                    sizes="200px"
                  />
                </div>
              </div>
            </Link>

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
