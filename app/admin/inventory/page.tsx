import type { Metadata } from "next"
import Link from "next/link"
import { Bell, Boxes, ChevronLeft, ChevronRight, CircleAlert, Download, History, PackageX, TrendingDown, Wallet, type LucideIcon } from "lucide-react"
import { AccessDenied } from "@/components/admin/access-denied"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { UrlSearch } from "@/components/admin/url-search"
import { UrlSelect } from "@/components/admin/url-select"
import { AdjustStockButton } from "@/components/admin/inventory/adjust-stock-dialog"
import { ImportStockButton } from "@/components/admin/inventory/import-dialog"
import { StockLevelBadge } from "@/components/admin/inventory/stock-level-badge"
import { LineThumb } from "@/components/cart/cart-drawer"
import { Button } from "@/components/ui/button"
import { getAdminAccess } from "@/lib/admin-access"
import { INVENTORY_PAGE_SIZE, getInventory, type InventoryPage, type InventorySort, type StockLevel } from "@/lib/backend-inventory"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Inventory · Admin" }

type Tab = StockLevel | "all"
const TABS: Array<{ key: Tab; label: string }> = [
  { key: "all", label: "All" },
  { key: "out", label: "Out of stock" },
  { key: "low", label: "Low" },
  { key: "ok", label: "Healthy" },
]
const SORTS: Array<{ value: InventorySort; label: string }> = [
  { value: "attention", label: "Needs attention" },
  { value: "stock_asc", label: "Least stock" },
  { value: "stock_desc", label: "Most stock" },
  { value: "sold_desc", label: "Best sellers (30 days)" },
  { value: "name", label: "Name" },
]

function StatTile({ icon: Icon, label, value, hint, tone }: { icon: LucideIcon; label: string; value: string; hint: string; tone?: "critical" | "warning" }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={cn("flex size-9 items-center justify-center rounded-xl", tone === "critical" ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300" : tone === "warning" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" : "bg-muted text-foreground")}>
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  )
}

