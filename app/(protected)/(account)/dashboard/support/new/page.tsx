import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { auth } from "@/auth"
import { NewTicketForm } from "@/components/support/new-ticket-form"
import { getOrders } from "@/lib/backend-commerce"
import type { TicketCategory } from "@/lib/backend-tickets"
import { formatDate, formatPrice } from "@/lib/format"
import { TICKET_CATEGORY_META } from "@/lib/ticket-meta"

export const metadata: Metadata = { title: "New support request" }

export default async function NewSupportRequestPage({ searchParams }: PageProps<"/dashboard/support/new">) {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")

  const params = await searchParams
  const orders = await getOrders(session.accessToken, { page: 1, limit: 20, scope: "mine" })
  const requestedOrder = Number(params.order)
  const initialOrderId = orders.items.some((order) => order.id === requestedOrder) ? requestedOrder : null
  const initialCategory =
    typeof params.category === "string" && params.category in TICKET_CATEGORY_META
      ? (params.category as TicketCategory)
      : null

  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-4">
        <Link
          href="/dashboard/support"
          className="inline-flex items-center gap-2 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Help &amp; support
        </Link>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">How can we help?</h1>
          <p className="text-base text-muted-foreground">
            Tell us what&apos;s going on and a real person from our team will get back to you.
          </p>
        </div>
      </div>
      <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8">
        <NewTicketForm
          orders={orders.items.map((order) => ({
            id: order.id,
            label: `#${order.id} · ${formatDate(order.createdAt)} · ${formatPrice(order.totalAmount)} · ${order.itemCount} ${order.itemCount === 1 ? "item" : "items"}`,
          }))}
          initialOrderId={initialOrderId}
          initialCategory={initialCategory}
        />
      </div>
    </div>
  )
}
