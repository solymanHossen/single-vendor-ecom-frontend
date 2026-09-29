import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ChevronLeft, ChevronRight, CircleAlert, History } from "lucide-react"
import { AccessDenied } from "@/components/admin/access-denied"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { UrlSelect } from "@/components/admin/url-select"
import { Button } from "@/components/ui/button"
import { getAdminAccess } from "@/lib/admin-access"
import { getStockMovements, type StockMovementPage, type StockMovementType } from "@/lib/backend-inventory"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Stock history · Admin" }

const TYPES: Array<{ value: StockMovementType; label: string }> = [
  { value: "SALE", label: "Sold" },
  { value: "RECEIVED", label: "Received" },
  { value: "ORDER_CANCELLED", label: "Order cancelled" },
  { value: "RETURN_RESTOCKED", label: "Returned to stock" },
  { value: "RETURN_WRITTEN_OFF", label: "Return written off" },
  { value: "DAMAGED", label: "Damaged" },
  { value: "LOST", label: "Lost or stolen" },
  { value: "CORRECTION", label: "Correction" },
  { value: "RECOUNT", label: "Recount" },
  { value: "IMPORT", label: "CSV import" },
  { value: "INITIAL", label: "Opening balance" },
]

export default async function StockHistoryPage({ searchParams }: PageProps<"/admin/inventory/history">) {
  const access = await getAdminAccess()
  if (!access.can("catalog.manage")) return <AccessDenied area="inventory" />

  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const type = TYPES.find((item) => item.value === params.type)?.value
  const productId = Number(params.product) > 0 ? Number(params.product) : undefined
  const variantId = productId && Number(params.variant) > 0 ? Number(params.variant) : undefined

  const href = (nextPage: number) => {
    const search = new URLSearchParams()
    if (type) search.set("type", type)
    if (productId) search.set("product", String(productId))
    if (variantId) search.set("variant", String(variantId))
    if (nextPage > 1) search.set("page", String(nextPage))
    const qs = search.toString()
    return qs ? `/admin/inventory/history?${qs}` : "/admin/inventory/history"
  }

  let data: StockMovementPage | null = null
  try {
    data = await getStockMovements(access.accessToken, { page, type, productId, variantId })
  } catch (error: unknown) {
    console.error("[admin] stock history unavailable:", error)
  }
  const scoped = productId && data?.items[0]
  const scopedName = scoped ? `${data!.items[0]!.productName}${variantId && data!.items[0]!.variantLabel ? ` · ${data!.items[0]!.variantLabel}` : ""}` : null

  return (
    <>
      <Link href="/admin/inventory" className="mb-4 inline-flex items-center gap-2 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" /> Inventory
      </Link>
      <AdminPageHeader
        title="Stock history"
        description={scopedName ? `Every change to ${scopedName}.` : "Every stock change — sales, cancellations, returns and adjustments — with who made it and the new balance."}
      />

      {!data ? (
        <div role="alert" className="flex items-center gap-3 rounded-3xl bg-destructive/8 px-6 py-5 text-[15px] text-destructive">
          <CircleAlert className="size-5 shrink-0" /> Stock history is temporarily unavailable.
        </div>
      ) : (
        <section className="overflow-hidden rounded-3xl border border-border/70 bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-6 py-4">
            <UrlSelect param="type" value={type} label="Change type" allLabel="All changes" options={TYPES} />
            {productId && (
              <Link href={type ? `/admin/inventory/history?type=${type}` : "/admin/inventory/history"} className="text-sm font-medium text-foreground hover:underline">
                Show all products
              </Link>
            )}
          </div>
          {data.items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
              <History className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="font-medium text-foreground">No stock changes here yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/70">
              {data.items.map((move) => (
                <li key={move.id} className="flex flex-wrap items-center gap-4 px-6 py-3.5">
                  <span
                    className={cn(
                      "flex h-9 min-w-14 items-center justify-center rounded-xl px-2 text-sm font-semibold tabular-nums",
                      move.quantity > 0
                        ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : move.quantity < 0
                          ? "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {move.quantity > 0 ? `+${move.quantity}` : move.quantity === 0 ? "±0" : move.quantity}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-foreground">
                      <span className="font-medium">{move.label}</span>
                      {!productId && (
                        <>
                          {" · "}
                          <Link href={`/admin/inventory/history?product=${move.productId}${move.variantId ? `&variant=${move.variantId}` : ""}`} className="hover:underline">
                            {move.productName}
                            {move.variantLabel && ` · ${move.variantLabel}`}
                          </Link>
                        </>
                      )}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {formatDate(move.createdAt, true)}
                      {move.actor && ` · ${move.actor.name ?? move.actor.email}`}
                      {move.orderId && (
                        <>
                          {" · "}
                          <Link href={`/admin/orders/${move.orderId}`} className="hover:underline">order #{move.orderId}</Link>
                        </>
                      )}
                      {move.note && ` · ${move.note}`}
                    </p>
                  </div>
                  <span className="text-right text-sm text-muted-foreground tabular-nums">
                    balance <span className="font-semibold text-foreground">{move.balanceAfter.toLocaleString("en-US")}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 border-t border-border/70 px-6 py-4">
              <Button asChild={page > 1} variant="outline" size="icon" className="size-9 rounded-lg" disabled={page <= 1} aria-label="Newer">
                {page > 1 ? <Link href={href(page - 1)}><ChevronLeft className="size-4" /></Link> : <ChevronLeft className="size-4" />}
              </Button>
              <span className="text-sm text-muted-foreground tabular-nums">{page} / {data.meta.totalPages}</span>
              <Button asChild={page < data.meta.totalPages} variant="outline" size="icon" className="size-9 rounded-lg" disabled={page >= data.meta.totalPages} aria-label="Older">
                {page < data.meta.totalPages ? <Link href={href(page + 1)}><ChevronRight className="size-4" /></Link> : <ChevronRight className="size-4" />}
              </Button>
            </div>
          )}
        </section>
      )}
    </>
  )
}
