"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { BellRing, CircleCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { subscribeStockAlertAction } from "@/actions/inventory.actions"

/** "Email me when it's back" — shown when the product (or chosen option) is sold out. */
export function NotifyMe({
  productId,
  variantId,
  optionLabel,
}: {
  productId: number
  variantId: number | null
  optionLabel: string | null
}) {
  const { data: session } = useSession()
  const [email, setEmail] = React.useState("")
  const [done, setDone] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()
  const address = email || session?.user?.email || ""
  const key = `${productId}:${variantId ?? 0}`

  if (done === key) {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-[15px] text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
        <CircleCheck className="size-4 shrink-0" aria-hidden="true" />
        We&apos;ll email you as soon as {optionLabel ? `this option (${optionLabel})` : "it"} is back.
      </p>
    )
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (!/^\S+@\S+\.\S+$/.test(address)) {
          toast.warning("Enter your email", { description: "We'll only use it for this alert." })
          return
        }
        startTransition(async () => {
          const result = await subscribeStockAlertAction(productId, address.trim(), variantId)
          if ("error" in result) {
            toast.error("Couldn't set up the alert", { description: result.error })
            return
          }
          setDone(key)
          toast.success("You're on the list", { description: "We'll email you once, when it's back in stock." })
        })
      }}
      className="space-y-2.5 rounded-2xl border border-border/70 bg-muted/30 p-4"
    >
      <p className="flex items-center gap-2 text-[15px] font-medium text-foreground">
        <BellRing className="size-4" aria-hidden="true" />
        Get an email when it&apos;s back{optionLabel && <span className="font-normal text-muted-foreground">· {optionLabel}</span>}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="notify-email" className="sr-only">
          Email address
        </label>
        <input
          id="notify-email"
          type="email"
          autoComplete="email"
          value={address}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="h-11 min-w-0 flex-1 rounded-full border border-input bg-background px-4 text-[15px] outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-[15px] font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          Notify me
        </button>
      </div>
    </form>
  )
}
