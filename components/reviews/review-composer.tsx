"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BadgeCheck,
  CircleAlert,
  EyeOff,
  Hourglass,
  Loader2,
  PackageCheck,
  PenLine,
  ShieldCheck,
  Trash2,
  Truck,
} from "lucide-react"
import { toast } from "sonner"
import { createReviewAction, deleteReviewAction, updateReviewAction, uploadReviewPhotoAction } from "@/actions/review.actions"
import { StarRating } from "@/components/catalog/star-rating"
import { INPUT_CLASS } from "@/components/admin/products/form-primitives"
import { RATING_WORDS, StarInput } from "@/components/reviews/star-input"
import { AttachButton, AttachmentTray, useAttachments } from "@/components/support/attachment-picker"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MAX_REVIEW_PHOTOS, type MyReviewStatus, type OwnReview } from "@/lib/backend-reviews"
import { cn } from "@/lib/utils"

const COMMENT_MAX = 2000

const PROMPTS: Record<number, string> = {
  0: "What did you like or dislike? How are you using it?",
  1: "Sorry it disappointed. What went wrong?",
  2: "What could have been better?",
  3: "What was good, and what wasn't?",
  4: "What did you like most?",
  5: "What made it great?",
}

function ReviewDialog({
  open,
  onOpenChange,
  productId,
  productName,
  existing,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: number
  productName: string
  existing: OwnReview | null
}) {
  const router = useRouter()
  const [rating, setRating] = React.useState(existing?.rating ?? 0)
  const [title, setTitle] = React.useState(existing?.title ?? "")
  const [comment, setComment] = React.useState(existing?.comment ?? "")
  const [error, setError] = React.useState<string | null>(null)
  const [saving, startSave] = React.useTransition()
  const photos = useAttachments({
    upload: uploadReviewPhotoAction,
    max: MAX_REVIEW_PHOTOS,
    initial: existing?.images.map((image) => image.url) ?? [],
  })

  const submit = () => {
    if (rating === 0) {
      setError("Choose a star rating.")
      document.getElementById("review-rating")?.focus()
      return
    }
    if (photos.uploading) {
      toast.info("Photos are still uploading", { description: "Give it a second, then post." })
      return
    }
    const input = { rating, title: title.trim(), comment: comment.trim(), images: photos.urls }
    startSave(async () => {
      const result = existing
        ? await updateReviewAction(productId, existing.id, input)
        : await createReviewAction(productId, input)
      if ("error" in result) {
        toast.error(existing ? "Couldn't save your review" : "Couldn't post your review", { description: result.error })
        return
      }
      onOpenChange(false)
      toast.success(existing ? "Review updated" : "Thanks for your review!", {
        description:
          result.review.status === "PUBLISHED"
            ? "It's live on the product page."
            : "It will appear once our team has checked it.",
      })
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
      <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto rounded-3xl p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-border/70 px-6 pt-6 pb-5 text-left">
          <DialogTitle className="text-xl">{existing ? "Edit your review" : "Write a review"}</DialogTitle>
          <DialogDescription className="line-clamp-1">{productName}</DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
          className="space-y-6 px-6 py-6"
        >
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Overall rating</p>
            <StarInput
              id="review-rating"
              value={rating}
              invalid={!!error}
              onChange={(value) => {
                setRating(value)
                setError(null)
              }}
            />
            {error && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <CircleAlert className="size-4" aria-hidden="true" />
                {error}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="review-title" className="text-sm font-medium text-foreground">
              Headline <span className="font-normal text-muted-foreground">Optional</span>
            </label>
            <input
              id="review-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              placeholder={rating ? `${RATING_WORDS[rating]} — sum it up in a few words` : "Sum it up in a few words"}
              className={INPUT_CLASS}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="review-comment" className="text-sm font-medium text-foreground">
                Your review <span className="font-normal text-muted-foreground">Optional</span>
              </label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {comment.length}/{COMMENT_MAX}
              </span>
            </div>
            <div className="rounded-2xl border border-input bg-background p-2 shadow-xs focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/15">
              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                onPaste={photos.onPaste}
                maxLength={COMMENT_MAX}
                rows={5}
                placeholder={PROMPTS[rating]}
                className="field-sizing-content min-h-32 w-full resize-none bg-transparent px-2 py-1.5 text-[15px] outline-none placeholder:text-muted-foreground"
              />
              <div className="px-2 pb-1">
                <AttachmentTray attachments={photos} />
              </div>
              <AttachButton attachments={photos} />
            </div>
            <p className="text-sm text-muted-foreground">
              Photos help other shoppers most — up to {MAX_REVIEW_PHOTOS}. Your name shows as first name and last initial.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" className="h-11 rounded-xl px-6 font-semibold" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {existing ? "Save changes" : "Post review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const OWN_STATUS = {
  PUBLISHED: { label: "Published", icon: BadgeCheck, className: "text-emerald-700 dark:text-emerald-400" },
  PENDING: { label: "Awaiting a quick check", icon: Hourglass, className: "text-amber-700 dark:text-amber-400" },
  HIDDEN: { label: "Hidden by our team", icon: EyeOff, className: "text-muted-foreground" },
} as const

/**
 * The "write a review" card. What it shows depends on the shopper: signed out,
 * not a buyer, order on its way, ready to review, or already reviewed.
 */
export function ReviewComposer({
  productId,
  productName,
  status,
  signedIn,
  loginHref,
  autoOpen,
}: {
  productId: number
  productName: string
  status: MyReviewStatus | null
  signedIn: boolean
  loginHref: string
  /** ?review=write — arriving from "Rate this item" on an order. */
  autoOpen: boolean
}) {
  const router = useRouter()
  const own = status?.review ?? null
  const [open, setOpen] = React.useState(autoOpen && (status?.eligible === true || own !== null))
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [deleting, startDelete] = React.useTransition()

  const shell = "rounded-2xl bg-muted/50 p-5"

  if (!signedIn) {
    return (
      <div className={shell}>
        <p className="font-medium text-foreground">Bought this?</p>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to share what you think.</p>
        <Button asChild variant="outline" className="mt-4 h-10 w-full rounded-xl bg-card">
          <Link href={loginHref}>Sign in to review</Link>
        </Button>
      </div>
    )
  }
  if (!status) return null

  if (own) {
    const meta = OWN_STATUS[own.status]
    return (
      <div className={shell}>
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium text-foreground">Your review</p>
          <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", meta.className)}>
            <meta.icon className="size-3.5" aria-hidden="true" />
            {meta.label}
          </span>
        </div>
        <div className="mt-3 space-y-1">
          <StarRating value={own.rating} />
          {own.title && <p className="line-clamp-1 text-sm font-medium text-foreground">{own.title}</p>}
          {own.comment && <p className="line-clamp-2 text-sm text-muted-foreground">{own.comment}</p>}
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="h-10 flex-1 rounded-xl bg-card" onClick={() => setOpen(true)}>
            <PenLine className="size-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            className="h-10 rounded-xl text-muted-foreground hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete your review"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
        <ReviewDialog key={own.id} open={open} onOpenChange={setOpen} productId={productId} productName={productName} existing={own} />
        <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <AlertDialogContent className="rounded-2xl sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your review?</AlertDialogTitle>
              <AlertDialogDescription className="text-[15px]">
                It&apos;s removed from the product page. You can write a new one afterwards.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-10 rounded-xl">Keep it</AlertDialogCancel>
              <AlertDialogAction
                className="h-10 rounded-xl bg-destructive text-white hover:bg-destructive/90"
                disabled={deleting}
                onClick={(event) => {
                  event.preventDefault()
                  startDelete(async () => {
                    const result = await deleteReviewAction(productId, own.id)
                    setConfirmDelete(false)
                    if ("error" in result) {
                      toast.error("Couldn't delete your review", { description: result.error })
                      return
                    }
                    toast.success("Review deleted")
                    router.refresh()
                  })
                }}
              >
                {deleting && <Loader2 className="size-4 animate-spin" />}
                Delete review
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  if (status.eligible) {
    return (
      <div className="rounded-2xl bg-foreground p-5 text-background">
        <p className="flex items-center gap-2 font-medium">
          <PackageCheck className="size-4" aria-hidden="true" />
          You bought this
        </p>
        <p className="mt-1 text-sm text-background/70">How was it? Your review helps other shoppers decide.</p>
        <Button
          className="mt-4 h-10 w-full rounded-xl bg-background font-semibold text-foreground hover:bg-background/90"
          onClick={() => setOpen(true)}
        >
          <PenLine className="size-4" />
          Write a review
        </Button>
        <ReviewDialog open={open} onOpenChange={setOpen} productId={productId} productName={productName} existing={null} />
      </div>
    )
  }

  const onTheWay = status.blocker === "NOT_DELIVERED"
  const Icon = onTheWay ? Truck : ShieldCheck
  return (
    <div className={cn(shell, "flex gap-3")}>
      <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">
        {onTheWay
          ? "Your order is on its way — you can review this once it's delivered."
          : "Only customers who received this item can review it, so every review here is from a real buyer."}
      </p>
    </div>
  )
}
