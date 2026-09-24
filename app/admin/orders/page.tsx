import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ChevronLeft, ChevronRight, CircleAlert, PackageSearch } from "lucide-react"
import { auth } from "@/auth"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { OrderSearch } from "@/components/admin/orders/order-search"
import { LineThumb } from "@/components/cart/cart-drawer"
import { PAYMENT_LABELS } from "@/components/orders/order-details"
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/status-badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ORDER_STATUSES, getOrders, type OrderPage, type OrderStatus } from "@/lib/backend-commerce"
import { formatDate, formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Orders · AURA Admin" }

const PAGE_SIZE = 20

const TABS: Array<{ key: OrderStatus | undefined; label: string }> = [
  { key: undefined, label: "All orders" },
  { key: "PENDING", label: "Pending" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "RETURNED", label: "Returned" },
]

function href(params: { status?: OrderStatus; q?: string; page?: number }): string {
  const search = new URLSearchParams()
  if (params.status) search.set("status", params.status)
  if (params.q) search.set("q", params.q)
  if (params.page && params.page > 1) search.set("page", String(params.page))
  const qs = search.toString()
  return qs ? `/admin/orders?${qs}` : "/admin/orders"
}

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")

  const params = await searchParams
  const status = ORDER_STATUSES.find((s) => s === params.status)
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 150) : ""
  const page = Math.max(1, Number(params.page) || 1)

  let data: OrderPage | null = null
  try {
    data = await getOrders(session.accessToken, { page, status, search: q || undefined, limit: PAGE_SIZE })
  } catch (error: unknown) {
    console.error("[admin] orders unavailable:", error)
  }

  const counts = new Map(data?.statusCounts.map((c) => [c.status, c.count]) ?? [])
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0)

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Every order from checkout to doorstep. Move orders along, handle cancellations and follow up with customers."
      />

      {!data ? (
        <div role="alert" className="flex items-center gap-3 rounded-3xl bg-destructive/8 px-6 py-5 text-[15px] text-destructive">
          <CircleAlert className="size-5 shrink-0" />
          Orders are temporarily unavailable. Refresh in a moment.
        </div>
      ) : (
        <div className="space-y-6">
          <nav aria-label="Filter by status" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {TABS.map((tab) => {
              const active = tab.key === status
              const count = tab.key ? (counts.get(tab.key) ?? 0) : total
              const attention = tab.key === "PENDING" && count > 0
              return (
                <Link
                  key={tab.label}
                  href={href({ status: tab.key, q })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-11 shrink-0 items-center gap-2.5 rounded-xl border px-4 text-[15px] font-medium transition-colors",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border/70 bg-card text-foreground hover:border-foreground/40"
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                      active
                        ? "bg-background/15 text-background"
                        : attention
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
            <div className="flex items-center gap-3 border-b border-border/70 px-6 py-4">
              <OrderSearch initial={q} />
            </div>

            {data.items.length === 0 ? (
              <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                  <PackageSearch className="size-7 text-muted-foreground" />
                </span>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-foreground">No orders found</p>
                  <p className="text-[15px] text-muted-foreground">
                    {q || status ? "Try another search or status." : "Orders appear here as soon as customers check out."}
                  </p>
                </div>
                {(q || status) && (
                  <Button asChild variant="outline" className="h-10 rounded-xl">
                    <Link href="/admin/orders">Clear filters</Link>
                  </Button>
                )}
              </div>
            ) : (
              <Table className="text-[15px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent [&>th]:h-12 [&>th]:text-[13px] [&>th]:font-medium [&>th]:text-muted-foreground">
                    <TableHead className="pl-6">Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((order) => {
                    const detail = `/admin/orders/${order.id}`
                    const provider = PAYMENT_LABELS[order.payment?.provider ?? "COD"]
                    return (
                      <TableRow key={order.id} className="group relative [&>td]:py-4">
                        <TableCell className="pl-6">
                          {/* Whole row is the link target; the anchor stretches over it. */}
                          <Link href={detail} className="font-semibold text-foreground after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4">
                            #{order.id}
                          </Link>
                          <span className="block text-sm text-muted-foreground">
                            {formatDate(order.createdAt, true)}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-56">
                          <span className="block truncate font-medium text-foreground">
                            {order.shippingAddress.recipientName ?? order.customer?.name ?? "Guest"}
                          </span>
                          <span className="block truncate text-sm text-muted-foreground">
                            {order.customer?.email ?? order.shippingAddress.phone}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-3">
                            <span className="flex -space-x-2.5">
                              {order.items.slice(0, 3).map((item) => (
                                <span key={item.id} className="rounded-lg ring-2 ring-card">
                                  <LineThumb url={item.product.imageUrl} size={36} />
                                </span>
                              ))}
                            </span>
                            <span className="text-sm text-muted-foreground tabular-nums">
                              {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {formatPrice(order.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <span className="flex flex-col items-start gap-1">
                            <PaymentStatusBadge status={order.paymentStatus} />
                            <span className="text-xs text-muted-foreground">{provider.label}</span>
                          </span>
                        </TableCell>
                        <TableCell className="pr-6">
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}

            {data.meta.total > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.meta.total)}
                  </span>{" "}
                  of <span className="font-medium text-foreground tabular-nums">{data.meta.total}</span>
                </p>
                {data.meta.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button asChild={page > 1} variant="outline" size="icon" className="size-9 rounded-lg" disabled={page <= 1}>
                      {page > 1 ? (
                        <Link href={href({ status, q, page: page - 1 })} aria-label="Previous page">
                          <ChevronLeft className="size-4" />
                        </Link>
                      ) : (
                        <span aria-hidden="true">
                          <ChevronLeft className="size-4" />
                        </span>
                      )}
                    </Button>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {page} / {data.meta.totalPages}
                    </span>
                    <Button
                      asChild={page < data.meta.totalPages}
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-lg"
                      disabled={page >= data.meta.totalPages}
                    >
                      {page < data.meta.totalPages ? (
                        <Link href={href({ status, q, page: page + 1 })} aria-label="Next page">
                          <ChevronRight className="size-4" />
                        </Link>
                      ) : (
                        <span aria-hidden="true">
                          <ChevronRight className="size-4" />
                        </span>
                      )}
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
