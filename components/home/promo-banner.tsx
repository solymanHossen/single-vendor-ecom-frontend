import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clock } from "lucide-react"
import { formatPrice, timeUntil } from "@/lib/format"
import { isOptimizableImage, sizedImage } from "@/lib/images"
import { collectionHref } from "@/lib/routes"
import type {
  NavigationProduct,
  NavigationPromotion,
} from "@/lib/storefront-types"

interface PromoBannerProps {
  promotion: NavigationPromotion | null
  spotlight: NavigationProduct | null
}

/**
 * Live coupon from the backend, rendered as a bold, calm banner. Server
 * component: the "ends in" copy is computed once per render, so there is no
 * client/server clock mismatch.
 */
export function PromoBanner({ promotion, spotlight }: PromoBannerProps) {
  if (!promotion) return null

  const headline =
    promotion.discountType === "PERCENTAGE"
      ? `${Number.parseFloat(promotion.discountValue)}% off`
      : `${formatPrice(promotion.discountValue)} off`
  const condition = promotion.minOrderAmount
    ? `on orders over ${formatPrice(promotion.minOrderAmount)}`
    : "on your order"

  return (
    <section
      aria-label="Current offer"
      className="relative overflow-hidden rounded-[2rem] bg-foreground text-background"
    >
      <div className="grid items-center lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6 p-8 sm:p-12 lg:p-16">
          <p className="inline-flex items-center gap-2 rounded-full bg-background/10 px-3.5 py-1.5 text-sm font-medium">
            <Clock className="size-4" />
            Ends in {timeUntil(promotion.validUntil)}
          </p>
          <div className="space-y-3">
            <h2 className="text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {headline}{" "}
              <span className="block text-background/60">{condition}</span>
            </h2>
            {promotion.maxDiscountAmount &&
              promotion.discountType === "PERCENTAGE" && (
                <p className="text-base text-background/70">
                  Save up to {formatPrice(promotion.maxDiscountAmount)} at
                  checkout.
                </p>
              )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={collectionHref("on-sale")}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-background px-7 text-[15px] font-semibold text-foreground transition-opacity hover:opacity-90"
            >
              Shop the sale
              <ArrowRight className="size-4" />
            </Link>
            <span className="inline-flex h-12 items-center gap-2 rounded-full border border-dashed border-background/30 px-5 font-mono text-[15px] font-semibold tracking-wider">
              {promotion.code}
            </span>
          </div>
        </div>
        {spotlight?.thumbnailUrl && (
          <div className="relative hidden h-full min-h-[420px] lg:block">
            <Image
              src={sizedImage(spotlight.thumbnailUrl, 1000, 900)}
              alt={spotlight.name}
              fill
              sizes="45vw"
              unoptimized={!isOptimizableImage(spotlight.thumbnailUrl)}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-foreground via-foreground/20 to-transparent" />
          </div>
        )}
      </div>
    </section>
  )
}
