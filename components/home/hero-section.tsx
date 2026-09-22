'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Flame,
  Clock,
  Truck,
  BadgeCheck,
  ShieldCheck,
  RotateCcw,
  Zap,
  Gift,
  Copy,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface HeroBanner {
  id: string;
  category: 'fashion' | 'electronics' | 'footwear' | 'lifestyle' | 'festival';
  categoryLabel: string;
  badge: string;
  badgeIcon?: React.ElementType;
  title: string;
  highlightedTitle?: string;
  description: string;
  price?: string;
  oldPrice?: string;
  discount?: string;
  primaryCta: string;
  primaryCtaHref: string;
  secondaryCta: string;
  secondaryCtaHref: string;
  image: string;
  secondaryImage?: string;
  backgroundGradient: string;
  accentGlow: string;
}

export interface FlashDeal {
  id: string;
  category: string;
  title: string;
  productName: string;
  image: string;
  price: string;
  oldPrice: string;
  discount: string;
  saveAmount: string;
  soldCount: number;
  totalStock: number;
  endsAt: Date;
}

export interface PromoOffer {
  id: string;
  badge: string;
  title: string;
  description: string;
  code: string;
  discountHighlight: string;
}

export interface TrustItem {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
}

// ============================================================================
// Multi-Category Marketplace Mock Data
// ============================================================================

const HERO_BANNERS: HeroBanner[] = [
  {
    id: 'banner-fashion',
    category: 'fashion',
    categoryLabel: 'Fashion & Wearables',
    badge: '✨ New Season Collection',
    badgeIcon: Sparkles,
    title: 'নতুন লুকে',
    highlightedTitle: 'নতুন আপনি',
    description: 'প্রিমিয়াম ডেনিম, ট্রেডি ক্যাজুয়াল শার্ট, পাঞ্জাবি ও ফুটওয়্যার কালেকশনে বিশেষ সমাহার।',
    price: '৳৪৯৯',
    oldPrice: '৳৯৯৯',
    discount: '৫০% পর্যন্ত ছাড়',
    primaryCta: 'এখনই শপ করুন',
    primaryCtaHref: '/shop?category=fashion',
    secondaryCta: 'কালেকশন দেখুন',
    secondaryCtaHref: '/fashion',
    backgroundGradient: 'from-amber-500/10 via-rose-500/10 to-orange-500/10 dark:from-amber-950/30 dark:via-rose-950/20 dark:to-orange-950/30',
    accentGlow: 'bg-rose-500/15',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'banner-electronics',
    category: 'electronics',
    categoryLabel: 'Tech & Electronics',
    badge: '⚡ Tech Upgrade Week',
    badgeIcon: Zap,
    title: 'আপনার Next-Level',
    highlightedTitle: 'Tech Setup',
    description: 'অফিশিয়াল ল্যাপটপ, গেমিং পিসি, স্মার্টফোন ও অডিও গ্যাজেটে আকর্ষণীয় ক্যাশব্যাক ও ওয়ারেন্টি।',
    price: '৳২৩,৪৯৯',
    oldPrice: '৳২৭,০০০',
    discount: '৳৩,৫০১ ছাড়',
    primaryCta: 'এখনই কিনুন',
    primaryCtaHref: '/shop?category=electronics',
    secondaryCta: 'সব অফার দেখুন',
    secondaryCtaHref: '/electronics',
    backgroundGradient: 'from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/30',
    accentGlow: 'bg-indigo-500/15',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'banner-footwear',
    category: 'footwear',
    categoryLabel: 'Footwear & Shoes',
    badge: '👟 Step Into Style',
    badgeIcon: Sparkles,
    title: 'আপনার প্রতিটি পদক্ষেপে',
    highlightedTitle: 'নতুন স্টাইল',
    description: 'ট্রেন্টির প্রিমিয়াম স্নিকার্স, ক্যাজুয়াল শু ও ফরমাল জুতার এক্সক্লুসিভ কালেকশন।',
    price: '৳৯৯৯',
    oldPrice: '৳১,৯৯৯',
    discount: '৫০% ছাড়',
    primaryCta: 'কালেকশন দেখুন',
    primaryCtaHref: '/shop?category=footwear',
    secondaryCta: 'অফারটি দেখুন',
    secondaryCtaHref: '/footwear',
    backgroundGradient: 'from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30',
    accentGlow: 'bg-emerald-500/15',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'banner-lifestyle',
    category: 'lifestyle',
    categoryLabel: 'Home & Lifestyle',
    badge: '🏠 Everyday Essentials',
    badgeIcon: Sparkles,
    title: 'আপনার প্রতিদিনের প্রয়োজন',
    highlightedTitle: 'এক জায়গায়',
    description: 'হোম ডেকোরেশন, স্মার্ট কিচেন এক্সেসরিজ, পার্সোনাল কেয়ার ও বিউটি প্রোডাক্টস।',
    price: '৳৩৯৯',
    oldPrice: '৳৭৯৯',
    discount: 'সর্বোচ্চ ৪০% ছাড়',
    primaryCta: 'শপ করুন',
    primaryCtaHref: '/shop?category=lifestyle',
    secondaryCta: 'ব্রাউজ করুন',
    secondaryCtaHref: '/lifestyle',
    backgroundGradient: 'from-amber-500/10 via-stone-500/10 to-orange-500/10 dark:from-amber-950/30 dark:via-stone-950/20 dark:to-orange-950/30',
    accentGlow: 'bg-amber-500/15',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'banner-festival',
    category: 'festival',
    categoryLabel: 'Festival Shopping',
    badge: '🎉 উৎসবের কেনাকাটা',
    badgeIcon: Sparkles,
    title: 'উৎসবের কেনাকাটা হোক',
    highlightedTitle: 'আরও আনন্দের',
    description: 'সবাইয়ের জন্য সবকিছু এক প্ল্যাটফর্মে। বিশেষ ডিসকাউন্ট, বান্ডেল অফার ও ক্যাশ অন ডেলিভারি।',
    price: '৳৭৯৯',
    oldPrice: '৳১,৪৯৯',
    discount: 'উৎসব ধামাকা',
    primaryCta: 'এখনই শপ করুন',
    primaryCtaHref: '/shop',
    secondaryCta: 'উৎসব ক্যাটালগ',
    secondaryCtaHref: '/festival',
    backgroundGradient: 'from-purple-500/10 via-pink-500/10 to-rose-500/10 dark:from-purple-950/30 dark:via-pink-950/20 dark:to-rose-950/30',
    accentGlow: 'bg-purple-500/15',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
  },
];

