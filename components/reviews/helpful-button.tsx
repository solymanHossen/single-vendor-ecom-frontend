"use client"

import * as React from "react"
import { ThumbsUp } from "lucide-react"
import { toast } from "sonner"
import { toggleHelpfulAction } from "@/actions/review.actions"
import { cn } from "@/lib/utils"

export function HelpfulButton({
  reviewId,
  count,
  voted,
  signedIn,
  isOwn,
  loginHref,
}: {
  reviewId: number
  count: number
  voted: boolean
  signedIn: boolean
  isOwn: boolean
  loginHref: string
}) {
  const [state, setState] = React.useState({ count, voted })
  const [pending, startTransition] = React.useTransition()

  if (isOwn) {
    return state.count > 0 ? (
      <span className="text-sm text-muted-foreground">
        {state.count} {state.count === 1 ? "person" : "people"} found this helpful
      </span>
    ) : null
  }

  const vote = () => {
    if (!signedIn) {
      toast.info("Sign in to vote", {
        description: "It takes a second, and helps other shoppers.",
        action: { label: "Sign in", onClick: () => window.location.assign(loginHref) },
      })
      return
    }
    // Optimistic: flip now, reconcile with the server's count.
    const previous = state
    setState({ voted: !state.voted, count: state.count + (state.voted ? -1 : 1) })
    startTransition(async () => {
      const result = await toggleHelpfulAction(reviewId)
      if ("error" in result) {
        setState(previous)
        toast.error("Couldn't save your vote", { description: result.error })
        return
      }
      setState({ voted: result.helpful, count: result.helpfulCount })
    })
  }

  return (
    <button
      type="button"
      onClick={vote}
      disabled={pending}
      aria-pressed={state.voted}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors",
        state.voted
          ? "border-foreground bg-foreground text-background"
          : "border-border/70 bg-background text-foreground hover:border-foreground/40"
      )}
    >
      <ThumbsUp className={cn("size-4", state.voted && "fill-current")} aria-hidden="true" />
      Helpful{state.count > 0 && <span className="tabular-nums">· {state.count}</span>}
    </button>
  )
}

