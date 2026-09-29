"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, MessageSquareReply, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { moderateReviewAction, removeReviewReplyAction, replyToReviewAction } from "@/actions/admin-review.actions"
import { Button } from "@/components/ui/button"
import type { AdminReview } from "@/lib/backend-reviews"

/** Publish/hide, and the store's public response, for one review. */
export function ReviewModeration({ review, storeName }: { review: AdminReview; storeName: string }) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [replying, setReplying] = React.useState(false)
  const [text, setText] = React.useState(review.reply?.text ?? "")

  const run = (work: () => Promise<{ error: string } | object>, success: string, description?: string) =>
    startTransition(async () => {
      const result = await work()
      if ("error" in result) {
        toast.error("Couldn't update the review", { description: result.error })
        return
      }
      toast.success(success, { description })
      setReplying(false)
      router.refresh()
    })

  const published = review.status === "PUBLISHED"

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {published ? (
          <Button
            variant="outline"
            className="h-9 rounded-xl"
            disabled={pending}
            onClick={() =>
              run(() => moderateReviewAction(review.id, "HIDDEN"), "Review hidden", "It no longer shows on the product page.")
            }
          >
            <EyeOff className="size-4" />
            Hide
          </Button>
        ) : (
          <Button
            className="h-9 rounded-xl"
            disabled={pending}
            onClick={() =>
              run(() => moderateReviewAction(review.id, "PUBLISHED"), "Review published", "It's live on the product page.")
            }
          >
            <Eye className="size-4" />
            Publish
          </Button>
        )}
        <Button variant="outline" className="h-9 rounded-xl" disabled={pending} onClick={() => setReplying((open) => !open)}>
          <MessageSquareReply className="size-4" />
          {review.reply ? "Edit response" : "Respond"}
        </Button>
        {pending && <Loader2 className="size-4 animate-spin self-center text-muted-foreground" aria-label="Saving" />}
      </div>

      {replying && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            const reply = text.trim()
            if (!reply) return
            run(() => replyToReviewAction(review.id, reply), "Response saved", "Shoppers see it under the review.")
          }}
          className="space-y-2 rounded-2xl border border-border/70 bg-background p-3"
        >
          <label htmlFor={`reply-${review.id}`} className="text-xs font-medium text-muted-foreground">
            Public response from {storeName}
          </label>
          <textarea
            id={`reply-${review.id}`}
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            maxLength={2000}
            autoFocus
            placeholder={
              review.rating <= 3
                ? "Sorry to hear this — explain what you'll do to make it right."
                : "Thank them, and add anything useful for other shoppers."
            }
            className="field-sizing-content min-h-20 w-full resize-none bg-transparent px-1 text-[15px] outline-none placeholder:text-muted-foreground"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            {review.reply ? (
              <Button
                type="button"
                variant="ghost"
                className="h-9 rounded-xl text-muted-foreground hover:text-destructive"
                disabled={pending}
                onClick={() => run(() => removeReviewReplyAction(review.id), "Response removed")}
              >
                <Trash2 className="size-4" />
                Remove
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" className="h-9 rounded-xl" onClick={() => setReplying(false)}>
                Cancel
              </Button>
              <Button type="submit" className="h-9 rounded-xl" disabled={pending || !text.trim()}>
                Save response
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
