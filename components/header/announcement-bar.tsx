"use client"

import * as React from "react"
import Link from "next/link"
import {
  Zap,
  Truck,
  Headphones,
  X,
  ChevronRight,
  Copy,
  Check,
  Clock,
} from "lucide-react"
import { formatPrice, timeUntil } from "@/lib/format"
import { useStorageValue } from "@/hooks/use-storage-value"
import type { NavigationPromotion } from "@/lib/storefront-types"

const DISMISS_STORAGE_KEY = "aura:announcement-dismissed"

export interface AnnouncementBarProps {
  promotion: NavigationPromotion | null
}

function describeDiscount(promotion: NavigationPromotion): string {
  const value =
    promotion.discountType === "PERCENTAGE"
      ? `${Number.parseFloat(promotion.discountValue)}% OFF`
      : `${formatPrice(promotion.discountValue)} OFF`
  const minimum = promotion.minOrderAmount
    ? ` orders over ${formatPrice(promotion.minOrderAmount)}`
    : " your order"
  return `${value}${minimum}`
}

export function AnnouncementBar({ promotion }: AnnouncementBarProps) {
  const [copied, setCopied] = React.useState(false)
  // Countdown is computed after mount only — rendering Date.now() on the
  // server and again on the client would produce a hydration mismatch.
  const [endsIn, setEndsIn] = React.useState<string | null>(null)

  // Dismissal is remembered per promo code, so a NEW promotion reappears.
  const dismissKey = promotion?.code ?? "default"
  const [dismissedKey, setDismissedKey] = useStorageValue(
    "session",
    DISMISS_STORAGE_KEY
  )
  const isVisible = dismissedKey !== dismissKey

  React.useEffect(() => {
    if (!promotion) return
    const update = () => setEndsIn(timeUntil(promotion.validUntil))
    const initial = window.setTimeout(update, 0)
    const interval = window.setInterval(update, 60_000)
    return () => {
      window.clearTimeout(initial)
      window.clearInterval(interval)
    }
  }, [promotion])

  React.useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timeout)
  }, [copied])

  const handleDismiss = () => setDismissedKey(dismissKey)

  const handleCopy = async () => {
    if (!promotion) return
    try {
      await navigator.clipboard.writeText(promotion.code)
      setCopied(true)
    } catch {
      // Clipboard permission denied — the code stays visible to type manually.
    }
  }

  if (!isVisible) return null

  return (
    <div className="relative bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Promotion message — live coupon from the backend, or a service promise */}
        <div className="mx-auto flex min-w-0 items-center gap-2 overflow-hidden sm:mx-0">
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-foreground/15 px-2 py-0.5 font-semibold">
            <Zap className="size-3 text-accent" />
            {promotion ? "Limited Offer" : "AURA Promise"}
          </span>

          {promotion ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="truncate">
                <strong className="font-bold">
                  {describeDiscount(promotion)}
                </strong>
                {promotion.maxDiscountAmount &&
                  promotion.discountType === "PERCENTAGE" && (
                    <span className="hidden md:inline">
                      {" "}
                      (save up to {formatPrice(promotion.maxDiscountAmount)})
                    </span>
                  )}
                <span className="hidden sm:inline"> with code</span>
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-dashed border-primary-foreground/40 px-1.5 py-0.5 font-mono font-bold transition-colors hover:bg-primary-foreground/10"
                aria-label={
                  copied
                    ? "Coupon code copied"
                    : `Copy coupon code ${promotion.code}`
                }
              >
                {promotion.code}
                {copied ? (
                  <Check className="size-3" />
                ) : (
                  <Copy className="size-3 opacity-70" />
                )}
              </button>
              {endsIn && (
                <span className="hidden shrink-0 items-center gap-1 text-primary-foreground/80 lg:inline-flex">
                  <Clock className="size-3" />
                  Ends in {endsIn}
                </span>
              )}
            </span>
          ) : (
            <span className="truncate">
              100% authentic products · Cash on delivery nationwide · 7-day easy
              returns
            </span>
          )}
        </div>

        {/* Quick support / info links */}
        <div className="hidden shrink-0 items-center gap-6 text-primary-foreground/90 sm:flex">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-primary-foreground"
          >
            <Headphones className="size-3.5" />
            <span>Support</span>
          </Link>
          <span className="text-primary-foreground/30">•</span>
          <Link
            href="/track-order"
            className="group inline-flex items-center gap-1 transition-colors hover:text-primary-foreground"
          >
            <Truck className="size-3.5" />
            <span>Track Order</span>
            <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            className="ml-2 rounded-full p-1 text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            aria-label="Close announcement bar"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
