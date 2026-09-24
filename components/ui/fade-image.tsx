"use client"

import * as React from "react"
import Image, { type ImageProps } from "next/image"
import { cn } from "@/lib/utils"

/**
 * next/image that fades (and gently settles) into place once decoded,
 * instead of popping in over an empty box. Server components can use it
 * like a plain <Image>.
 */
export function FadeImage({ alt, className, onLoad, ...props }: ImageProps) {
  const [loaded, setLoaded] = React.useState(false)

  return (
    <Image
      {...props}
      alt={alt}
      onLoad={(event) => {
        setLoaded(true)
        onLoad?.(event)
      }}
      className={cn(
        "transition-[opacity,scale,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        loaded ? "scale-100 opacity-100" : "scale-[1.02] opacity-0",
        className
      )}
    />
  )
}
