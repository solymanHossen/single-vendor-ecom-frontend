"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CircleAlert, Loader2, SendHorizontal } from "lucide-react"
import { toast } from "sonner"
import { createTicketAction } from "@/actions/ticket.actions"
import { AttachButton, AttachmentTray, useAttachments } from "@/components/support/attachment-picker"
import { INPUT_CLASS } from "@/components/admin/products/form-primitives"
import { Button } from "@/components/ui/button"
import type { TicketCategory } from "@/lib/backend-tickets"
import { ORDER_CATEGORIES, TICKET_CATEGORY_META } from "@/lib/ticket-meta"
import { supportTicketHref } from "@/lib/routes"
import { cn } from "@/lib/utils"

export interface OrderOption {
  id: number
  label: string
}

type Errors = Partial<Record<"category" | "subject" | "message", string>>

const CATEGORIES = Object.keys(TICKET_CATEGORY_META) as TicketCategory[]

/** Suggested subjects make the ask one tap for the common cases. */
const SUGGESTIONS: Partial<Record<TicketCategory, string[]>> = {
  ORDER: ["Change or cancel my order", "Question about my order"],
  DELIVERY: ["My order hasn't arrived", "Delivery address change"],
  PAYMENT: ["I was charged twice", "Refund status"],
  RETURN: ["Return an item", "Exchange for another size"],
  PRODUCT: ["Item arrived damaged", "Question about a product"],
  ACCOUNT: ["Can't sign in", "Update my email"],
}

export function NewTicketForm({
  orders,
  initialOrderId,
  initialCategory,
}: {
  orders: OrderOption[]
  initialOrderId: number | null
  initialCategory: TicketCategory | null
}) {
  const router = useRouter()
  const [category, setCategory] = React.useState<TicketCategory | null>(
    initialCategory ?? (initialOrderId ? "ORDER" : null)
  )
  const [orderId, setOrderId] = React.useState<string>(initialOrderId ? String(initialOrderId) : "")
  const [subject, setSubject] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [errors, setErrors] = React.useState<Errors>({})
  const [sending, startSend] = React.useTransition()
  const attachments = useAttachments()
  const showOrder = category !== null && ORDER_CATEGORIES.includes(category) && orders.length > 0

  const submit = () => {
    const found: Errors = {}
    if (!category) found.category = "Choose what it's about."
    if (subject.trim().length < 3) found.subject = "Add a short subject (3+ characters)."
    if (message.trim().length < 10) found.message = "Tell us a little more (10+ characters)."
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first || !category) {
      document.getElementById(`ticket-${first}`)?.focus()
      return
    }
    if (attachments.uploading) {
      toast.info("Photos are still uploading", { description: "Give it a second, then send." })
      return
    }
    startSend(async () => {
      const result = await createTicketAction({
        category,
        subject: subject.trim(),
        message: message.trim(),
        orderId: showOrder && orderId ? Number(orderId) : undefined,
        attachments: attachments.urls,
      })
      if ("error" in result) {
        toast.error("Couldn't send your request", { description: result.error })
        return
      }
      toast.success("Request sent", {
        description: `Request #${result.ticket.id} — we'll reply here and by email.`,
      })
      router.push(supportTicketHref(result.ticket.id))
    })
  }

  const fieldError = (key: keyof Errors) =>
    errors[key] && (
      <p id={`ticket-${key}-error`} className="flex items-center gap-1.5 text-sm text-destructive">
        <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
        {errors[key]}
      </p>
    )

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className="space-y-8"
    >
      <fieldset className="space-y-3">
        <legend className="mb-3 text-base font-semibold text-foreground">What do you need help with?</legend>
        <div
          id="ticket-category"
          tabIndex={-1}
          role="radiogroup"
          aria-label="Topic"
          className="grid gap-3 outline-none sm:grid-cols-2 xl:grid-cols-3"
        >
          {CATEGORIES.map((key) => {
            const meta = TICKET_CATEGORY_META[key]
            const active = category === key
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  setCategory(key)
                  setErrors((prev) => ({ ...prev, category: undefined }))
                }}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 text-left transition-[border-color,box-shadow]",
                  active ? "border-foreground ring-4 ring-foreground/8" : "border-border/70 bg-card hover:border-foreground/40"
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    active ? "bg-foreground text-background" : "bg-muted text-foreground"
                  )}
                >
                  <meta.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 space-y-0.5">
                  <span className="block font-medium text-foreground">{meta.label}</span>
                  <span className="block text-sm text-muted-foreground">{meta.hint}</span>
                </span>
              </button>
            )
          })}
        </div>
        {fieldError("category")}
      </fieldset>

      {showOrder && (
        <div className="space-y-2">
          <label htmlFor="ticket-order" className="text-sm font-medium text-foreground">
            Which order? <span className="font-normal text-muted-foreground">Optional — it helps us answer faster</span>
          </label>
          <select
            id="ticket-order"
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            className={cn(INPUT_CLASS, "appearance-auto")}
          >
            <option value="">Not about a specific order</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="ticket-subject" className="text-sm font-medium text-foreground">
          Subject
        </label>
        <input
          id="ticket-subject"
          value={subject}
          onChange={(event) => {
            setSubject(event.target.value)
            setErrors((prev) => ({ ...prev, subject: undefined }))
          }}
          maxLength={200}
          placeholder="A few words, e.g. “Item arrived damaged”"
          aria-invalid={!!errors.subject || undefined}
          aria-describedby={errors.subject ? "ticket-subject-error" : undefined}
          className={INPUT_CLASS}
        />
        {category && SUGGESTIONS[category] && !subject && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS[category]?.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setSubject(suggestion)}
                className="inline-flex h-8 items-center rounded-lg border border-border/70 bg-background px-3 text-sm text-foreground transition-colors hover:border-foreground/40"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        {fieldError("subject")}
      </div>

      <div className="space-y-2">
        <label htmlFor="ticket-message" className="text-sm font-medium text-foreground">
          Tell us what happened
        </label>
        <div className="rounded-2xl border border-input bg-background p-2 shadow-xs focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/15 has-aria-invalid:border-destructive">
          <textarea
            id="ticket-message"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value)
              setErrors((prev) => ({ ...prev, message: undefined }))
            }}
            onPaste={attachments.onPaste}
            rows={6}
            maxLength={5000}
            placeholder="Include anything that helps — what you expected, what happened, and when."
            aria-invalid={!!errors.message || undefined}
            aria-describedby={errors.message ? "ticket-message-error" : "ticket-message-hint"}
            className="field-sizing-content min-h-36 w-full resize-none bg-transparent px-2 py-1.5 text-[15px] outline-none placeholder:text-muted-foreground"
          />
          <div className="px-2 pb-1">
            <AttachmentTray attachments={attachments} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <AttachButton attachments={attachments} />
            <span className="px-2 text-xs text-muted-foreground tabular-nums">{message.length}/5000</span>
          </div>
        </div>
        {errors.message ? (
          fieldError("message")
        ) : (
          <p id="ticket-message-hint" className="text-sm text-muted-foreground">
            A photo helps with damaged or wrong items — up to 4, or paste a screenshot.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-6">
        <Button type="submit" className="h-11 rounded-xl px-6 text-[15px] font-semibold" disabled={sending}>
          {sending ? <Loader2 className="size-4 animate-spin" /> : <SendHorizontal className="size-4" />}
          Send request
        </Button>
        <p className="text-sm text-muted-foreground">We’ll reply here and send you an email.</p>
      </div>
    </form>
  )
}
