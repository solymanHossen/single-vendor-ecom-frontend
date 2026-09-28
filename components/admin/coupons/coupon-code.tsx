"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

/** Monospace code chip that copies itself. */
export function CouponCode({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = React.useState(false)

  const copy = async (event: React.MouseEvent) => {
    // Rows are fully clickable links; the chip must not navigate.
    event.preventDefault()
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success("Code copied", { id: "coupon-copied", description: code })
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Couldn't copy", { description: "Select the code and copy it instead." })
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy coupon code ${code}`}
      className={cn(
        "relative z-10 inline-flex items-center gap-2 rounded-lg border border-dashed border-foreground/25 bg-muted/50 px-2.5 py-1 font-mono text-sm font-semibold tracking-wide text-foreground transition-colors hover:border-foreground/50 hover:bg-muted",
        className
      )}
    >
      {code}
      {copied ? (
        <Check className="size-3.5 text-emerald-600" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5 text-muted-foreground" aria-hidden="true" />
      )}
    </button>
  )
}
