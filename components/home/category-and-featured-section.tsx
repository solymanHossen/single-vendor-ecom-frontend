'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Smartphone,
  Shirt,
  Headphones,
  Gamepad2,
  Home as HomeIcon,
  Watch,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Clock,
  Star,
  Check,
  Plus,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface CategoryItem {
  id: string;
  name: string;
  banglaName: string;
  itemCount: string;
  icon: React.ElementType;
  href: string;
  bgTint: string;
}

export interface ProductPick {
  id: string;
  title: string;
  banglaTitle: string;
  category: string;
  price: number;
  originalPrice: number;
  discountBadge: string;
  rating: number;
  reviewsCount: number;
  image: string;
  href: string;
  isHot?: boolean;
}

// ============================================================================
// Mock Data (Bangladeshi Market Context)
// ============================================================================

const CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-fashion',
    name: 'Fashion & Apparel',
    banglaName: 'ফ্যাশন ও ক্লোথিং',
    itemCount: '২৪০+ আইটেম',
    icon: Shirt,
    href: '/shop?category=fashion',
    bgTint: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
  {
    id: 'cat-tech',
    name: 'Smartphones & Tech',
    banglaName: 'স্মার্টফোন ও গ্যাজেট',
    itemCount: '১৮০+ আইটেম',
    icon: Smartphone,
    href: '/shop?category=electronics',
    bgTint: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    id: 'cat-audio',
    name: 'Audio & Wireless',
    banglaName: 'অডিও ও সাউন্ড',
    itemCount: '৯৫+ আইটেম',
    icon: Headphones,
    href: '/shop?category=audio',
    bgTint: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'cat-gaming',
    name: 'Gaming & PC Components',
    banglaName: 'গেমিং ও পিসি কম্পোনেন্ট',
    itemCount: '১৩০+ আইটেম',
    icon: Gamepad2,
    href: '/shop?category=gaming',
    bgTint: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    id: 'cat-footwear',
    name: 'Footwear & Shoes',
    banglaName: 'ফুটওয়্যার ও জুতা',
    itemCount: '১৫০+ আইটেম',
    icon: ShoppingBag,
    href: '/shop?category=footwear',
    bgTint: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'cat-lifestyle',
    name: 'Lifestyle & Home',
    banglaName: 'লাইফস্টাইল ও হোম',
    itemCount: '২১০+ আইটেম',
    icon: HomeIcon,
    href: '/shop?category=lifestyle',
    bgTint: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  {
    id: 'cat-beauty',
    name: 'Beauty & Personal Care',
    banglaName: 'বিউটি ও কেয়ার',
    itemCount: '১১০+ আইটেম',
    icon: Sparkles,
    href: '/shop?category=beauty',
    bgTint: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  },
  {
    id: 'cat-watches',
    name: 'Watches & Accessories',
    banglaName: 'ঘড়ি ও এক্সেসরিজ',
    itemCount: '৮৫+ আইটেম',
    icon: Watch,
    href: '/shop?category=watches',
    bgTint: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  },
];

const TRENDING_PICKS: ProductPick[] = [
  {
    id: 'pick-1',
    title: 'Soundcore Space Q45 Wireless ANC Headphones',
    banglaTitle: 'সাউন্ডকোর স্পেস কিউ৪৫ অরিজিনাল নয়েজ ক্যানসেলিং হেডফোন',
    category: 'অডিও ও মিউজিক',
    price: 12990,
    originalPrice: 16500,
    discountBadge: '-৳৩,৫১০',
    rating: 4.9,
    reviewsCount: 124,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
    href: '/product/soundcore-q45',
    isHot: true,
  },
  {
    id: 'pick-2',
    title: 'Air Jordan 1 Retro High OG Sneakers',
    banglaTitle: 'এয়ার জর্ডান ১ রেট্রো হাই ওজি লিমিটেড এডিশন স্নিকার্স',
    category: 'ফুটওয়্যার',
    price: 4490,
    originalPrice: 6990,
    discountBadge: '-৳২,৫০০',
    rating: 4.8,
    reviewsCount: 89,
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
    href: '/product/air-jordan-1',
    isHot: true,
  },
  {
    id: 'pick-3',
    title: 'Premium Minimalist Leather Watch',
    banglaTitle: 'প্রিমিয়াম মিনিমালিস্ট লেদার ওয়াচ উইথ ওয়াটারপ্রুফ কেসিং',
    category: 'লাইফস্টাইল ও ঘড়ি',
    price: 3250,
    originalPrice: 4990,
    discountBadge: '-৳১,৭৪০',
    rating: 4.9,
    reviewsCount: 56,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
    href: '/product/leather-watch',
  },
  {
    id: 'pick-4',
    title: 'Anker 65W GaN Fast Charger Combo',
    banglaTitle: 'অ্যাঙ্কার ৬৫ ওয়াট ফাস্ট চার্জার উইথ টাইপ-সি ক্যাবল',
    category: 'গ্যাজেট এক্সেসরিজ',
    price: 2990,
    originalPrice: 3990,
    discountBadge: '-৳১,০০০',
    rating: 4.9,
    reviewsCount: 210,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
    href: '/product/anker-65w-charger',
  },
  {
    id: 'pick-5',
    title: 'Urban Premium Heavyweight Hoodie',
    banglaTitle: 'আর্বান প্রিমিয়াম হেভিওয়েট কটন কাস্টম হুডি',
    category: 'ফ্যাশন ও ক্লোথিং',
    price: 1850,
    originalPrice: 2750,
    discountBadge: '-৳৯০০',
    rating: 4.7,
    reviewsCount: 73,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    href: '/product/urban-hoodie',
  },
];

