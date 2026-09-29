"use client"

import Image from "next/image"
import { useStoreSettings } from "@/components/store-settings-provider"
import { isOptimizableImage } from "@/lib/images"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg"
  /** Bordered glass tile around the emblem; off for compact bars like the header. */
  framed?: boolean
  className?: string
}

/**
 * Logo sizing standard: a fixed height per size with the width following the
 * image's own shape, capped at a maximum. A square emblem and a wide wordmark
 * both render crisp and undistorted at the same visual weight.
 *
 *   xs  32px tall, ≤128px wide — checkout bar, collapsed admin
 *   sm  40px tall, ≤160px wide — storefront header, admin sidebar, auth
 *   md  48px tall, ≤180px wide — footer, mobile menu
 *   lg  56px tall, ≤200px wide — splash / empty states
 */
const SIZES = {
  xs: { height: 32, maxWidth: 128, className: "h-8 max-w-32" },
  sm: { height: 40, maxWidth: 160, className: "h-10 max-w-40" },
  md: { height: 48, maxWidth: 180, className: "h-12 max-w-45" },
  lg: { height: 56, maxWidth: 200, className: "h-14 max-w-50" },
} as const

/** The store's uploaded logo (Admin → Settings), or the bundled mark as a fallback. */
export function Logo({ size = "sm", framed = true, className }: LogoProps) {
  const { logoUrl, storeName } = useStoreSettings()
  const src = logoUrl ?? "/aura-logo.png"
  const box = SIZES[size]

  return (
    <span className={cn("group inline-flex shrink-0 items-center select-none", className)}>
      <span
        className={cn(
          "inline-flex items-center transition-transform duration-200 group-hover:scale-[1.03]",
          framed && "rounded-xl border border-border/40 bg-background/60 p-1 shadow-sm backdrop-blur-sm"
        )}
      >
        <Image
          src={src}
          alt={`${storeName} logo`}
          unoptimized={logoUrl !== null && !isOptimizableImage(logoUrl)}
          // 2× intrinsic hint: a sharp srcset for retina screens. CSS sets the
          // real box — fixed height, width from the image's own ratio. (Both
          // attributes differ from the rendered size, so next/image doesn't
          // flag a one-sided resize.)
          width={box.maxWidth * 2}
          height={box.height * 2}
          className={cn("w-auto rounded-md object-contain", box.className)}
          priority
        />
      </span>
    </span>
  )
}