const FLASH_DEAL_DATA: FlashDeal = {
  id: 'fd-active',
  category: 'Footwear & Lifestyle',
  title: 'DAILY FLASH DEAL',
  productName: 'Air Jordan 1 Retro High OG Limited Edition',
  image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
  price: '৳৪,৪৯০',
  oldPrice: '৳৬,৯৯০',
  discount: 'UP TO 35% OFF',
  saveAmount: '৳২,৫০০ ছাড়',
  soldCount: 42,
  totalStock: 60,
  endsAt: new Date(Date.now() + 14 * 3600 * 1000 + 28 * 60 * 1000 + 45 * 1000),
};

const PROMO_OFFER_DATA: PromoOffer = {
  id: 'promo-1',
  badge: '💳 SMART PAYMENT',
  title: 'bKash / Nagad Instant Cashback',
  description: 'যেকোনো ক্যাটাগরির কেনাকাটায় ১০% ইনস্ট্যান্ট ক্যাশব্যাক অথবা ১২ মাস পর্যন্ত ০% EMI।',
  code: 'AURA1000',
  discountHighlight: 'Up to 10% Cashback',
};

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
// Internal Sub-Components
// ============================================================================

/**
 * 1. Campaign Slider Sub-Component
 */
interface HeroSliderProps {
  banners: HeroBanner[];
  activeSlide: number;
  isPaused: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSelectSlide: (index: number) => void;
  onPause: () => void;
  onResume: () => void;
}

