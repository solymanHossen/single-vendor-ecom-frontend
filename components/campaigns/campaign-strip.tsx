import Link from "next/link"
import { ChevronRight, Flame } from "lucide-react"
import { Countdown } from "@/components/campaigns/countdown"
import type { ProductCampaign } from "@/lib/storefront-types"

/** "Eid Mega Sale · 20% off · ends in 02:14:09" above the product price. */
export function CampaignStrip({ campaign, serverNow }: { campaign: ProductCampaign; serverNow: number }) {
  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className="group flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 px-4 py-3 text-white shadow-sm transition-[filter] hover:brightness-105"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <Flame className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-semibold">{campaign.name}</span>
          <span className="block text-sm text-white/85">{campaign.label} · sale price applied</span>
        </span>
      </span>
      <span className="flex items-center gap-2">
        <span className="text-xs font-medium tracking-wide text-white/85 uppercase">Ends in</span>
        <Countdown target={campaign.endsAt} serverNow={serverNow} size="sm" />
        <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  )
}
