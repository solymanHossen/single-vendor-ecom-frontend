"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CircleCheck, Loader2, ThumbsDown, ThumbsUp } from "lucide-react"
import { toast } from "sonner"
import { rateTicketAction, resolveTicketAction } from "@/actions/ticket.actions"
import { Button } from "@/components/ui/button"
import type { TicketStatus } from "@/lib/backend-tickets"
import { cn } from "@/lib/utils"

/** "Problem solved?" while open; "Was this helpful?" once resolved. */
export function ResolutionPanel({
  ticketId,
  status,
  satisfied,
  staffHasReplied,
}: {
  ticketId: number
  status: TicketStatus
  satisfied: boolean | null
  staffHasReplied: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [choice, setChoice] = React.useState<boolean | null>(null)
  const done = status === "RESOLVED" || status === "CLOSED"

  const resolve = () =>
    startTransition(async () => {
      const result = await resolveTicketAction(ticketId)
      if ("error" in result) {
        toast.error("Couldn't update", { description: result.error })
        return
      }
      toast.success("Marked as resolved", { description: "Glad it's sorted. You can still reply to reopen it." })
      router.refresh()
    })

  const rate = (value: boolean) => {
    setChoice(value)
    startTransition(async () => {
      const result = await rateTicketAction(ticketId, value)
      if ("error" in result) {
        setChoice(null)
        toast.error("Couldn't save your feedback", { description: result.error })
        return
      }
      toast.success("Thanks for the feedback", {
        description: value ? "We're happy we could help." : "Sorry about that — we'll use this to do better.",
      })
      router.refresh()
    })
  }

  if (!done) {
    if (!staffHasReplied) return null
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/50 px-5 py-4">
        <p className="text-[15px] text-foreground">
          <span className="font-medium">Problem solved?</span>{" "}
          <span className="text-muted-foreground">Let us know and we&apos;ll close this request.</span>
        </p>
        <Button variant="outline" className="h-10 rounded-xl bg-card" onClick={resolve} disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <CircleCheck className="size-4" />}
          Mark as resolved
        </Button>
      </div>
    )
  }

  const current = choice ?? satisfied
  if (satisfied !== null) {
    return (
      <p className="rounded-2xl bg-muted/50 px-5 py-4 text-[15px] text-muted-foreground">
        {satisfied
          ? "Thanks — you told us this helped."
          : "Thanks for telling us this didn't help. Reply below if there's more we can do."}
      </p>
    )
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/50 px-5 py-4">
      <p className="text-[15px] font-medium text-foreground">Was this helpful?</p>
      <div className="flex gap-2" role="group" aria-label="Rate the help you got">
        {[
          { value: true, label: "Yes", icon: ThumbsUp },
          { value: false, label: "No", icon: ThumbsDown },
        ].map((option) => (
          <Button
            key={option.label}
            variant="outline"
            className={cn("h-10 rounded-xl bg-card", current === option.value && "border-foreground")}
            aria-pressed={current === option.value}
            disabled={pending}
            onClick={() => rate(option.value)}
          >
            <option.icon className="size-4" />
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