function HeroSlider({
  banners,
  activeSlide,
  onPrev,
  onNext,
  onSelectSlide,
  onPause,
  onResume,
}: HeroSliderProps) {
  const currentBanner = banners[activeSlide];
  const BadgeIcon = currentBanner.badgeIcon || Sparkles;

  return (
    <div
      className="relative rounded-2xl sm:rounded-3xl border border-border/60 overflow-hidden bg-card shadow-sm flex flex-col justify-between group/carousel min-h-[480px] sm:min-h-[520px] lg:min-h-[560px] xl:min-h-[600px]"
      onMouseEnter={onPause}
      onMouseLeave={onResume}
      aria-roledescription="carousel"
      aria-label="Marketplace Campaign Banners"
    >
      {/* Background Atmosphere Gradient */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br transition-all duration-700 ease-out z-0 pointer-events-none',
          currentBanner.backgroundGradient
        )}
      />

      {/* Floating Radial Ambient Glow */}
      <div
        className={cn(
          'absolute right-10 top-10 size-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 z-0',
          currentBanner.accentGlow
        )}
      />

      {/* Hero Product Visual Composition (Right side image with gradient blends) */}
      <div className="absolute right-0 bottom-0 top-0 w-full md:w-3/5 opacity-25 md:opacity-100 pointer-events-none z-0 overflow-hidden">
        <div className="relative w-full h-full">
          {/* Subtle gradient fades for maximum text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-card via-card/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent z-10" />

          <Image
            key={currentBanner.id}
            src={currentBanner.image}
            alt={currentBanner.title}
            fill
            priority
            className="object-cover object-center md:object-right transition-transform duration-1000 ease-out group-hover/carousel:scale-105"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        </div>
      </div>

      {/* Left Side Campaign Content Area */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 xl:p-14 flex-1 flex flex-col justify-between max-w-2xl">
        
        {/* Campaign Badge & Category */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 backdrop-blur-md shadow-2xs"
            >
              <BadgeIcon className="size-3.5 animate-pulse text-amber-500" />
              <span>{currentBanner.badge}</span>
            </Badge>

            <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider bg-muted/60 px-2.5 py-1 rounded-md border border-border/40">
              {currentBanner.categoryLabel}
            </span>
          </div>

          {/* Large Editorial Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
              {currentBanner.title}{' '}
              {currentBanner.highlightedTitle && (
                <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent block sm:inline-block">
                  {currentBanner.highlightedTitle}
                </span>
              )}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed font-normal max-w-xl">
              {currentBanner.description}
            </p>
          </div>
        </div>

        {/* Price Tag & Call To Actions */}
        <div className="mt-8 sm:mt-10 space-y-6">
          {/* Price & Offer Badge */}
          {currentBanner.price && (
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary font-mono tracking-tight">
                {currentBanner.price}
              </span>
              {currentBanner.oldPrice && (
                <span className="text-sm sm:text-lg text-muted-foreground line-through font-mono decoration-destructive/60">
                  {currentBanner.oldPrice}
                </span>
              )}
              {currentBanner.discount && (
                <Badge variant="destructive" className="rounded-md font-mono text-[11px] font-bold px-2 py-0.5">
                  {currentBanner.discount}
                </Badge>
              )}
            </div>
          )}

          {/* Dual Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Button
              size="lg"
              className="rounded-xl px-7 h-12 text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all gap-2 group/btn cursor-pointer"
              asChild
            >
              <Link href={currentBanner.primaryCtaHref}>
                <span>{currentBanner.primaryCta}</span>
                <ArrowUpRight className="size-4 sm:size-5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="rounded-xl px-6 h-12 text-sm sm:text-base font-semibold border-border/80 hover:bg-muted/80 backdrop-blur-md cursor-pointer"
              asChild
            >
              <Link href={currentBanner.secondaryCtaHref}>
                {currentBanner.secondaryCta}
              </Link>
            </Button>
          </div>
        </div>

      </div>

      {/* Slider Controls & Active Dot Indicators */}
      <div className="relative z-10 p-4 sm:p-6 lg:p-8 pt-0 flex items-center justify-between backdrop-blur-xs border-t border-border/20">
        
        {/* Custom Active Dot Indicators */}
        <div className="flex items-center gap-2">
          {banners.map((banner, idx) => (
            <button
              key={banner.id}
              onClick={() => onSelectSlide(idx)}
              aria-label={`Select campaign ${idx + 1}: ${banner.categoryLabel}`}
              className={cn(
                'h-2 rounded-full transition-all duration-300 focus:outline-none cursor-pointer',
                idx === activeSlide
                  ? 'w-10 bg-primary shadow-xs'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
              )}
            />
          ))}
        </div>

        {/* Minimal Frosted Glass Prev/Next Arrows */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrev}
            className="size-10 rounded-full bg-background/70 backdrop-blur-md border-border/70 hover:bg-background hover:scale-105 transition-all shadow-xs cursor-pointer"
            aria-label="পূর্ববর্তী অফার"
          >
            <ChevronLeft className="size-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={onNext}
            className="size-10 rounded-full bg-background/70 backdrop-blur-md border-border/70 hover:bg-background hover:scale-105 transition-all shadow-xs cursor-pointer"
            aria-label="পরবর্তী অফার"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>

      </div>
    </div>
  );
}

/**
 * 2. Flash Deal Card Sub-Component (Live Countdown Timer)
 */
interface FlashDealCardProps {
  deal: FlashDeal;
}

function FlashDealCard({ deal }: FlashDealCardProps) {
  // Countdown timer state
  const [timeLeft, setTimeLeft] = React.useState({ hours: 14, minutes: 28, seconds: 45 });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stockPercent = Math.round((deal.soldCount / deal.totalStock) * 100);

  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all group">
      {/* Card Header & Live Countdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="destructive" className="rounded-full font-bold px-3 py-1 text-xs gap-1.5 shadow-xs">
            <Flame className="size-3.5 fill-current animate-bounce" />
            <span>{deal.title}</span>
          </Badge>
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <Clock className="size-3.5 text-amber-500" />
            Ends in
          </span>
        </div>

        {/* Live Timer Boxes */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex-1 bg-muted/60 border border-border/60 rounded-xl p-2 text-center">
            <span className="block text-base sm:text-lg font-extrabold font-mono text-foreground leading-none">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-medium text-muted-foreground uppercase">Hours</span>
          </div>
          <span className="font-extrabold text-muted-foreground">:</span>
          <div className="flex-1 bg-muted/60 border border-border/60 rounded-xl p-2 text-center">
            <span className="block text-base sm:text-lg font-extrabold font-mono text-foreground leading-none">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-medium text-muted-foreground uppercase">Mins</span>
          </div>
          <span className="font-extrabold text-muted-foreground">:</span>
          <div className="flex-1 bg-destructive/10 border border-destructive/30 rounded-xl p-2 text-center">
            <span className="block text-base sm:text-lg font-extrabold font-mono text-destructive leading-none animate-pulse">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-medium text-destructive uppercase">Secs</span>
          </div>
        </div>
      </div>

      {/* Product Image & Details */}
      <div className="flex items-center gap-4 py-4 my-2 border-y border-border/40">
        <div className="relative size-20 sm:size-22 rounded-xl border border-border/60 overflow-hidden bg-muted shrink-0 group-hover:scale-105 transition-transform duration-300">
          <Image
            src={deal.image}
            alt={deal.productName}
            fill
            className="object-cover"
            sizes="88px"
          />
          <div className="absolute top-1 left-1 bg-destructive text-destructive-foreground text-[9px] font-extrabold font-mono px-1.5 py-0.5 rounded-md">
            {deal.saveAmount}
          </div>
        </div>

        <div className="space-y-1.5 flex-1 min-w-0">
          <span className="text-[10px] font-bold text-primary tracking-wide uppercase">
            {deal.category}
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 leading-snug">
            {deal.productName}
          </h3>

          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-base font-extrabold text-primary font-mono">
              {deal.price}
            </span>
            <span className="text-xs text-muted-foreground line-through font-mono">
              {deal.oldPrice}
            </span>
          </div>
        </div>
      </div>

      {/* Progress & Quick Buy Button */}
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-semibold">
            <span className="text-muted-foreground">স্টক পরিস্থিতি</span>
            <span className="text-destructive font-bold">{deal.soldCount} টি বিক্রি হয়েছে</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden border border-border/40">
            <div
              className="bg-gradient-to-r from-amber-500 to-destructive h-full rounded-full transition-all duration-500"
              style={{ width: `${stockPercent}%` }}
            />
          </div>
        </div>

        <Button size="sm" className="w-full rounded-xl font-bold gap-2 text-xs h-9 shadow-xs group/buy cursor-pointer" asChild>
          <Link href={`/product/${deal.id}`}>
            <span>দ্রুত কিনুন</span>
            <ArrowUpRight className="size-3.5 group-hover/buy:translate-x-0.5 group-hover/buy:-translate-y-0.5 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * 3. Promo Voucher Card Sub-Component
 */
interface PromoCardProps {
  offer: PromoOffer;
}

function PromoCard({ offer }: PromoCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(offer.code);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-indigo-500/5 p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-primary/60 transition-all group overflow-hidden">
      <div className="absolute -top-10 -right-10 size-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="rounded-full text-[11px] font-semibold bg-background/80 border-primary/30 text-primary gap-1">
            <Gift className="size-3" />
            <span>{offer.badge}</span>
          </Badge>
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {offer.discountHighlight}
          </span>
        </div>

        <div className="space-y-1">
          <h4 className="text-sm sm:text-base font-extrabold text-foreground leading-snug">
            {offer.title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {offer.description}
          </p>
        </div>
      </div>

      {/* Code Copy Bar */}
      <div className="relative z-10 mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-background/90 border border-dashed border-primary/40 rounded-xl px-3 py-1.5 font-mono text-xs font-extrabold text-primary">
          <ShoppingBag className="size-3.5" />
          <span>{offer.code}</span>
        </div>

        <Button
          variant={copied ? 'default' : 'secondary'}
          size="xs"
          onClick={handleCopy}
          className="rounded-lg font-bold text-[11px] gap-1 px-3 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="size-3" />
              <span>কপি হয়েছে!</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>কোড কপি</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/**
 * 4. Trust Strip Sub-Component (4-Column)
 */
interface TrustStripProps {
  items: TrustItem[];
}

function TrustStrip({ items }: TrustStripProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xs p-4 sm:p-5 shadow-2xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3.5 pt-3 sm:pt-0',
                idx !== 0 && 'sm:pl-4 lg:pl-6'
              )}
            >
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <Icon className="size-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                  {item.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                  {item.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Main HeroSection Component
// ============================================================================

export function HeroSection() {
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  // Auto-play effect (5.5 seconds interval)
  React.useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = React.useCallback(() => {
    setActiveSlide((prev) => (prev === 0 ? HERO_BANNERS.length - 1 : prev - 1));
  }, []);

  const handleNext = React.useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % HERO_BANNERS.length);
  }, []);

  const handleSelectSlide = React.useCallback((index: number) => {
    setActiveSlide(index);
  }, []);

  return (
    <section
      className="w-full bg-background py-4 sm:py-6 lg:py-8 transition-colors"
      aria-label="Homepage Featured Marketplace Hero"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-6 lg:space-y-8">
        
        {/* CSS Grid Architecture: Left Main Campaign (8-cols) + Right Side Deals (4-cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          
          {/* Main Campaign Hero Slider Area */}
          <div className="lg:col-span-8">
            <HeroSlider
              banners={HERO_BANNERS}
              activeSlide={activeSlide}
              isPaused={isPaused}
              onPrev={handlePrev}
              onNext={handleNext}
              onSelectSlide={handleSelectSlide}
              onPause={() => setIsPaused(true)}
              onResume={() => setIsPaused(false)}
            />
          </div>

          {/* Right Side Stacked Flash Deal & Promo Cards */}
          <div className="lg:col-span-4 flex flex-col gap-5 lg:gap-6">
            <FlashDealCard deal={FLASH_DEAL_DATA} />
            <PromoCard offer={PROMO_OFFER_DATA} />
          </div>

        </div>

        {/* Bottom Full-Width Trust & Value Proposition Strip */}
        <TrustStrip items={TRUST_ITEMS_DATA} />

      </div>
    </section>
  );
}

export default HeroSection;
