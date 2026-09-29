import Image from "next/image"
import { CalendarClock, Flame, Timer } from "lucide-react"
import { Countdown } from "@/components/campaigns/countdown"
import type { PublicCampaign } from "@/lib/backend-campaigns"
import { formatDate } from "@/lib/format"
import { isOptimizableImage } from "@/lib/images"
import { cn } from "@/lib/utils"

export const DEFAULT_ACCENT = "#1d4ed8"

/** Full-bleed sale header: accent gradient (or banner), headline offer and a live countdown. */
export function CampaignHero({
  campaign,
  productCount,
  serverNow,
  compact = false,
}: {
  campaign: PublicCampaign
  productCount: number
  serverNow: number
  compact?: boolean
}) {
  const accent = campaign.accentColor ?? DEFAULT_ACCENT
  const cap =
    campaign.discountType === "PERCENTAGE" && campaign.maxDiscountAmount
      ? ` · up to ৳${Number(campaign.maxDiscountAmount).toLocaleString("en-US")} per item`
      : ""

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-3xl text-white",
        compact ? "px-6 py-8 sm:px-10 sm:py-10" : "px-6 py-12 sm:px-12 sm:py-16 lg:py-20"
      )}
      style={{ backgroundColor: accent }}
    >
      {campaign.bannerUrl ? (
        <>
          <Image
            src={campaign.bannerUrl}
            alt=""
            fill
            priority={!compact}
            sizes="100vw"
            unoptimized={!isOptimizableImage(campaign.bannerUrl)}
            className="-z-20 object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
        </>
      ) : (
        <div
          className="absolute inset-0 -z-10 opacity-90"
          style={{
            backgroundImage: `radial-gradient(circle at 85% 20%, rgba(255,255,255,0.28), transparent 45%), radial-gradient(circle at 10% 110%, rgba(0,0,0,0.35), transparent 50%)`,
          }}
          aria-hidden="true"
        />
      )}

      <div className="flex flex-wrap items-end justify-between gap-8">
        <div className="max-w-2xl space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-semibold backdrop-blur-sm">
            {campaign.status === "LIVE" ? (
              <Flame className="size-4" aria-hidden="true" />
            ) : (
              <CalendarClock className="size-4" aria-hidden="true" />
            )}
            {campaign.status === "LIVE" ? "Live now" : campaign.status === "SCHEDULED" ? "Coming soon" : "This sale has ended"}
          </p>
          <h1 className={cn("font-semibold tracking-tight", compact ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl lg:text-6xl")}>
            {campaign.name}
          </h1>
          <p className={cn("font-semibold", compact ? "text-xl" : "text-2xl sm:text-3xl")}>
            {campaign.label}
            <span className="text-base font-medium opacity-80 sm:text-lg">{cap}</span>
          </p>
          {campaign.tagline && <p className="text-base opacity-85 sm:text-lg">{campaign.tagline}</p>}
          {!compact && productCount > 0 && (
            <p className="text-sm opacity-75">
              {productCount} {productCount === 1 ? "product" : "products"} in this sale
            </p>
          )}
        </div>

        {campaign.status !== "ENDED" && (
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium opacity-85">
              <Timer className="size-4" aria-hidden="true" />
              {campaign.status === "LIVE" ? "Ends in" : `Starts ${formatDate(campaign.startsAt, true)} · in`}
            </p>
            <Countdown
              target={campaign.status === "LIVE" ? campaign.endsAt : campaign.startsAt}
              serverNow={serverNow}
              size={compact ? "md" : "lg"}
            />
          </div>
        )}
        {campaign.status === "ENDED" && (
          <p className="rounded-2xl bg-black/25 px-4 py-3 text-sm backdrop-blur-sm">
            Ended {formatDate(campaign.endsAt, true)}. Prices are back to normal.
          </p>
        )}
      </div>
    </section>
  )
}
