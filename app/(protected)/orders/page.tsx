import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ChevronLeft, ChevronRight, ChevronRight as Arrow, PackageOpen } from "lucide-react"
import { auth } from "@/auth"
import { LineThumb } from "@/components/cart/cart-drawer"
import { OrderStatusBadge } from "@/components/orders/status-badge"
import { Button } from "@/components/ui/button"
import { ORDER_STATUSES, getOrders, type OrderStatus } from "@/lib/backend-commerce"
import { formatDate, formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "My orders · AURA" }

const TAB_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Preparing",
  SHIPPED: "On the way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
}

function href(status: OrderStatus | undefined, page = 1): string {
  const params = new URLSearchParams()
  if (status) params.set("status", status)
  if (page > 1) params.set("page", String(page))
  const qs = params.toString()
  return qs ? `/orders?${qs}` : "/orders"
}

export default async function OrdersPage({ searchParams }: PageProps<"/orders">) {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")

  const params = await searchParams
  const rawStatus = typeof params.status === "string" ? params.status : undefined
  const status = ORDER_STATUSES.find((s) => s === rawStatus)
  const page = Math.max(1, Number(params.page) || 1)
  const data = await getOrders(session.accessToken, { page, status, limit: 10 })
  const total = data.statusCounts.reduce((sum, c) => sum + c.count, 0)
  const tabs = [
    { key: undefined, label: "All", count: total },
    ...data.statusCounts
      .filter((c) => c.count > 0)
      .map((c) => ({ key: c.status, label: TAB_LABELS[c.status], count: c.count })),
  ]

  return (
    <main className="page-container space-y-8 py-8 lg:py-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">My orders</h1>
        <p className="text-base text-muted-foreground">Track deliveries, review past purchases and manage orders.</p>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-border/70 bg-card px-6 py-20 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-muted">
            <PackageOpen className="size-8 text-muted-foreground" />
          </span>
          <div className="space-y-1.5">
            <p className="text-lg font-semibold text-foreground">No orders yet</p>
            <p className="text-[15px] text-muted-foreground">When you place an order, you can follow it here.</p>
          </div>
          <Button asChild className="h-12 rounded-full px-7 font-semibold">
            <Link href="/products">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <>
          <nav aria-label="Filter orders" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {tabs.map((tab) => {
              const active = tab.key === status
              return (
                <Link
                  key={tab.label}
                  href={href(tab.key)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground hover:border-foreground/40"
                  )}
                >
                  {tab.label}
                  <span className={cn("tabular-nums", active ? "text-background/70" : "text-muted-foreground")}>
                    {tab.count}
                  </span>
                </Link>
              )
            })}
          </nav>

          <ul className="space-y-4">
            {data.items.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="group flex flex-col gap-5 rounded-3xl border border-border/70 bg-card p-5 transition-[border-color,box-shadow] duration-150 hover:border-foreground/30 hover:shadow-sm sm:flex-row sm:items-center sm:p-6"
                >
                  <div className="flex -space-x-3">
                    {order.items.slice(0, 3).map((item) => (
                      <span key={item.id} className="rounded-xl ring-2 ring-card">
                        <LineThumb url={item.product.imageUrl} size={56} />
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="flex size-14 items-center justify-center rounded-xl bg-muted text-sm font-semibold text-muted-foreground ring-2 ring-card">
                        +{order.items.length - 3}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="flex flex-wrap items-center gap-3">
                      <span className="font-semibold text-foreground">Order #{order.id}</span>
                      <OrderStatusBadge status={order.status} />
                    </p>
                    <p className="truncate text-[15px] text-muted-foreground">
                      {order.items.map((item) => item.product.name).join(", ")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)} · {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <span className="text-lg font-semibold text-foreground tabular-nums">
                      {formatPrice(order.totalAmount)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-foreground">
                      View details
                      <Arrow className="size-4" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {data.meta.totalPages > 1 && (
            <nav aria-label="Pagination" className="flex items-center justify-center gap-3">
              <Button asChild={page > 1} variant="outline" className="h-10 rounded-xl" disabled={page <= 1}>
                {page > 1 ? (
                  <Link href={href(status, page - 1)}>
                    <ChevronLeft className="size-4" /> Newer
                  </Link>
                ) : (
                  <span>
                    <ChevronLeft className="size-4" /> Newer
                  </span>
                )}
              </Button>
              <span className="text-sm text-muted-foreground tabular-nums">
                Page {page} of {data.meta.totalPages}
              </span>
              <Button
                asChild={page < data.meta.totalPages}
                variant="outline"
                className="h-10 rounded-xl"
                disabled={page >= data.meta.totalPages}
              >
                {page < data.meta.totalPages ? (
                  <Link href={href(status, page + 1)}>
                    Older <ChevronRight className="size-4" />
                  </Link>
                ) : (
                  <span>
                    Older <ChevronRight className="size-4" />
                  </span>
                )}
              </Button>
            </nav>
          )}
        </>
      )}
    </main>
  )
}
