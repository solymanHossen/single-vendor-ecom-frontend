"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, SendHorizontal } from "lucide-react"
import { toast } from "sonner"
import { replyToTicketAction } from "@/actions/ticket.actions"
import { AttachButton, AttachmentTray, useAttachments } from "@/components/support/attachment-picker"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import type { TicketStatus } from "@/lib/backend-tickets"

const MAX = 5000

export function CustomerComposer({ ticketId, status }: { ticketId: number; status: TicketStatus }) {
  const router = useRouter()
  const [message, setMessage] = React.useState("")
  const [sending, startSend] = React.useTransition()
  const attachments = useAttachments()
  const text = message.trim()
  const canSend = text.length > 0 && text.length <= MAX && !attachments.uploading && !sending

  const send = () => {
    if (!canSend) return
    startSend(async () => {
      const result = await replyToTicketAction(ticketId, { message: text, attachments: attachments.urls })
      if ("error" in result) {
        toast.error("Couldn't send", { description: result.error })
        return
      }
      setMessage("")
      attachments.clear()
      toast.success("Message sent", {
        description: status === "RESOLVED" ? "We've reopened your request." : "We'll reply here and by email.",
      })
      router.refresh()
    })
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
      className="rounded-3xl border border-border/70 bg-card p-3 shadow-xs focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/15"
    >
      <label htmlFor="reply" className="sr-only">
        Your message
      </label>
      <textarea
        id="reply"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onPaste={attachments.onPaste}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault()
            send()
          }
        }}
        rows={3}
        maxLength={MAX + 100}
        placeholder={status === "RESOLVED" ? "Still need help? Reply to reopen this request…" : "Write a reply…"}
        className="field-sizing-content max-h-72 min-h-20 w-full resize-none bg-transparent px-2 py-1.5 text-[15px] outline-none placeholder:text-muted-foreground"
      />
      <div className="px-2">
        <AttachmentTray attachments={attachments} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <AttachButton attachments={attachments} />
        <div className="flex items-center gap-3">
          {text.length > MAX - 300 && (
            <span className={text.length > MAX ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
              {text.length}/{MAX}
            </span>
          )}
          <Button type="submit" className="h-10 rounded-xl px-4 font-semibold" disabled={!canSend}>
            {sending ? <Loader2 className="size-4 animate-spin" /> : <SendHorizontal className="size-4" />}
            Send
            <Kbd className="ml-1 hidden bg-primary-foreground/15 text-primary-foreground lg:inline-flex">⌘↵</Kbd>
          </Button>
        </div>
      </div>
    </form>
  )
}
