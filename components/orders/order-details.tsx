import Link from "next/link"
import { Banknote, CreditCard, MapPin, Phone, Smartphone, StickyNote, type LucideIcon } from "lucide-react"
import type { Order, PaymentProvider } from "@/lib/backend-commerce"
import { formatPrice } from "@/lib/format"
import { productHref } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { LineThumb } from "@/components/cart/cart-drawer"
import { PaymentStatusBadge } from "./status-badge"

export const PAYMENT_LABELS: Record<PaymentProvider, { label: string; icon: LucideIcon }> = {
  COD: { label: "Cash on delivery", icon: Banknote },
  BKASH: { label: "bKash", icon: Smartphone },
  SSLCOMMERZ: { label: "SSLCommerz", icon: CreditCard },
  STRIPE: { label: "Card (Stripe)", icon: CreditCard },
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-3xl border border-border/70 bg-card", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-6 py-4">
        <h2 className="font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  )
}

export function OrderItemsList({ order, linkProducts = true }: { order: Order; linkProducts?: boolean }) {
  return (
    <ul className="divide-y divide-border/70">
      {order.items.map((item) => {
        const name = (
          <span className="line-clamp-2 font-medium text-foreground">{item.product.name}</span>
        )
        return (
          <li key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
            <LineThumb url={item.product.imageUrl} size={64} />
            <div className="min-w-0 flex-1 space-y-0.5">
              {linkProducts ? (
                <Link
                  href={productHref(item.productId)}
                  className="hover:underline hover:underline-offset-4"
                >
                  {name}
                </Link>
              ) : (
                name
              )}
              <p className="text-sm text-muted-foreground">
                {[item.variantLabel, `Qty ${item.quantity}`].filter(Boolean).join(" · ")}
              </p>
              <p className="font-mono text-xs text-muted-foreground">{item.sku}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground tabular-nums">{formatPrice(item.subtotal)}</p>
              {item.quantity > 1 && (
                <p className="text-sm text-muted-foreground tabular-nums">
                  {formatPrice(item.unitPrice)} each
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function OrderTotals({ order }: { order: Order }) {
  const row = "flex items-baseline justify-between gap-4 text-[15px]"
  return (
    <div className="space-y-3">
      <div className={row}>
        <span className="text-muted-foreground">
          Subtotal · {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
        </span>
        <span className="font-medium tabular-nums">{formatPrice(order.subtotal)}</span>
      </div>
      {Number(order.discountAmount) > 0 && (
        <div className={row}>
          <span className="text-muted-foreground">
            Discount{order.couponCode ? ` (${order.couponCode})` : ""}
          </span>
          <span className="font-medium text-emerald-700 tabular-nums dark:text-emerald-400">
            −{formatPrice(order.discountAmount)}
          </span>
        </div>
      )}
      <div className={row}>
        <span className="text-muted-foreground">Delivery</span>
        <span className="font-medium tabular-nums">
          {Number(order.shippingFee) === 0 ? "Free" : formatPrice(order.shippingFee)}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-4 border-t border-border/70 pt-4">
        <span className="font-semibold text-foreground">Total</span>
        <span className="text-xl font-semibold tracking-tight tabular-nums">
          {formatPrice(order.totalAmount)}
        </span>
      </div>
    </div>
  )
}

export function DeliveryDetails({ order }: { order: Order }) {
  const address = order.shippingAddress
  return (
    <div className="space-y-4 text-[15px]">
      <p className="flex gap-3">
        <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span>
          <span className="block font-medium text-foreground">{address.recipientName ?? "Recipient"}</span>
          <span className="block text-muted-foreground">
            {[address.addressLine1, address.addressLine2].filter(Boolean).join(", ")}
          </span>
          <span className="block text-muted-foreground">
            {address.city} {address.postalCode}, {address.country}
          </span>
        </span>
      </p>
      {address.phone && (
        <p className="flex items-center gap-3">
          <Phone className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <a href={`tel:${address.phone}`} className="text-foreground tabular-nums hover:underline">
            {address.phone}
          </a>
        </p>
      )}
      {order.note && (
        <p className="flex gap-3">
          <StickyNote className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="text-muted-foreground">“{order.note}”</span>
        </p>
      )}
    </div>
  )
}

export function PaymentDetails({ order }: { order: Order }) {
  const provider = PAYMENT_LABELS[order.payment?.provider ?? "COD"]
  const Icon = provider.icon
  const dueOnDelivery =
    order.payment?.provider === "COD" && order.paymentStatus === "UNPAID" && order.status !== "CANCELLED"
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-3 text-[15px] font-medium text-foreground">
          <span className="flex size-9 items-center justify-center rounded-xl bg-muted">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          {provider.label}
        </span>
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>
      {dueOnDelivery && (
        <p className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
          Pay <span className="font-semibold text-foreground">{formatPrice(order.totalAmount)}</span> to
          the courier when your order arrives.
        </p>
      )}
      {order.payment?.transactionId && (
        <p className="font-mono text-xs text-muted-foreground">Txn {order.payment.transactionId}</p>
      )}
    </div>
  )
}
