import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AccessDenied } from "@/components/admin/access-denied"
import { CouponEditor } from "@/components/admin/coupons/coupon-editor"
import { Section } from "@/components/admin/products/form-primitives"
import { OrderStatusBadge } from "@/components/orders/status-badge"
import { getAdminAccess } from "@/lib/admin-access"
import { getCoupon } from "@/lib/backend-coupons"
import { formatPrice, formatRelative } from "@/lib/format"

export const metadata: Metadata = { title: "Coupon · Admin" }

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/50 px-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-xl font-semibold text-foreground tabular-nums">{value}</dd>
    </div>
  )
}

export default async function CouponPage({ params }: PageProps<"/admin/coupons/[id]">) {
  const access = await getAdminAccess()
  if (!access.can("coupons.manage")) return <AccessDenied area="coupons" />

  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) notFound()
  const coupon = await getCoupon(access.accessToken, id)
  if (!coupon) notFound()
  const canSeeOrders = access.can("orders.view")

  const performance = (
    <Section title="Performance" description="From orders that weren't cancelled.">
      <dl className="grid grid-cols-2 gap-3">
        <Stat label="Orders" value={coupon.orderCount.toLocaleString("en-US")} />
        <Stat label="Customers" value={coupon.customerCount.toLocaleString("en-US")} />
        <Stat label="Revenue" value={formatPrice(coupon.revenue)} />
        <Stat label={coupon.discountType === "FREE_SHIPPING" ? "Item discount" : "Discount given"} value={formatPrice(coupon.discountGiven)} />
      </dl>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-medium text-foreground">Latest orders</h3>
        {coupon.recentOrders.length === 0 ? (
          <p className="text-[15px] text-muted-foreground">No orders have used this coupon yet.</p>
        ) : (
          <ul className="-mx-2 divide-y divide-border/70">
            {coupon.recentOrders.map((order) => {
              const body = (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-foreground">#{order.id}</span>
                      <OrderStatusBadge status={order.status} />
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {order.customer?.name ?? order.customer?.email ?? "Deleted account"} · {formatRelative(order.createdAt)}
                    </span>
                  </span>
                  <span className="text-right text-sm tabular-nums">
                    <span className="block font-medium text-foreground">{formatPrice(order.totalAmount)}</span>
                    {Number(order.discountAmount) > 0 && (
                      <span className="block text-muted-foreground">−{formatPrice(order.discountAmount)}</span>
                    )}
                  </span>
                </>
              )
              return (
                <li key={order.id}>
                  {canSeeOrders ? (
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-muted/50"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 px-2 py-3">{body}</div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Section>
  )

  return <CouponEditor key={coupon.updatedAt} coupon={coupon} template={coupon} aside={performance} />
}