export default async function InventoryPage({ searchParams }: PageProps<"/admin/inventory">) {
  const access = await getAdminAccess()
  if (!access.can("catalog.manage")) return <AccessDenied area="inventory" />

  const params = await searchParams
  const tab: Tab = TABS.some((item) => item.key === params.level) ? (params.level as Tab) : "all"
  const sort: InventorySort = SORTS.some((item) => item.value === params.sort) ? (params.sort as InventorySort) : "attention"
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 150) : ""
  const page = Math.max(1, Number(params.page) || 1)

  const href = (next: { tab?: Tab; page?: number }) => {
    const search = new URLSearchParams()
    const nextTab = next.tab ?? tab
    if (nextTab !== "all") search.set("level", nextTab)
    if (sort !== "attention") search.set("sort", sort)
    if (q) search.set("q", q)
    if (next.page && next.page > 1) search.set("page", String(next.page))
    const qs = search.toString()
    return qs ? `/admin/inventory?${qs}` : "/admin/inventory"
  }

  let data: InventoryPage | null = null
  try {
    data = await getInventory(access.accessToken, { page, level: tab, sort, search: q || undefined })
  } catch (error: unknown) {
    console.error("[admin] inventory unavailable:", error)
  }

  return (
    <>
      <AdminPageHeader
        title="Inventory"
        description="Every product and variant you sell: what's on the shelf, how fast it sells and when to reorder. Every change is recorded in the stock history."
        actions={
          <>
            <Button asChild variant="ghost" className="h-11 rounded-xl">
              <Link href="/admin/inventory/history">
                <History className="size-4" /> History
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-xl">
              <a href="/admin/inventory/export" download>
                <Download className="size-4" /> Export
              </a>
            </Button>
            <ImportStockButton />
          </>
        }
      />

      {!data ? (
        <div role="alert" className="flex items-center gap-3 rounded-3xl bg-destructive/8 px-6 py-5 text-[15px] text-destructive">
          <CircleAlert className="size-5 shrink-0" /> Inventory is temporarily unavailable. Refresh in a moment.
        </div>
      ) : (
        <div className="space-y-6">
          <section aria-label="Stock health" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatTile icon={PackageX} label="Out of stock" value={String(data.summary.out)} hint={`of ${data.summary.skus} products & variants`} tone={data.summary.out > 0 ? "critical" : undefined} />
            <StatTile icon={TrendingDown} label="Running low" value={String(data.summary.low)} hint={`At or below ${data.summary.storeThreshold} units (store default)`} tone={data.summary.low > 0 ? "warning" : undefined} />
            <StatTile icon={Boxes} label="Units on hand" value={data.summary.units.toLocaleString("en-US")} hint={`${data.summary.sold30d.toLocaleString("en-US")} sold in the last 30 days`} />
            <StatTile icon={data.summary.waiting > 0 ? Bell : Wallet} label={data.summary.waiting > 0 ? "Waiting for restock" : "Stock value"} value={data.summary.waiting > 0 ? String(data.summary.waiting) : formatPrice(data.summary.retailValue)} hint={data.summary.waiting > 0 ? "Shoppers asked to be emailed" : "At selling price"} />
          </section>

          <nav aria-label="Filter stock" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {TABS.map((item) => {
              const active = item.key === tab
              const count = item.key === "all" ? data.summary.skus : data.summary[item.key]
              return (
                <Link
                  key={item.key}
                  href={href({ tab: item.key })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-11 shrink-0 items-center gap-2.5 rounded-xl border px-4 text-[15px] font-medium transition-colors",
                    active ? "border-foreground bg-foreground text-background" : "border-border/70 bg-card text-foreground hover:border-foreground/40"
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                      active
                        ? "bg-background/15 text-background"
                        : item.key === "out" && count > 0
                          ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                          : item.key === "low" && count > 0
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </Link>
              )
            })}
          </nav>

          <section className="overflow-hidden rounded-3xl border border-border/70 bg-card">
            <div className="flex flex-wrap gap-3 border-b border-border/70 px-6 py-4">
              <UrlSearch initial={q} placeholder="Search product, variant or SKU…" label="Search inventory" />
              <UrlSelect param="sort" value={sort === "attention" ? undefined : sort} label="Sort" allLabel="Needs attention" options={SORTS.slice(1)} />
            </div>

            {data.items.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
                <Boxes className="size-8 text-muted-foreground" aria-hidden="true" />
                <p className="text-lg font-semibold text-foreground">{tab === "out" ? "Nothing is out of stock" : tab === "low" ? "Nothing is running low" : "No matches"}</p>
                <p className="text-[15px] text-muted-foreground">{tab === "all" ? "Try another search." : "Nice — every item here has healthy stock."}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-[15px]">
                  <thead>
                    <tr className="border-b border-border/70 text-left text-[13px] text-muted-foreground [&>th]:h-12 [&>th]:px-3 [&>th]:font-medium">
                      <th className="pl-6">Item</th>
                      <th>Status</th>
                      <th className="text-right">On hand</th>
                      <th className="text-right">Sold · 30d</th>
                      <th className="text-right">Lasts</th>
                      <th className="text-right">Reorder</th>
                      <th className="pr-6 text-right"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {data.items.map((unit) => (
                      <tr key={`${unit.productId}:${unit.variantId ?? 0}`} className="transition-colors hover:bg-muted/30 [&>td]:px-3 [&>td]:py-3">
                        <td className="max-w-80 pl-6">
                          <div className="flex items-center gap-3">
                            <LineThumb url={unit.imageUrl} size={44} />
                            <div className="min-w-0">
                              <Link href={`/admin/products/${unit.productId}`} className="block truncate font-medium text-foreground hover:underline">
                                {unit.name}
                              </Link>
                              <p className="truncate text-sm text-muted-foreground">
                                {unit.variantLabel && <span className="text-foreground/80">{unit.variantLabel} · </span>}
                                <span className="font-mono text-xs">{unit.sku}</span>
                                {!unit.isPublished && " · draft"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <StockLevelBadge level={unit.level} />
                          {unit.waiting > 0 && (
                            <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <Bell className="size-3" aria-hidden="true" /> {unit.waiting} waiting
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          <span className="font-semibold text-foreground tabular-nums">{unit.onHand.toLocaleString("en-US")}</span>
                          <span className="block text-xs text-muted-foreground">
                            low at {unit.threshold}
                            {unit.customThreshold && " (custom)"}
                          </span>
                        </td>
                        <td className="text-right text-muted-foreground tabular-nums">{unit.sold30d}</td>
                        <td className={cn("text-right tabular-nums", unit.daysOfCover !== null && unit.daysOfCover < 7 ? "font-medium text-amber-700 dark:text-amber-400" : "text-muted-foreground")}>
                          {unit.onHand === 0 ? "—" : unit.daysOfCover === null ? "No recent sales" : `${unit.daysOfCover} days`}
                        </td>
                        <td className="text-right tabular-nums">
                          {unit.reorderSuggestion ? <span className="font-medium text-foreground">+{unit.reorderSuggestion}</span> : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="pr-6">
                          <div className="flex justify-end gap-1">
                            <Button asChild variant="ghost" size="sm" className="h-9 rounded-xl text-muted-foreground">
                              <Link href={`/admin/inventory/history?product=${unit.productId}${unit.variantId ? `&variant=${unit.variantId}` : ""}`} aria-label={`Stock history for ${unit.name}`}>
                                <History className="size-4" />
                              </Link>
                            </Button>
                            <AdjustStockButton compact target={unit} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {data.meta.total > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground tabular-nums">{(page - 1) * INVENTORY_PAGE_SIZE + 1}–{Math.min(page * INVENTORY_PAGE_SIZE, data.meta.total)}</span> of{" "}
                  <span className="font-medium text-foreground tabular-nums">{data.meta.total}</span>
                </p>
                {data.meta.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button asChild={page > 1} variant="outline" size="icon" className="size-9 rounded-lg" disabled={page <= 1} aria-label="Previous page">
                      {page > 1 ? <Link href={href({ page: page - 1 })}><ChevronLeft className="size-4" /></Link> : <ChevronLeft className="size-4" />}
                    </Button>
                    <span className="text-sm text-muted-foreground tabular-nums">{page} / {data.meta.totalPages}</span>
                    <Button asChild={page < data.meta.totalPages} variant="outline" size="icon" className="size-9 rounded-lg" disabled={page >= data.meta.totalPages} aria-label="Next page">
                      {page < data.meta.totalPages ? <Link href={href({ page: page + 1 })}><ChevronRight className="size-4" /></Link> : <ChevronRight className="size-4" />}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  )
}