// BDT Currency Formatter
function formatBDT(amount: number): string {
  return '৳' + amount.toLocaleString('en-BD');
}

// ============================================================================
// Main Component: CategoryAndFeaturedSection
// ============================================================================

export function CategoryAndFeaturedSection() {
  // Added to cart notification state
  const [addedItems, setAddedItems] = React.useState<Record<string, boolean>>({});

  // Countdown timer state for Flash Picks (5h 22m 14s target)
  const [timeLeft, setTimeLeft] = React.useState({ hours: 5, minutes: 22, seconds: 14 });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddedItems((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <section className="w-full bg-background py-8 sm:py-10 lg:py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        
        {/* =================================================================== */}
        {/* SECTION A: TOP CATEGORIES (সহজ ব্রাউজিং)                             */}
        {/* =================================================================== */}
        <div className="space-y-5 sm:space-y-6">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  সহজ ব্রাউজিং
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                আপনার পছন্দের ক্যাটাগরি বেছে নিন
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-semibold text-muted-foreground hover:text-primary gap-1 group/link cursor-pointer"
              asChild
            >
              <Link href="/shop">
                <span>সব ক্যাটাগরি</span>
                <ChevronRight className="size-3.5 group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Categories Grid (Mobile horizontal swipe, Desktop 4-col / 8-col grid) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="group relative rounded-2xl border border-border/50 bg-card/60 p-4 hover:border-primary/40 hover:bg-card hover:shadow-2xs transition-all duration-300 flex flex-col items-center text-center space-y-2.5"
                >
                  {/* Category Icon Badge */}
                  <div className={cn(
                    'p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110',
                    cat.bgTint
                  )}>
                    <Icon className="size-5 sm:size-6" />
                  </div>

                  {/* Category Labels */}
                  <div className="space-y-0.5 min-w-0 w-full">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {cat.banglaName}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-mono font-medium truncate">
                      {cat.itemCount}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* =================================================================== */}
        {/* SECTION B: TRENDING & FLASH PICKS (আজকের সেরা ডিল)                    */}
        {/* =================================================================== */}
        <div className="space-y-5 sm:space-y-6">
          {/* Header Bar with Live Timer & View All */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border/40">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="rounded-full px-2.5 py-0.5 text-xs font-bold gap-1 shadow-2xs">
                  <Flame className="size-3.5 fill-current animate-bounce" />
                  <span>আজকের সেরা ডিল</span>
                </Badge>
              </div>

              {/* Minimal Countdown Indicator */}
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border border-border/50">
                <Clock className="size-3.5 text-amber-500" />
                <span>শেষ হতে বাকি:</span>
                <span className="text-foreground font-bold">
                  {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-bold text-primary hover:text-primary/80 gap-1 group/all cursor-pointer ml-auto sm:ml-0"
              asChild
            >
              <Link href="/offers/trending">
                <span>সব অফার দেখুন</span>
                <ArrowRight className="size-3.5 group-hover/all:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Product Cards Responsive Grid (2-col mobile, 3-col tablet, 5-col desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
            {TRENDING_PICKS.map((product) => {
              const isAdded = addedItems[product.id];
              return (
                <div
                  key={product.id}
                  className="group relative rounded-2xl border border-border/50 bg-card p-3.5 sm:p-4 shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Top Image Preview & Discount Pill */}
                  <div className="space-y-3">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted/40 border border-border/40">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />

                      {/* Discount Tag */}
                      <Badge
                        variant="destructive"
                        className="absolute top-2 left-2 rounded-md font-mono text-[10px] font-bold px-1.5 py-0.5 shadow-2xs"
                      >
                        {product.discountBadge}
                      </Badge>
                    </div>

                    {/* Meta Category & Rating */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                        <span className="truncate">{product.category}</span>
                        <div className="flex items-center gap-0.5 text-amber-400 font-bold shrink-0">
                          <Star className="size-3 fill-current" />
                          <span className="text-foreground">{product.rating}</span>
                        </div>
                      </div>

                      {/* Product Bangla Title */}
                      <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[2.5rem]">
                        {product.banglaTitle}
                      </h3>
                    </div>
                  </div>

                  {/* Price & Add to Cart Action */}
                  <div className="mt-4 pt-3 border-t border-border/40 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm sm:text-base font-extrabold text-primary font-mono">
                          {formatBDT(product.price)}
                        </span>
                        <span className="text-[11px] text-muted-foreground line-through font-mono">
                          {formatBDT(product.originalPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Add to Cart Button */}
                    <Button
                      size="sm"
                      variant={isAdded ? 'default' : 'outline'}
                      onClick={(e) => handleAddToCart(product.id, e)}
                      className={cn(
                        'w-full rounded-xl text-xs font-semibold h-8.5 transition-all gap-1.5 cursor-pointer',
                        isAdded
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                          : 'border-border/80 hover:border-primary hover:bg-primary/5 hover:text-primary'
                      )}
                    >
                      {isAdded ? (
                        <>
                          <Check className="size-3.5" />
                          <span>যোগ করা হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="size-3.5" />
                          <span>ব্যাগে যোগ করুন</span>
                        </>
                      )}
                    </Button>
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

export default CategoryAndFeaturedSection;
