import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, Mail, Phone, UserRound } from "lucide-react"
import { auth } from "@/auth"
import { OrderStatusActions } from "@/components/admin/orders/order-status-actions"
import {
  DeliveryDetails,
  OrderItemsList,
  OrderTotals,
  Panel,
  PaymentDetails,
} from "@/components/orders/order-details"
import { OrderTimeline } from "@/components/orders/order-timeline"
import { OrderStatusBadge } from "@/components/orders/status-badge"
import { getOrder } from "@/lib/backend-commerce"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = { title: "Order · AURA Admin" }

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")

  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) notFound()
  const order = await getOrder(session.accessToken, id)
  if (!order) notFound()

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Orders
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Order #{order.id}</h1>
          <p className="flex flex-wrap items-center gap-3 text-[15px] text-muted-foreground">
            <OrderStatusBadge status={order.status} />
            Placed {formatDate(order.createdAt, true)} · updated {formatDate(order.updatedAt, true)}
          </p>
        </div>
        <OrderStatusActions orderId={order.id} nextStatuses={order.nextStatuses} />
      </div>

      <section className="rounded-3xl border border-border/70 bg-card px-4 py-7 sm:px-8">
        <OrderTimeline status={order.status} placedAt={order.createdAt} updatedAt={order.updatedAt} />
      </section>

      <div className="grid items-start gap-6 *:min-w-0 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <Panel title={`Items · ${order.itemCount}`}>
            <OrderItemsList order={order} />
          </Panel>
          <Panel title="Summary">
            <OrderTotals order={order} />
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Customer">
            {order.customer ? (
              <div className="space-y-3 text-[15px]">
                <p className="flex items-center gap-3">
                  <UserRound className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="font-medium text-foreground">{order.customer.name ?? "Unnamed customer"}</span>
                </p>
                <p className="flex items-center gap-3">
                  <Mail className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <a href={`mailto:${order.customer.email}`} className="truncate hover:underline">
                    {order.customer.email}
                  </a>
                </p>
                {order.customer.phone && (
                  <p className="flex items-center gap-3">
                    <Phone className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <a href={`tel:${order.customer.phone}`} className="tabular-nums hover:underline">
                      {order.customer.phone}
                    </a>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[15px] text-muted-foreground">The customer account was removed.</p>
            )}
          </Panel>
          <Panel title="Delivery">
            <DeliveryDetails order={order} />
          </Panel>
          <Panel title="Payment">
            <PaymentDetails order={order} />
          </Panel>
        </div>
      </div>
    </div>
  )
}
