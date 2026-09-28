import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, CircleCheck, Headset } from "lucide-react"
import { auth } from "@/auth"
import { CancelOrderButton } from "@/components/orders/cancel-order-button"
import {
  DeliveryDetails,
  OrderItemsList,
  OrderTotals,
  Panel,
  PaymentDetails,
} from "@/components/orders/order-details"
import { OrderTimeline } from "@/components/orders/order-timeline"
import { OrderStatusBadge } from "@/components/orders/status-badge"
import { Button } from "@/components/ui/button"
import { getOrder } from "@/lib/backend-commerce"
import { formatDate, formatPrice } from "@/lib/format"

export const metadata: Metadata = { title: "Order details · AURA" }

export default async function OrderPage({ params, searchParams }: PageProps<"/orders/[id]">) {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")

  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) notFound()
  const order = await getOrder(session.accessToken, id)
  if (!order) notFound()

  const justPlaced = (await searchParams).placed === "1" && order.status === "PENDING"
  const cancellable = order.status === "PENDING"

  return (
    <main className="page-container space-y-8 py-8 lg:py-12">
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All orders
      </Link>

      {justPlaced && (
        <section className="flex flex-col items-start gap-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:flex-row sm:items-center sm:p-8 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
            <CircleCheck className="size-7" />
          </span>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Thank you — your order is confirmed
            </h1>
            <p className="text-[15px] text-muted-foreground">
              Order <span className="font-semibold text-foreground">#{order.id}</span> is being
              prepared. We&apos;ll call{" "}
              <span className="font-medium text-foreground">{order.shippingAddress.phone}</span> before
              delivery — keep <span className="font-semibold text-foreground">{formatPrice(order.totalAmount)}</span>{" "}
              ready for the courier.
            </p>
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          {!justPlaced && (
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Order #{order.id}
            </h1>
          )}
          <p className="flex flex-wrap items-center gap-3 text-[15px] text-muted-foreground">
            <OrderStatusBadge status={order.status} />
            Placed {formatDate(order.createdAt, true)}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {cancellable && <CancelOrderButton orderId={order.id} />}
          <Button asChild variant="outline" className="h-11 rounded-xl">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      </div>

      <section className="rounded-3xl border border-border/70 bg-card px-4 py-7 sm:px-8">
        <OrderTimeline status={order.status} placedAt={order.createdAt} updatedAt={order.updatedAt} />
      </section>

      <div className="grid items-start gap-6 *:min-w-0 lg:grid-cols-[minmax(0,1fr)_400px]">
        <Panel title="Items">
          <OrderItemsList order={order} />
        </Panel>
        <div className="space-y-6">
          <Panel title="Summary">
            <OrderTotals order={order} />
          </Panel>
          <Panel title="Delivery">
            <DeliveryDetails order={order} />
          </Panel>
          <Panel title="Payment">
            <PaymentDetails order={order} />
          </Panel>
          <p className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
            <Headset className="size-4 shrink-0" aria-hidden="true" />
            Questions about this order? Quote #{order.id} when you contact support.
          </p>
        </div>
      </div>
    </main>
  )
}
