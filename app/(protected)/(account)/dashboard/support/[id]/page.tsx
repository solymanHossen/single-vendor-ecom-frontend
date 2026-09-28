import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, Lock, Package } from "lucide-react"
import { auth } from "@/auth"
import { CustomerComposer } from "@/components/support/customer-composer"
import { ResolutionPanel } from "@/components/support/resolution-panel"
import { TicketStatusBadge } from "@/components/support/ticket-badges"
import { TicketThread } from "@/components/support/ticket-thread"
import { Button } from "@/components/ui/button"
import { getStoreSettings } from "@/lib/backend-settings"
import { getMyTicket } from "@/lib/backend-tickets"
import { formatDate } from "@/lib/format"
import { accountOrderHref } from "@/lib/routes"
import { TICKET_CATEGORY_META } from "@/lib/ticket-meta"

export const metadata: Metadata = { title: "Support request" }

export default async function SupportRequestPage({ params }: PageProps<"/dashboard/support/[id]">) {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")

  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) notFound()
  const [ticket, settings] = await Promise.all([getMyTicket(session.accessToken, id), getStoreSettings()])
  if (!ticket) notFound()
  // eslint-disable-next-line react-hooks/purity -- request time, for Today/Yesterday
  const now = Date.now()
  const category = TICKET_CATEGORY_META[ticket.category]

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/dashboard/support"
        className="inline-flex items-center gap-2 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Help &amp; support
      </Link>

      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{ticket.subject}</h1>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <TicketStatusBadge status={ticket.status} audience="customer" />
          <span>Request #{ticket.id}</span>
          <span className="inline-flex items-center gap-1.5">
            <category.icon className="size-4" aria-hidden="true" />
            {category.label}
          </span>
          <span>Opened {formatDate(ticket.createdAt)}</span>
        </p>
        {ticket.order && (
          <Link
            href={accountOrderHref(ticket.order.id)}
            className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/40"
          >
            <Package className="size-4" aria-hidden="true" />
            Order #{ticket.order.id} · {ticket.order.itemCount} {ticket.order.itemCount === 1 ? "item" : "items"}
          </Link>
        )}
      </header>

      <section className="rounded-3xl border border-border/70 bg-muted/20 p-4 sm:p-6">
        <TicketThread messages={ticket.messages} audience="customer" now={now} storeName={settings.storeName} />
        {ticket.status === "WAITING" && (
          <p className="mt-6 text-center text-sm font-medium text-amber-700 dark:text-amber-400">
            We&apos;re waiting for your reply.
          </p>
        )}
        {(ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") && ticket.awaitingStaff && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Thanks — our team has your message and will reply here soon.
          </p>
        )}
      </section>

      <ResolutionPanel
        ticketId={ticket.id}
        status={ticket.status}
        satisfied={ticket.satisfied}
        staffHasReplied={ticket.messages.some((message) => message.kind === "REPLY" && message.fromStaff)}
      />

      {ticket.canReply ? (
        <CustomerComposer ticketId={ticket.id} status={ticket.status} />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card px-5 py-4">
          <p className="flex items-center gap-2 text-[15px] text-muted-foreground">
            <Lock className="size-4" aria-hidden="true" />
            This request is closed.
          </p>
          <Button asChild variant="outline" className="h-10 rounded-xl">
            <Link href={`/dashboard/support/new${ticket.orderId ? `?order=${ticket.orderId}` : ""}`}>
              Start a new request
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
