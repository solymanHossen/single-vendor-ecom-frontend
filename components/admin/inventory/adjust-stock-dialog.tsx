"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ClipboardCheck, Loader2, PackageMinus, PackagePlus, PencilLine, SearchX, SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"
import { adjustStockAction } from "@/actions/inventory.actions"
import { INPUT_CLASS } from "@/components/admin/products/form-primitives"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MAX_STOCK, type ManualAdjustment } from "@/lib/backend-inventory"
import { cn } from "@/lib/utils"

const TYPES: Array<{ key: ManualAdjustment; label: string; hint: string; icon: typeof PackagePlus; sign: 1 | -1 | 0 }> = [
  { key: "RECEIVED", label: "Received", hint: "New stock arrived", icon: PackagePlus, sign: 1 },
  { key: "DAMAGED", label: "Damaged", hint: "Can't be sold", icon: PackageMinus, sign: -1 },
  { key: "LOST", label: "Lost", hint: "Missing or stolen", icon: SearchX, sign: -1 },
  { key: "RECOUNT", label: "Recount", hint: "Set the counted total", icon: ClipboardCheck, sign: 0 },
  { key: "CORRECTION", label: "Correction", hint: "Fix a mistake (+ or −)", icon: PencilLine, sign: 0 },
]

export interface AdjustTarget {
  productId: number
  variantId: number | null
  name: string
  variantLabel: string | null
  sku: string
  onHand: number
}

/** Record a stock change with a reason — every change lands in the stock history. */
export function AdjustStockButton({ target, compact = false }: { target: AdjustTarget; compact?: boolean }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [type, setType] = React.useState<ManualAdjustment>("RECEIVED")
  const [quantity, setQuantity] = React.useState("")
  const [note, setNote] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [saving, startSave] = React.useTransition()

  const meta = TYPES.find((item) => item.key === type)!
  const value = Number(quantity)
  const valid = quantity.trim() !== "" && Number.isInteger(value)
  const next = !valid
    ? null
    : type === "RECOUNT"
      ? value
      : type === "CORRECTION"
        ? target.onHand + value
        : target.onHand + meta.sign * value

  const reset = () => {
    setType("RECEIVED")
    setQuantity("")
    setNote("")
    setError(null)
  }

  const submit = () => {
    if (!valid || next === null) return setError("Enter a whole number.")
    if (type !== "RECOUNT" && type !== "CORRECTION" && value <= 0) return setError("Enter how many units (more than 0).")
    if (type === "CORRECTION" && value === 0) return setError("A correction must change the count.")
    if (next < 0) return setError(`Only ${target.onHand} in stock — that would go below zero.`)
    if (next > MAX_STOCK) return setError(`Stock can't go above ${MAX_STOCK.toLocaleString("en-US")}.`)
    startSave(async () => {
      const result = await adjustStockAction({
        productId: target.productId,
        variantId: target.variantId,
        type,
        quantity: value,
        note: note.trim() || undefined,
      })
      if ("error" in result) {
        setError(result.error)
        return
      }
      toast.success("Stock updated", {
        description: `${target.name}${target.variantLabel ? ` · ${target.variantLabel}` : ""}: ${target.onHand} → ${result.unit.onHand}`,
      })
      setOpen(false)
      reset()
      router.refresh()
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size={compact ? "sm" : "default"}
        className={cn("relative z-10 rounded-xl", compact ? "h-9" : "h-10")}
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="size-4" />
        Adjust
      </Button>
      <Dialog open={open} onOpenChange={(value) => { if (!saving) { setOpen(value); if (!value) reset() } }}>
        <DialogContent className="gap-0 rounded-3xl p-0 sm:max-w-lg">
          <DialogHeader className="border-b border-border/70 px-6 pt-6 pb-4 text-left">
            <DialogTitle>Adjust stock</DialogTitle>
            <DialogDescription className="truncate">
              {target.name}
              {target.variantLabel && ` · ${target.variantLabel}`} · <span className="font-mono">{target.sku}</span>
            </DialogDescription>
          </DialogHeader>
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              submit()
            }}
            className="space-y-5 px-6 py-5"
          >
            <div role="radiogroup" aria-label="Reason" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TYPES.map((item) => {
                const active = item.key === type
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setType(item.key)
                      setError(null)
                    }}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition-[border-color,box-shadow]",
                      active ? "border-foreground ring-4 ring-foreground/8" : "border-border/70 hover:border-foreground/40"
                    )}
                  >
                    <item.icon className="size-4 text-foreground" aria-hidden="true" />
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.hint}</span>
                  </button>
                )
              })}
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="space-y-2">
                <label htmlFor="adjust-quantity" className="text-sm font-medium text-foreground">
                  {type === "RECOUNT" ? "Counted total" : type === "CORRECTION" ? "Change (use − to remove)" : "Units"}
                </label>
                <input
                  id="adjust-quantity"
                  autoFocus
                  inputMode="numeric"
                  value={quantity}
                  onChange={(event) => {
                    setQuantity(event.target.value.replace(/[^\d-]/g, ""))
                    setError(null)
                  }}
                  placeholder={type === "RECOUNT" ? String(target.onHand) : type === "CORRECTION" ? "e.g. -3" : "e.g. 20"}
                  aria-invalid={!!error || undefined}
                  className={cn(INPUT_CLASS, "text-lg tabular-nums")}
                />
              </div>
              <p className="flex h-11 items-center gap-2 rounded-xl bg-muted/60 px-4 text-[15px] tabular-nums" aria-live="polite">
                <span className="text-muted-foreground">{target.onHand}</span>
                <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className={cn("font-semibold", next !== null && next < 0 ? "text-destructive" : "text-foreground")}>
                  {next ?? "–"}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="adjust-note" className="text-sm font-medium text-foreground">
                Note <span className="font-normal text-muted-foreground">Optional</span>
              </label>
              <input
                id="adjust-note"
                value={note}
                maxLength={300}
                onChange={(event) => setNote(event.target.value)}
                placeholder={type === "RECEIVED" ? "e.g. Supplier invoice #1042" : "What happened?"}
                className={INPUT_CLASS}
              />
            </div>

            {error && <p className="rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2 border-t border-border/70 pt-4">
              <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" className="h-10 rounded-xl px-5 font-semibold" disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
