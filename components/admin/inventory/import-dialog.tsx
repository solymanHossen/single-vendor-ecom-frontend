"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { FileSpreadsheet, Loader2, Upload } from "lucide-react"
import { toast } from "sonner"
import { importStockAction } from "@/actions/inventory.actions"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { ImportResult } from "@/lib/backend-inventory"
import { cn } from "@/lib/utils"

const MAX_BYTES = 450_000

/** Upload or paste a CSV (sku, on_hand) → preview every row → apply. */
export function ImportStockButton() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [csv, setCsv] = React.useState("")
  const [preview, setPreview] = React.useState<ImportResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()
  const file = React.useRef<HTMLInputElement>(null)

  const reset = () => {
    setCsv("")
    setPreview(null)
    setError(null)
  }

  const run = (dryRun: boolean) =>
    startTransition(async () => {
      setError(null)
      const result = await importStockAction(csv, dryRun)
      if ("error" in result) {
        setError(result.error)
        return
      }
      if (dryRun) {
        setPreview(result.result)
        return
      }
      toast.success("Stock imported", {
        description: `${result.result.changed} ${result.result.changed === 1 ? "count" : "counts"} updated. Every change is in the stock history.`,
      })
      setOpen(false)
      reset()
      router.refresh()
    })

  const load = async (picked: File) => {
    if (picked.size > MAX_BYTES) {
      setError("That file is too large — import at most 2,000 rows at a time.")
      return
    }
    setCsv(await picked.text())
    setPreview(null)
  }

  return (
    <>
      <Button variant="outline" className="h-11 rounded-xl" onClick={() => setOpen(true)}>
        <Upload className="size-4" />
        Import
      </Button>
      <Dialog open={open} onOpenChange={(value) => { if (!pending) { setOpen(value); if (!value) reset() } }}>
        <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl">
          <DialogHeader className="border-b border-border/70 px-6 pt-6 pb-4 text-left">
            <DialogTitle>Import stock counts</DialogTitle>
            <DialogDescription>
              A CSV with <code className="rounded bg-muted px-1">sku</code> and <code className="rounded bg-muted px-1">on_hand</code> columns sets each
              count. Tip: export first, edit the on_hand column, then import it back.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <input
              ref={file}
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={(event) => {
                const picked = event.target.files?.[0]
                if (picked) void load(picked)
                event.target.value = ""
              }}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={() => file.current?.click()}>
                <FileSpreadsheet className="size-4" />
                Choose CSV file
              </Button>
              {csv && <span className="self-center text-sm text-muted-foreground">{csv.split(/\r?\n/).filter(Boolean).length - 1} rows loaded</span>}
            </div>
            <textarea
              value={csv}
              onChange={(event) => {
                setCsv(event.target.value)
                setPreview(null)
              }}
              rows={6}
              spellCheck={false}
              placeholder={"sku,on_hand\nELC-PHN-001-BLK-128,24\nFSH-TSH-014,60"}
              aria-label="CSV contents"
              className="w-full rounded-2xl border border-input bg-background px-3.5 py-3 font-mono text-sm outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
            />

            {error && <p className="rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive">{error}</p>}

            {preview && (
              <div className="space-y-3">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{preview.changed}</span> will change ·{" "}
                  <span className="text-muted-foreground">{preview.unchanged} unchanged</span>
                  {preview.errors > 0 && (
                    <>
                      {" "}· <span className="font-semibold text-destructive">{preview.errors} to fix</span>
                    </>
                  )}
                </p>
                <div className="max-h-72 overflow-y-auto rounded-2xl border border-border/70">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted/80 text-xs text-muted-foreground backdrop-blur">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Line</th>
                        <th className="px-3 py-2 text-left font-medium">SKU</th>
                        <th className="px-3 py-2 text-left font-medium">Product</th>
                        <th className="px-3 py-2 text-right font-medium">Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {preview.rows.map((row) => (
                        <tr key={row.line} className={cn(row.error && "bg-destructive/5")}>
                          <td className="px-3 py-2 text-muted-foreground tabular-nums">{row.line}</td>
                          <td className="px-3 py-2 font-mono text-xs">{row.sku || "—"}</td>
                          <td className="px-3 py-2">
                            <span className="line-clamp-1">{row.name ?? "—"}</span>
                            {row.error && <span className="block text-xs text-destructive">{row.error}</span>}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {row.error ? "—" : row.current === row.next ? <span className="text-muted-foreground">{row.next}</span> : `${row.current} → ${row.next}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-border/70 px-6 py-4">
            <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            {preview && preview.errors === 0 && preview.changed > 0 ? (
              <Button className="h-10 rounded-xl px-5 font-semibold" disabled={pending} onClick={() => run(false)}>
                {pending && <Loader2 className="size-4 animate-spin" />}
                Apply {preview.changed} {preview.changed === 1 ? "change" : "changes"}
              </Button>
            ) : (
              <Button className="h-10 rounded-xl px-5" disabled={pending || !csv.trim()} onClick={() => run(true)}>
                {pending && <Loader2 className="size-4 animate-spin" />}
                Preview
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
