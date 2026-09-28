"use client"

import * as React from "react"
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

/** The store's uploaded logo (Admin → Settings), or the bundled mark as a fallback. */
export function Logo({ size = "sm", framed = true, className }: LogoProps) {
  const { logoUrl, storeName } = useStoreSettings()
  const src = logoUrl ?? "/aura-logo.png"
  // Dimension mapping for clean logo emblem display
  const dimensions = {
    xs: { width: 32, height: 32 },
    sm: { width: 36, height: 36 },
    md: { width: 44, height: 44 },
    lg: { width: 56, height: 56 },
  }[size]

  return (
    <div
      className={cn(
        "group inline-flex items-center justify-center select-none",
        className
      )}
    >
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-[1.03]",
          framed
            ? "rounded-xl border border-border/40 bg-background/60 p-1 shadow-sm backdrop-blur-sm"
            : "rounded-lg"
        )}
      >
        <Image
          src={src}
          alt={`${storeName} logo`}
          unoptimized={logoUrl !== null && !isOptimizableImage(logoUrl)}
          width={dimensions.width}
          height={dimensions.height}
          className="rounded-lg object-contain"
          priority
        />
      </div>
    </div>
  )
}
