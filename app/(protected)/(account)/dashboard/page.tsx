import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  Check,
  CircleCheck,
  Clock,
  MapPin,
  Package,
  Plus,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { auth } from "@/auth"
import { LineThumb } from "@/components/cart/cart-drawer"
import { OrderTimeline } from "@/components/orders/order-timeline"
import { OrderStatusBadge } from "@/components/orders/status-badge"
import { Button } from "@/components/ui/button"
import { fetchMe } from "@/lib/backend-auth"
import { getAddresses, getOrderSummary, getOrders } from "@/lib/backend-commerce"
import { formatDate, formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "My account" }

const dhakaHour = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  hour12: false,
  timeZone: "Asia/Dhaka",
})

function greeting(): string {
  const hour = Number(dhakaHour.format(new Date()))
  if (hour < 5) return "Good evening"
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-xl bg-muted">
          <Icon className="size-[18px] text-foreground" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  )
}

function Card({
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

function CardLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
  )
}

export default async function AccountOverviewPage() {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")

  const [profile, summary, recent, addresses] = await Promise.all([
    fetchMe(session.accessToken),
    getOrderSummary(session.accessToken),
    getOrders(session.accessToken, { page: 1, limit: 4 }),
    getAddresses(session.accessToken),
  ])
  const firstName = profile?.name?.split(/\s+/)[0]
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0]
  const active = summary.activeOrder

  const checklist = [
    { done: !!profile?.name, label: "Add your name", href: "/profile" },
    { done: !!profile?.phone, label: "Add a mobile number", href: "/profile" },
    { done: addresses.length > 0, label: "Save a delivery address", href: "/addresses" },
    { done: !!profile?.avatarUrl, label: "Add a profile photo", href: "/profile" },
  ]
  const completed = checklist.filter((item) => item.done).length

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-base text-muted-foreground">
          {active
            ? `Order #${active.id} is on its way — here's where it is.`
            : "Your orders, addresses and account, all in one place."}
        </p>
      </div>

      <section aria-label="Your orders at a glance" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile icon={Package} label="Orders" value={String(summary.totalOrders)} hint="All time" />
        <StatTile icon={Clock} label="In progress" value={String(summary.inProgress)} hint="Not delivered yet" />
        <StatTile icon={CircleCheck} label="Delivered" value={String(summary.delivered)} hint="Completed orders" />
        <StatTile icon={Wallet} label="Total spent" value={formatPrice(summary.totalSpent)} hint="On delivered orders" />
      </section>

      {active && (
        <section className="rounded-3xl border border-border/70 bg-card">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 px-6 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-semibold text-foreground">Order #{active.id}</h2>
              <OrderStatusBadge status={active.status} />
              <span className="text-sm text-muted-foreground">Placed {formatDate(active.createdAt)}</span>
            </div>
            <Button asChild className="h-10 rounded-xl px-4">
              <Link href={`/orders/${active.id}`}>
                Track order
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-6 px-4 py-6 sm:px-6">
            <OrderTimeline status={active.status} placedAt={active.createdAt} updatedAt={active.updatedAt} />
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex -space-x-2.5">
                  {active.items.slice(0, 4).map((item) => (
                    <span key={item.id} className="rounded-xl ring-2 ring-card">
                      <LineThumb url={item.product.imageUrl} size={44} />
                    </span>
                  ))}
                </span>
                <span className="text-sm text-muted-foreground">
                  {active.itemCount} {active.itemCount === 1 ? "item" : "items"}
                </span>
              </div>
              <span className="font-semibold text-foreground tabular-nums">{formatPrice(active.totalAmount)}</span>
            </div>
          </div>
        </section>
      )}

      <div className="grid items-start gap-6 *:min-w-0 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card title="Recent orders" action={recent.items.length > 0 && <CardLink href="/orders">View all</CardLink>}>
          {recent.items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-muted">
                <Package className="size-6 text-muted-foreground" />
              </span>
              <div className="space-y-1">
                <p className="font-medium text-foreground">No orders yet</p>
                <p className="text-sm text-muted-foreground">Your orders will show up here.</p>
              </div>
              <Button asChild className="h-10 rounded-xl">
                <Link href="/products">Start shopping</Link>
              </Button>
            </div>
          ) : (
            <ul className="-my-2 divide-y divide-border/70">
              {recent.items.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/orders/${order.id}`}
                    className="group -mx-3 flex items-center gap-4 rounded-2xl px-3 py-3.5 transition-colors hover:bg-muted/50"
                  >
                    <LineThumb url={order.items[0]?.product.imageUrl ?? null} size={52} />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2.5">
                        <span className="font-medium text-foreground">#{order.id}</span>
                        <OrderStatusBadge status={order.status} />
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {formatDate(order.createdAt)} · {order.items.map((item) => item.product.name).join(", ")}
                      </p>
                    </div>
                    <span className="font-medium text-foreground tabular-nums">{formatPrice(order.totalAmount)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card
            title="Default address"
            action={<CardLink href="/addresses">{addresses.length > 0 ? "Manage" : "Add"}</CardLink>}
          >
            {defaultAddress ? (
              <div className="flex gap-3 text-[15px]">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground">{defaultAddress.recipientName ?? "Recipient"}</p>
                  <p className="text-muted-foreground">
                    {[defaultAddress.addressLine1, defaultAddress.addressLine2].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-muted-foreground">
                    {defaultAddress.city} {defaultAddress.postalCode}
                  </p>
                  {defaultAddress.phone && (
                    <p className="text-muted-foreground tabular-nums">{defaultAddress.phone}</p>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href="/addresses"
                className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-border px-4 py-5 text-[15px] font-medium text-foreground transition-colors hover:border-foreground/40"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add a delivery address for faster checkout
              </Link>
            )}
          </Card>

          {completed < checklist.length && (
            <Card title="Complete your profile">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {completed} of {checklist.length} done
                    </span>
                    <span className="font-medium text-foreground tabular-nums">
                      {Math.round((completed / checklist.length) * 100)}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label="Profile completion"
                    aria-valuemin={0}
                    aria-valuemax={checklist.length}
                    aria-valuenow={completed}
                  >
                    <div
                      className="h-full rounded-full bg-foreground"
                      style={{ width: `${(completed / checklist.length) * 100}%` }}
                    />
                  </div>
                </div>
                <ul className="space-y-1">
                  {checklist.map((item) => (
                    <li key={item.label}>
                      {item.done ? (
                        <span className="flex items-center gap-3 px-1 py-1.5 text-[15px] text-muted-foreground line-through decoration-1">
                          <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-background">
                            <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                          </span>
                          {item.label}
                        </span>
                      ) : (
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 rounded-lg px-1 py-1.5 text-[15px] text-foreground transition-colors hover:bg-muted"
                        >
                          <span className="size-5 rounded-full border-2 border-border" aria-hidden="true" />
                          {item.label}
                          <ArrowRight className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
