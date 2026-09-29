"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { isOptimizableImage } from "@/lib/images"
import { cn } from "@/lib/utils"

/** Thumbnails that open a full-size viewer (arrow keys to browse). */
export function ReviewPhotos({ photos, reviewer }: { photos: Array<{ id: number; url: string }>; reviewer: string }) {
  const [open, setOpen] = React.useState<number | null>(null)
  const current = open === null ? null : photos[open]

  React.useEffect(() => {
    if (open === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setOpen((index) => (index === null ? index : (index + 1) % photos.length))
      if (event.key === "ArrowLeft")
        setOpen((index) => (index === null ? index : (index - 1 + photos.length) % photos.length))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, photos.length])

  if (photos.length === 0) return null

  return (
    <>
      <ul className="flex flex-wrap gap-2" aria-label="Customer photos">
        {photos.map((photo, index) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => setOpen(index)}
              className="relative block size-20 overflow-hidden rounded-xl bg-muted ring-1 ring-border/60 transition-opacity hover:opacity-90 sm:size-24"
              aria-label={`Open photo ${index + 1} of ${photos.length}`}
            >
              <Image
                src={photo.url}
                alt=""
                fill
                sizes="96px"
                unoptimized={!isOptimizableImage(photo.url)}
                className="object-cover"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={open !== null} onOpenChange={(next) => !next && setOpen(null)}>
        <DialogContent className="max-w-3xl gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-3xl">
          <DialogTitle className="sr-only">Photo from {reviewer}</DialogTitle>
          {current && (
            <div className="relative aspect-square max-h-[80vh] w-full bg-muted sm:aspect-[4/3]">
              <Image
                src={current.url}
                alt={`Photo from ${reviewer}`}
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                unoptimized={!isOptimizableImage(current.url)}
                className="object-contain"
              />
              {photos.length > 1 && (
                <>
                  {[
                    { label: "Previous photo", icon: ChevronLeft, step: -1, side: "left-3" },
                    { label: "Next photo", icon: ChevronRight, step: 1, side: "right-3" },
                  ].map((control) => (
                    <button
                      key={control.label}
                      type="button"
                      aria-label={control.label}
                      onClick={() =>
                        setOpen((index) =>
                          index === null ? index : (index + control.step + photos.length) % photos.length
                        )
                      }
                      className={cn(
                        "absolute top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md backdrop-blur transition-colors hover:bg-background",
                        control.side
                      )}
                    >
                      <control.icon className="size-5" />
                    </button>
                  ))}
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-sm font-medium tabular-nums">
                    {(open ?? 0) + 1} / {photos.length}
                  </span>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
