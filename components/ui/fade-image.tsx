"use client"

import * as React from "react"
import Image, { type ImageProps } from "next/image"
import { cn } from "@/lib/utils"

type LoadState = "pending" | "cached" | "loaded"

/**
 * next/image that fades into place while it downloads, instead of popping
 * in over an empty box. Images the browser already has (cache hits after a
 * category or filter change) are detected before first paint and shown
 * instantly, so navigating never re-plays the fade.
 */
export function FadeImage({ alt, className, onLoad, ...props }: ImageProps) {
  const [state, setState] = React.useState<LoadState>("pending")

  // Runs in the commit phase, before the browser paints the new card.
  const detectCached = React.useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) {
      setState((current) => (current === "pending" ? "cached" : current))
    }
  }, [])

  return (
    <Image
      {...props}
      ref={detectCached}
      alt={alt}
      onLoad={(event) => {
        setState((current) => (current === "pending" ? "loaded" : current))
        onLoad?.(event)
      }}
      className={cn(
        state !== "cached" &&
          "transition-opacity duration-500 ease-out motion-reduce:transition-none",
        state === "pending" ? "opacity-0" : "opacity-100",
        className
      )}
    />
  )
}
