"use client"

import * as React from "react"
import Image from "next/image"
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { uploadProductImageAction } from "@/actions/product.actions"
import { isOptimizableImage } from "@/lib/images"
import { cn } from "@/lib/utils"

export const MAX_PRODUCT_IMAGES = 20

/** Order is meaningful: the first image is the cover (thumbnail). */
export function ProductMedia({
  images,
  onChange,
  error,
}: {
  images: string[]
  onChange: (next: string[]) => void
  error?: string
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(0)
  const [dragIndex, setDragIndex] = React.useState<number | null>(null)
  const [dropIndex, setDropIndex] = React.useState<number | null>(null)
  const [fileOver, setFileOver] = React.useState(false)

  // Uploads resolve out of order; always append to the latest list.
  const imagesRef = React.useRef(images)
  React.useEffect(() => {
    imagesRef.current = images
  })

  const upload = async (files: File[]) => {
    const room = MAX_PRODUCT_IMAGES - imagesRef.current.length - uploading
    const accepted = files.filter((file) => file.type.startsWith("image/")).slice(0, Math.max(room, 0))
    if (accepted.length < files.length) {
      toast.warning("Some files were skipped", {
        description:
          room <= 0
            ? `A product can have up to ${MAX_PRODUCT_IMAGES} images.`
            : "Only image files can be added.",
      })
    }
    if (accepted.length === 0) return

    setUploading((count) => count + accepted.length)
    await Promise.all(
      accepted.map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)
        const result = await uploadProductImageAction(formData)
        setUploading((count) => count - 1)
        if ("error" in result) {
          toast.error("Image upload failed", { description: `${file.name}: ${result.error}` })
          return
        }
        const next = [...imagesRef.current, result.url]
        imagesRef.current = next
        onChange(next)
      })
    )
  }

  const move = (from: number, to: number) => {
    if (from === to) return
    const next = [...images]
    const [moved] = next.splice(from, 1)
    if (moved === undefined) return
    next.splice(to, 0, moved)
    onChange(next)
  }

  const slots = images.length + uploading
  const canAdd = slots < MAX_PRODUCT_IMAGES

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes("Files")) {
            event.preventDefault()
            setFileOver(true)
          }
        }}
        onDragLeave={() => setFileOver(false)}
        onDrop={(event) => {
          if (!event.dataTransfer.files.length) return
          event.preventDefault()
          setFileOver(false)
          void upload([...event.dataTransfer.files])
        }}
        className={cn(
          "grid grid-cols-2 gap-3 rounded-2xl sm:grid-cols-4 xl:grid-cols-5",
          fileOver && "ring-2 ring-ring ring-offset-4 ring-offset-card"
        )}
      >
        {images.map((url, index) => (
          <div
            key={url}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move"
              setDragIndex(index)
            }}
            onDragOver={(event) => {
              if (dragIndex === null) return
              event.preventDefault()
              setDropIndex(index)
            }}
            onDrop={(event) => {
              if (dragIndex === null) return
              event.preventDefault()
              event.stopPropagation()
              move(dragIndex, index)
              setDragIndex(null)
              setDropIndex(null)
            }}
            onDragEnd={() => {
              setDragIndex(null)
              setDropIndex(null)
            }}
            className={cn(
              "group relative aspect-square cursor-grab overflow-hidden rounded-2xl border border-border/70 bg-muted active:cursor-grabbing",
              index === 0 && "sm:col-span-2 sm:row-span-2",
              dragIndex === index && "opacity-40",
              dropIndex === index && dragIndex !== index && "ring-2 ring-ring"
            )}
          >
            <Image
              src={url}
              alt={`Product image ${index + 1}`}
              fill
              sizes={index === 0 ? "320px" : "160px"}
              unoptimized={!isOptimizableImage(url)}
              className="object-cover"
              draggable={false}
            />
            {index === 0 && (
              <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-background/95 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm">
                <Star className="size-3 fill-current" aria-hidden="true" />
                Cover
              </span>
            )}
            <div className="absolute inset-x-2 bottom-2 flex justify-end gap-1.5 opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100">
              {index !== 0 && (
                <button
                  type="button"
                  onClick={() => move(index, 0)}
                  className="flex h-8 items-center gap-1.5 rounded-lg bg-background/95 px-2.5 text-xs font-medium text-foreground shadow-sm hover:bg-background"
                >
                  <Star className="size-3.5" aria-hidden="true" />
                  Make cover
                </button>
              )}
              <button
                type="button"
                onClick={() => onChange(images.filter((_, i) => i !== index))}
                aria-label={`Remove image ${index + 1}`}
                className="flex size-8 items-center justify-center rounded-lg bg-background/95 text-destructive shadow-sm hover:bg-background"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}

        {Array.from({ length: uploading }, (_, index) => (
          <div
            key={`uploading-${index}`}
            className="flex aspect-square items-center justify-center rounded-2xl border border-border/70 bg-muted"
          >
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background text-center transition-colors hover:border-foreground/40 hover:bg-muted/40",
              slots === 0 && "col-span-2 aspect-auto py-12 sm:col-span-4 xl:col-span-5",
              error && "border-destructive/60"
            )}
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-muted">
              <ImagePlus className="size-5 text-muted-foreground" />
            </span>
            <span className="px-2 text-sm font-medium text-foreground">
              {slots === 0 ? "Upload product images" : "Add images"}
            </span>
            {slots === 0 && (
              <span className="text-sm text-muted-foreground">
                Drag and drop, or click to browse · JPG, PNG or WebP
              </span>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = [...(event.target.files ?? [])]
          event.target.value = ""
          void upload(files)
        }}
      />
      <p className={cn("text-sm", error ? "text-destructive" : "text-muted-foreground")}>
        {error ??
          `${images.length}/${MAX_PRODUCT_IMAGES} images · drag to reorder — the first one is the cover shown in the store.`}
      </p>
    </div>
  )
}
