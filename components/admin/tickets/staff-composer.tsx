"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, CircleCheck, Loader2, MessageSquareQuote, SendHorizontal, StickyNote } from "lucide-react"
import { toast } from "sonner"
import { staffReplyAction } from "@/actions/admin-ticket.actions"
import { AttachButton, AttachmentTray, useAttachments } from "@/components/support/attachment-picker"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Kbd } from "@/components/ui/kbd"
import type { StaffReplyInput } from "@/lib/backend-tickets"
import { cn } from "@/lib/utils"

const MAX = 5000

/** Starting points for common answers — {name} becomes the customer's first name. */
const QUICK_REPLIES: ReadonlyArray<{ label: string; text: string }> = [
  {
    label: "Looking into it",
    text: "Hi {name},\n\nThanks for reaching out — I'm looking into this now and will update you shortly.",
  },
  {
    label: "Need order number",
    text: "Hi {name},\n\nCould you share your order number (for example #1234) so I can check this for you?",
  },
  {
    label: "Need a photo",
    text: "Hi {name},\n\nSorry about this! Could you attach a photo of the item and its packaging? That helps us sort it out quickly.",
  },
  {
    label: "Order on its way",
    text: "Hi {name},\n\nYour order is with our delivery partner and on its way. You can follow it from your account under Orders.",
  },
  {
    label: "Refund started",
    text: "Hi {name},\n\nI've started your refund. It usually reaches your account within 5–7 working days.",
  },
  {
    label: "Anything else?",
    text: "Hi {name},\n\nI'm glad that's sorted! Is there anything else I can help with?",
  },
]

export function StaffComposer({
  ticketId,
  customerFirstName,
  canResolve,
}: {
  ticketId: number
  customerFirstName: string
  canResolve: boolean
}) {
  const router = useRouter()
  const [mode, setMode] = React.useState<"reply" | "note">("reply")
  const [message, setMessage] = React.useState("")
  const [sending, startSend] = React.useTransition()
  const attachments = useAttachments()
  const textarea = React.useRef<HTMLTextAreaElement>(null)
  const text = message.trim()
  const ready = text.length > 0 && text.length <= MAX && !attachments.uploading && !sending
  const isNote = mode === "note"

  const send = (status?: StaffReplyInput["status"]) => {
    if (!ready) return
    startSend(async () => {
      const result = await staffReplyAction(ticketId, {
        message: text,
        attachments: attachments.urls,
        internal: isNote,
        status: isNote ? undefined : status,
      })
      if ("error" in result) {
        toast.error(isNote ? "Couldn't add note" : "Couldn't send reply", { description: result.error })
        return
      }
      setMessage("")
      attachments.clear()
      toast.success(isNote ? "Note added" : status === "RESOLVED" ? "Reply sent · resolved" : "Reply sent", {
        description: isNote
          ? "Only staff can see it."
          : status === "RESOLVED"
            ? "The customer was emailed. It closes automatically in 7 days."
            : "The customer was emailed and can reply from their account.",
      })
      router.refresh()
    })
  }

  const insert = (template: string) => {
    const filled = template.replaceAll("{name}", customerFirstName)
    setMessage((current) => (current.trim() ? `${current.trimEnd()}\n\n${filled}` : filled))
    requestAnimationFrame(() => textarea.current?.focus())
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
      className={cn(
        "rounded-3xl border bg-card shadow-xs transition-colors focus-within:ring-4",
        isNote
          ? "border-amber-300 bg-amber-50/40 focus-within:ring-amber-200/60 dark:border-amber-900/70 dark:bg-amber-950/20 dark:focus-within:ring-amber-900/40"
          : "border-border/70 focus-within:border-ring focus-within:ring-ring/15"
      )}
    >
      <div className="flex items-center gap-1 border-b border-border/60 px-3 pt-2" role="tablist" aria-label="Message type">
        {(
          [
            { key: "reply", label: "Reply to customer", icon: SendHorizontal },
            { key: "note", label: "Internal note", icon: StickyNote },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={mode === tab.key}
            onClick={() => setMode(tab.key)}
            className={cn(
              "-mb-px inline-flex h-10 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors",
              mode === tab.key
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="size-4" aria-hidden="true" />
            {tab.label}
          </button>
        ))}
        {!isNote && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" className="ml-auto h-8 rounded-lg text-sm text-muted-foreground">
                <MessageSquareQuote className="size-4" />
                Quick replies
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 rounded-xl p-1.5">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Insert a starting point</DropdownMenuLabel>
              {QUICK_REPLIES.map((reply) => (
                <DropdownMenuItem key={reply.label} className="h-9 rounded-lg" onSelect={() => insert(reply.text)}>
                  {reply.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="p-3">
        <label htmlFor="staff-message" className="sr-only">
          {isNote ? "Internal note" : "Reply"}
        </label>
        <textarea
          ref={textarea}
          id="staff-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onPaste={attachments.onPaste}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault()
              send()
            }
          }}
          rows={4}
          maxLength={MAX + 100}
          placeholder={isNote ? "Only your team sees notes — context, next steps, who to ask…" : `Reply to ${customerFirstName}…`}
          className="field-sizing-content max-h-96 min-h-28 w-full resize-none bg-transparent px-2 py-1.5 text-[15px] outline-none placeholder:text-muted-foreground"
        />
        <div className="px-2">
          <AttachmentTray attachments={attachments} />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <AttachButton attachments={attachments} />
          <div className="flex items-center gap-2">
            {text.length > MAX - 300 && (
              <span className={text.length > MAX ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
                {text.length}/{MAX}
              </span>
            )}
            {isNote ? (
              <Button type="submit" className="h-10 rounded-xl bg-amber-600 px-4 font-semibold text-white hover:bg-amber-700" disabled={!ready}>
                {sending ? <Loader2 className="size-4 animate-spin" /> : <StickyNote className="size-4" />}
                Add note
              </Button>
            ) : (
              <div className="flex">
                <Button type="submit" className="h-10 rounded-l-xl rounded-r-none px-4 font-semibold" disabled={!ready}>
                  {sending ? <Loader2 className="size-4 animate-spin" /> : <SendHorizontal className="size-4" />}
                  Send
                  <Kbd className="ml-1 hidden bg-primary-foreground/15 text-primary-foreground lg:inline-flex">⌘↵</Kbd>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      className="h-10 rounded-l-none rounded-r-xl border-l border-primary-foreground/20 px-2.5"
                      disabled={!ready}
                      aria-label="More send options"
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 rounded-xl p-1.5">
                    {canResolve && (
                      <DropdownMenuItem className="h-auto rounded-lg py-2" onSelect={() => send("RESOLVED")}>
                        <CircleCheck className="size-4" />
                        <span className="flex flex-col">
                          Send and mark resolved
                          <span className="text-xs text-muted-foreground">Closes itself in 7 days if quiet</span>
                        </span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="h-auto rounded-lg py-2" onSelect={() => send("IN_PROGRESS")}>
                      <Loader2 className="size-4" />
                      <span className="flex flex-col">
                        Send and keep in progress
                        <span className="text-xs text-muted-foreground">You still owe them an answer</span>
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
