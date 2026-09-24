"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  BadgeCheck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface MainBannerSlide {
  id: string
  title: string
  image: string
  href: string
}

export interface SideBannerCard {
  id: string
  title: string
  image: string
  href: string
}

export interface TrustItem {
  id: string
  icon: React.ElementType
  title: string
  subtitle: string
}

// ============================================================================
// Trust Strip Data (static — icons aren't serializable, so this stays out of
// the backend-driven banner system)
// ============================================================================

const TRUST_ITEMS_DATA: TrustItem[] = [
  {
    id: "trust-1",
    icon: Truck,
    title: "Nationwide delivery",
    subtitle: "Cash on delivery in all 64 districts",
  },
  {
    id: "trust-2",
    icon: BadgeCheck,
    title: "100% authentic",
    subtitle: "Official brand warranty",
  },
  {
    id: "trust-3",
    icon: ShieldCheck,
    title: "Secure payments",
    subtitle: "bKash, cards or cash on delivery",
  },
  {
    id: "trust-4",
    icon: RotateCcw,
    title: "7-day easy returns",
    subtitle: "Free pickup and fast refunds",
  },
]

// ============================================================================
// Main HeroSection Component
// ============================================================================

export interface HeroSectionProps {
  mainSlides: MainBannerSlide[]
  sideCards: SideBannerCard[]
}

export function HeroSection({ mainSlides, sideCards }: HeroSectionProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)
  const [topCard, bottomCard] = sideCards

  // Sync the active dot with the carousel. Embla starts on snap 0 (the
  // initial state), so only its events need handling — and the listener is
  // removed on cleanup instead of accumulating across re-renders.
  React.useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    api.on("select", onSelect)
    api.on("reInit", onSelect)
    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api])

  // Auto-play timer for main banner slider
  React.useEffect(() => {
    if (!api || isPaused) return
    const interval = setInterval(() => {
      api.scrollNext()
    }, 5500)
    return () => clearInterval(interval)
  }, [api, isPaused])

  return (
    <section
      className="w-full bg-background py-4 transition-colors sm:py-6 lg:py-8"
      aria-label="Homepage Clickable Banner Hero"
    >
      <div className="page-container space-y-5 lg:space-y-6">
        {/* =================================================================== */}
        {/* 3-IMAGE HERO GRID ARCHITECTURE (8-cols Main Slider + 4-cols Cards) */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12 lg:gap-5">
          {/* ========================================== */}
          {/* LEFT 8 COLUMNS: Shadcn UI Carousel Slider  */}
          {/* ========================================== */}
          <div
            className="group/carousel relative flex min-h-[400px] flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xs sm:min-h-[440px] lg:col-span-8 lg:min-h-[480px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Shadcn UI Carousel Primitives */}
            <Carousel
              setApi={setApi}
              opts={{ loop: true }}
              className="h-full w-full flex-1"
            >
              <CarouselContent className="-ml-0 h-full">
                {mainSlides.map((slide) => (
                  <CarouselItem key={slide.id} className="relative h-full pl-0">
                    <Link
                      href={slide.href}
                      className="group/slide relative block h-full min-h-[400px] w-full sm:min-h-[440px] lg:min-h-[480px]"
                    >
                      {/* Full-Bleed Banner Image */}
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        priority
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover/slide:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 68vw"
                      />

                      {/* Gentle subtle overlay gradient for visual polish */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 transition-opacity group-hover/slide:opacity-40" />
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Carousel Controls Overlay (Pill Dots + Frosted Glass Arrows) */}
            <div className="pointer-events-none absolute right-4 bottom-4 left-4 z-20 flex items-center justify-between">
              {/* Embla Active Snap Pill Indicators */}
              <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/40 bg-background/60 px-3 py-1.5 shadow-2xs backdrop-blur-md">
                {mainSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => api?.scrollTo(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={cn(
                      "h-2 cursor-pointer rounded-full transition-all duration-300 focus:outline-none",
                      idx === current
                        ? "w-7 bg-primary shadow-xs"
                        : "w-2 bg-foreground/30 hover:bg-foreground/60"
                    )}
                  />
                ))}
              </div>

              {/* Prev / Next Arrows calling Embla API */}
              <div className="pointer-events-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => api?.scrollPrev()}
                  className="size-9 cursor-pointer rounded-full border-border/60 bg-background/70 shadow-2xs backdrop-blur-md transition-all hover:bg-background"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="size-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => api?.scrollNext()}
                  className="size-9 cursor-pointer rounded-full border-border/60 bg-background/70 shadow-2xs backdrop-blur-md transition-all hover:bg-background"
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
          <div className="flex flex-col justify-between gap-4 lg:col-span-4 lg:gap-5">
            {/* Top Feature Banner Card (Card 1) */}
            {topCard && (
              <Link
                href={topCard.href}
                className="group relative min-h-[190px] flex-1 overflow-hidden rounded-2xl border border-border/60 transition-all duration-300 hover:border-primary/50 hover:shadow-xs sm:min-h-[210px] lg:min-h-[230px]"
              >
                <Image
                  src={topCard.image}
                  alt={topCard.title}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 32vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-50 transition-opacity group-hover:opacity-30" />
              </Link>
            )}

            {/* Bottom Feature Banner Card (Card 2) */}
            {bottomCard && (
              <Link
                href={bottomCard.href}
                className="group relative min-h-[190px] flex-1 overflow-hidden rounded-2xl border border-border/60 transition-all duration-300 hover:border-primary/50 hover:shadow-xs sm:min-h-[210px] lg:min-h-[230px]"
              >
                <Image
                  src={bottomCard.image}
                  alt={bottomCard.title}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 32vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-50 transition-opacity group-hover:opacity-30" />
              </Link>
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* BOTTOM FULL-WIDTH MICRO TRUST STRIP                                */}
        {/* =================================================================== */}
        <div className="rounded-3xl bg-muted/50 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_ITEMS_DATA.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-4",
                    idx !== 0 && "lg:border-l lg:border-border/60 lg:pl-6"
                  )}
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-background text-foreground shadow-xs">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="truncate text-[15px] font-semibold text-foreground">
                      {item.title}
                    </h4>
                    <p className="truncate text-sm text-muted-foreground">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
