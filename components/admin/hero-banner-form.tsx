"use client"

import * as React from "react"
import Image from "next/image"
import { ImagePlus, Loader2 } from "lucide-react"
import {
  createHeroBannerAction,
  updateHeroBannerAction,
  uploadHeroBannerImageAction,
} from "@/actions/hero-banner.actions"
import type { HeroBanner, HeroBannerPlacement } from "@/lib/backend-hero"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface HeroBannerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  banner?: HeroBanner
  defaultPlacement: HeroBannerPlacement
  onSaved: (banner: HeroBanner) => void
}

export function HeroBannerForm({
  open,
  onOpenChange,
  banner,
  defaultPlacement,
  onSaved,
}: HeroBannerFormProps) {
  const isEditing = !!banner

  const [placement, setPlacement] = React.useState<HeroBannerPlacement>(
    banner?.placement ?? defaultPlacement
  )
  const [title, setTitle] = React.useState(banner?.title ?? "")
  const [href, setHref] = React.useState(banner?.href ?? "")
  const [isActive, setIsActive] = React.useState(banner?.isActive ?? true)
  const [imageUrl, setImageUrl] = React.useState(banner?.imageUrl ?? "")
  const [imageKey, setImageKey] = React.useState(banner?.imageKey ?? "")

  const [isUploading, startUpload] = React.useTransition()
  const [isSaving, startSave] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Re-seed local state whenever the dialog is (re)opened for a different
  // banner, or for "add new" — Dialog keeps this component mounted between
  // opens, so state doesn't reset on its own. Adjusted during render (React's
  // recommended "resetting state when a prop changes" pattern) rather than in
  // an effect, which would cause an extra render before the reset is visible.
  const resetKey = open
    ? banner
      ? `edit-${banner.id}`
      : `add-${defaultPlacement}`
    : null
  const [lastResetKey, setLastResetKey] = React.useState<string | null>(null)
  if (resetKey && resetKey !== lastResetKey) {
    setLastResetKey(resetKey)
    setPlacement(banner?.placement ?? defaultPlacement)
    setTitle(banner?.title ?? "")
    setHref(banner?.href ?? "")
    setIsActive(banner?.isActive ?? true)
    setImageUrl(banner?.imageUrl ?? "")
    setImageKey(banner?.imageKey ?? "")
    setError(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    startUpload(async () => {
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadHeroBannerImageAction(formData)

      if ("error" in result) {
        setError(result.error)
        return
      }
      setImageUrl(result.url)
      setImageKey(result.key)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrl || !imageKey) {
      setError("Upload a banner image first")
      return
    }
    if (!title.trim() || !href.trim()) {
      setError("Title and link are required")
      return
    }

    startSave(async () => {
      const data = {
        placement,
        title: title.trim(),
        href: href.trim(),
        imageUrl,
        imageKey,
        isActive,
      }
      const result = isEditing
        ? await updateHeroBannerAction(banner.id, data)
        : await createHeroBannerAction(data)

      if ("error" in result) {
        setError(result.error)
        return
      }
      onSaved(result.banner)
      onOpenChange(false)
    })
  }

  const placementOptions: Array<{
    value: HeroBannerPlacement
    title: string
    description: string
  }> = [
    {
      value: "MAIN",
      title: "Main carousel",
      description: "Large rotating slide",
    },
    {
      value: "SIDE",
      title: "Side card",
      description: "Stacked beside the carousel",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto rounded-3xl p-0 sm:max-w-2xl">
        <DialogHeader className="space-y-1.5 border-b border-border/70 px-7 pt-7 pb-5">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {isEditing ? "Edit banner" : "New banner"}
          </DialogTitle>
          <DialogDescription className="text-[15px]">
            {isEditing
              ? "Update the image, text or link. Changes go live immediately."
              : "Upload an image and choose where it appears on the homepage."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-7 py-6">
          <fieldset className="space-y-2.5">
            <legend className="mb-2.5 text-[15px] font-medium">
              Placement
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {placementOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPlacement(option.value)}
                  aria-pressed={placement === option.value}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-colors duration-150",
                    placement === option.value
                      ? "border-foreground bg-foreground/[0.03] ring-1 ring-foreground"
                      : "border-border hover:border-foreground/40"
                  )}
                >
                  <span className="block text-[15px] font-semibold">
                    {option.title}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2.5">
            <Label className="text-[15px] font-medium">Image</Label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={cn(
                "group relative flex w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/40 transition-colors hover:border-foreground/30 hover:bg-muted/60",
                placement === "MAIN" ? "aspect-video" : "aspect-4/3 sm:w-2/3",
                isUploading && "opacity-60"
              )}
            >
              {imageUrl ? (
                <>
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    sizes="640px"
                    className="object-cover"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-linear-to-t from-black/70 to-transparent py-4 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <ImagePlus className="size-4" />
                    Replace image
                  </span>
                </>
              ) : (
                <span className="flex flex-col items-center gap-2 text-muted-foreground">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-background shadow-xs">
                    <ImagePlus className="size-6" />
                  </span>
                  <span className="text-[15px] font-medium text-foreground">
                    Click to upload
                  </span>
                  <span className="text-sm">
                    {placement === "MAIN"
                      ? "Wide image, 16:9 recommended"
                      : "4:3 image recommended"}
                  </span>
                </span>
              )}
              {isUploading && (
                <span className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <Loader2 className="size-6 animate-spin" />
                </span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="banner-title" className="text-[15px] font-medium">
                Title
              </Label>
              <Input
                id="banner-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Next-Gen Gaming Rigs Sale"
                className="h-11 rounded-xl px-3.5 text-[15px] md:text-[15px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-href" className="text-[15px] font-medium">
                Link
              </Label>
              <Input
                id="banner-href"
                value={href}
                onChange={(e) => setHref(e.target.value)}
                placeholder="/products?category=gaming-pc"
                className="h-11 rounded-xl px-3.5 text-[15px] md:text-[15px]"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-muted/60 p-4">
            <span>
              <span className="block text-[15px] font-medium">
                Live on homepage
              </span>
              <span className="block text-sm text-muted-foreground">
                Turn off to keep the banner as a hidden draft.
              </span>
            </span>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </label>

          {error && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="-mx-7 -mb-6 gap-2 border-t border-border/70 bg-muted/30 px-7 py-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 rounded-xl px-5 text-[15px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isUploading}
              className="h-11 rounded-xl px-6 text-[15px] font-semibold"
            >
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              {isSaving
                ? "Saving…"
                : isEditing
                  ? "Save changes"
                  : "Create banner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
