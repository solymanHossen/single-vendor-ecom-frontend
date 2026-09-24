import Image from "next/image"
import { ImageOff } from "lucide-react"
import { isOptimizableImage } from "@/lib/images"
import { cn } from "@/lib/utils"

export function ProductThumb({
  url,
  size = 56,
  className,
}: {
  url: string | null
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted",
        className
      )}
      style={{ width: size, height: size }}
    >
      {url ? (
        <Image
          src={url}
          alt=""
          fill
          sizes={`${size}px`}
          unoptimized={!isOptimizableImage(url)}
          className="object-cover"
        />
      ) : (
        <ImageOff className="size-5 text-muted-foreground" aria-hidden="true" />
      )}
    </span>
  )
}
