"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { isOptimizableImage } from "@/lib/images"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  name: string
  images: Array<{ id: number; url: string }>
}

export function ProductGallery({ name, images }: ProductGalleryProps) {
  const [index, setIndex] = React.useState(0)
  const count = images.length
  const current = images[index] ?? images[0]

  const go = (delta: number) =>
    setIndex((value) => (value + delta + count) % count)

  if (!current) {
    return (
      <div
        className="aspect-square rounded-3xl bg-muted"
        aria-label="No product image"
      />
    )
  }

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row">
      {count > 1 && (
        <ul
          className="flex gap-2 overflow-x-auto lg:max-h-[560px] lg:flex-col lg:overflow-y-auto"
          aria-label="Product images"
        >
          {images.map((image, imageIndex) => (
            <li key={image.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(imageIndex)}
                aria-label={`Show image ${imageIndex + 1} of ${count}`}
                aria-current={imageIndex === index}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-xl border-2 transition-all sm:size-20",
                  imageIndex === index
                    ? "border-primary"
                    : "border-transparent opacity-70 hover:opacity-100"
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

      <div
        className="group relative aspect-square flex-1 overflow-hidden rounded-3xl bg-muted"
        tabIndex={count > 1 ? 0 : -1}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") go(1)
          if (event.key === "ArrowLeft") go(-1)
        }}
        aria-roledescription="carousel"
        aria-label={`${name} images`}
      >
        <Image
          key={current.id}
          src={current.url}
          alt={`${name} — image ${index + 1}`}
          fill
          priority
          sizes="(min-width: 1024px) 600px, 100vw"
          unoptimized={!isOptimizableImage(current.url)}
          className="animate-in object-cover duration-300 fade-in"
        />
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 opacity-0 shadow-md backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 opacity-0 shadow-md backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute right-3 bottom-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
