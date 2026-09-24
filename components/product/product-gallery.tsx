"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { isOptimizableImage } from "@/lib/images"
import { cn } from "@/lib/utils"

const ZOOM_SCALE = 1.9
const SWIPE_THRESHOLD_PX = 40

interface ProductGalleryProps {
  name: string
  images: Array<{ id: number; url: string }>
}

/**
 * Crossfading gallery: all photos are stacked and only opacity changes, so
 * switching is smooth (no reflow, no re-download). Desktop gets hover zoom
 * that follows the pointer; touch gets swipe; keyboard gets arrow keys.
 */
export function ProductGallery({ name, images }: ProductGalleryProps) {
  const [index, setIndex] = React.useState(0)
  const [zoom, setZoom] = React.useState<{ x: number; y: number } | null>(null)
  const touchStartX = React.useRef<number | null>(null)
  const count = images.length

  const go = React.useCallback(
    (delta: number) => setIndex((value) => (value + delta + count) % count),
    [count]
  )

  if (count === 0) {
    return (
      <div
        className="aspect-square rounded-3xl bg-muted"
        aria-label="No product image"
      />
    )
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return
    const rect = event.currentTarget.getBoundingClientRect()
    setZoom({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse">
      <div
        className="group relative aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-3xl bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${name} images, ${index + 1} of ${count}`}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") go(1)
          if (event.key === "ArrowLeft") go(-1)
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setZoom(null)}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null
        }}
        onTouchEnd={(event) => {
          const start = touchStartX.current
          const end = event.changedTouches[0]?.clientX
          touchStartX.current = null
          if (start === null || end === undefined) return
          if (Math.abs(end - start) > SWIPE_THRESHOLD_PX)
            go(end < start ? 1 : -1)
        }}
      >
        {images.map((image, imageIndex) => (
          <Image
            key={image.id}
            src={image.url}
            alt={
              imageIndex === index ? `${name} — image ${imageIndex + 1}` : ""
            }
            aria-hidden={imageIndex !== index}
            fill
            priority={imageIndex === 0}
            sizes="(min-width: 1536px) 720px, (min-width: 1024px) 50vw, 100vw"
            unoptimized={!isOptimizableImage(image.url)}
            style={
              imageIndex === index && zoom
                ? {
                    transformOrigin: `${zoom.x}% ${zoom.y}%`,
                    transform: `scale(${ZOOM_SCALE})`,
                  }
                : undefined
            }
            className={cn(
              "object-cover transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              imageIndex === index ? "opacity-100" : "opacity-0"
            )}
          />
        ))}

        {count > 1 && (
          <>
            {(
              [
                [-1, "Previous image", ChevronLeft, "left-4"],
                [1, "Next image", ChevronRight, "right-4"],
              ] as const
            ).map(([delta, label, Icon, side]) => (
              <button
                key={label}
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  go(delta)
                }}
                aria-label={label}
                className={cn(
                  "absolute top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-background/95 text-foreground opacity-0 shadow-lg backdrop-blur transition-all duration-300 group-hover:opacity-100 hover:scale-105 focus-visible:opacity-100",
                  side
                )}
              >
                <Icon className="size-5" />
              </button>
            ))}
            {/* Progress dots (mobile) */}
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 lg:hidden">
              {images.map((image, imageIndex) => (
                <span
                  key={image.id}
                  className={cn(
                    "h-1.5 rounded-full bg-background/90 shadow transition-all duration-300",
                    imageIndex === index ? "w-6" : "w-1.5 opacity-60"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {count > 1 && (
        <ul
          className="flex gap-3 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-visible"
          aria-label="Choose image"
        >
          {images.map((image, imageIndex) => (
            <li key={image.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(imageIndex)}
                onMouseEnter={() => setIndex(imageIndex)}
                aria-label={`Show image ${imageIndex + 1} of ${count}`}
                aria-current={imageIndex === index}
                className={cn(
                  "relative block size-20 cursor-pointer overflow-hidden rounded-2xl bg-muted transition-all duration-300",
                  imageIndex === index
                    ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                    : "opacity-60 hover:opacity-100"
                )}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="80px"
                  unoptimized={!isOptimizableImage(image.url)}
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
