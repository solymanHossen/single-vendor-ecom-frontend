import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getInitials } from "@/lib/utils"
import { formatPrice } from "@/lib/format"
import type {
  AnalyticsDashboard,
  PaymentProvider,
} from "@/lib/backend-analytics"
import { dateTime } from "./format"
import { OrderStatusBadge, PaymentStatusBadge } from "./status-badge"

const PROVIDER_LABELS: Readonly<Record<PaymentProvider, string>> = {
  COD: "Cash on delivery",
  BKASH: "bKash",
  SSLCOMMERZ: "SSLCommerz",
  STRIPE: "Card",
}

export function RecentOrdersTable({
  orders,
}: {
  orders: AnalyticsDashboard["recentOrders"]
}) {
  return (
    <div className="flex h-full flex-col gap-5 rounded-3xl border border-border/70 bg-card p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Recent orders</h2>
        <p className="text-[15px] text-muted-foreground">
          The latest orders across the store
        </p>
      </div>
      <div className="-mx-2 overflow-x-auto">
        <Table className="text-[15px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-10">Order</TableHead>
              <TableHead className="h-10">Customer</TableHead>
              <TableHead className="h-10">Status</TableHead>
              <TableHead className="h-10">Payment</TableHead>
              <TableHead className="h-10 text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="py-3.5">
                  <p className="font-semibold text-foreground">#{order.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {dateTime(order.createdAt)}
                  </p>
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {getInitials(order.customerName, order.customerEmail)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {order.customerName ?? "Guest"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {order.itemCount}{" "}
                        {order.itemCount === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="space-y-1">
                    <PaymentStatusBadge status={order.paymentStatus} />
                    {order.paymentProvider && (
                      <p className="text-xs text-muted-foreground">
                        {PROVIDER_LABELS[order.paymentProvider]}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-3.5 text-right font-semibold text-foreground tabular-nums">
                  {formatPrice(order.totalAmount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
