import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowUpRight, Mail } from "lucide-react"
import { AccessDenied } from "@/components/admin/access-denied"
import { StaffComposer } from "@/components/admin/tickets/staff-composer"
import { TicketProperties } from "@/components/admin/tickets/ticket-properties"
import { Panel } from "@/components/orders/order-details"
import { OrderStatusBadge } from "@/components/orders/status-badge"
import { TicketPriorityBadge, TicketStatusBadge } from "@/components/support/ticket-badges"
import { TicketThread } from "@/components/support/ticket-thread"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAdminAccess } from "@/lib/admin-access"
import { getStoreSettings } from "@/lib/backend-settings"
import { getAdminTicket, getTicketAssignees } from "@/lib/backend-tickets"
import { formatDate, formatPrice, formatRelative } from "@/lib/format"
import { TICKET_CATEGORY_META, formatDuration } from "@/lib/ticket-meta"
import { getInitials } from "@/lib/utils"

export const metadata: Metadata = { title: "Ticket · Support" }

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{children}</dd>
    </div>
  )
}

export default async function AdminTicketPage({ params }: PageProps<"/admin/tickets/[id]">) {
  const access = await getAdminAccess()
  if (!access.can("tickets.manage")) return <AccessDenied area="support" />

  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) notFound()
  const [ticket, assignees, settings] = await Promise.all([
    getAdminTicket(access.accessToken, id),
    getTicketAssignees(access.accessToken),
    getStoreSettings(),
  ])
  if (!ticket) notFound()
  // eslint-disable-next-line react-hooks/purity -- request time, for Today/Yesterday
  const now = Date.now()
  const customer = ticket.customer
  const firstName = customer?.name?.split(/\s+/)[0] ?? "there"
  const category = TICKET_CATEGORY_META[ticket.category]
  const firstResponse =
    ticket.firstResponseAt &&
    (new Date(ticket.firstResponseAt).getTime() - new Date(ticket.createdAt).getTime()) / 60_000

  return (
    <div className="space-y-6">
      <Link
        href="/admin/tickets"
        className="inline-flex items-center gap-2 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Support
      </Link>

      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{ticket.subject}</h1>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <TicketStatusBadge status={ticket.status} audience="staff" />
          <TicketPriorityBadge priority={ticket.priority} />
          <span>#{ticket.id}</span>
          <span className="inline-flex items-center gap-1.5">
            <category.icon className="size-4" aria-hidden="true" />
            {category.label}
          </span>
          <span>Opened {formatRelative(ticket.createdAt)}</span>
          {ticket.awaitingStaff && <span className="font-medium text-primary">· Needs a reply</span>}
        </p>
      </header>

      <div className="grid items-start gap-6 *:min-w-0 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-border/70 bg-muted/20 p-4 sm:p-6">
            <TicketThread messages={ticket.messages} audience="staff" now={now} storeName={settings.storeName} />
          </section>
          <StaffComposer
            key={ticket.messages.length}
            ticketId={ticket.id}
            customerFirstName={firstName}
            canResolve={ticket.status !== "RESOLVED" && ticket.status !== "CLOSED"}
          />
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Panel title="Details">
            <TicketProperties
              ticketId={ticket.id}
              status={ticket.status}
              priority={ticket.priority}
              category={ticket.category}
              assigneeId={ticket.assignee?.id ?? null}
              assignees={assignees}
              viewerId={access.profile.id}
            />
            <dl className="mt-5 space-y-2.5 border-t border-border/70 pt-5">
              <Fact label="First response">{firstResponse ? formatDuration(firstResponse) : "Not yet"}</Fact>
              <Fact label="Last activity">{formatRelative(ticket.lastMessageAt)}</Fact>
              {ticket.satisfied !== null && (
                <Fact label="Customer rating">{ticket.satisfied ? "👍 Helpful" : "👎 Not helpful"}</Fact>
              )}
            </dl>
          </Panel>

          {customer && (
            <Panel title="Customer">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  {customer.avatarUrl && <AvatarImage src={customer.avatarUrl} alt="" />}
                  <AvatarFallback>{getInitials(customer.name, customer.email)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{customer.name ?? "No name"}</p>
                  <a href={`mailto:${customer.email}`} className="inline-flex items-center gap-1.5 truncate text-sm text-muted-foreground hover:text-foreground">
                    <Mail className="size-3.5" aria-hidden="true" />
                    {customer.email}
                  </a>
                </div>
              </div>
              {ticket.customerStats && (
                <dl className="mt-4 space-y-2.5">
                  <Fact label="Customer since">{formatDate(ticket.customerStats.memberSince)}</Fact>
                  <Fact label="Orders">{ticket.customerStats.orderCount}</Fact>
                  <Fact label="Support requests">
                    <Link href={`/admin/tickets?view=all&customer=${customer.id}`} className="hover:underline">
                      {ticket.customerStats.ticketCount}
                    </Link>
                  </Fact>
                </dl>
              )}
              {access.can("customers.view") && (
                <Link
                  href={`/admin/users/${customer.id}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
                >
                  View customer
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </Link>
              )}
            </Panel>
          )}

          {ticket.order && (
            <Panel title={`Order #${ticket.order.id}`}>
              <dl className="space-y-2.5">
                <Fact label="Status">
                  <OrderStatusBadge status={ticket.order.status} />
                </Fact>
                <Fact label="Total">{formatPrice(ticket.order.totalAmount)}</Fact>
                <Fact label="Items">{ticket.order.itemCount}</Fact>
                <Fact label="Placed">{formatDate(ticket.order.createdAt)}</Fact>
              </dl>
              {access.can("orders.view") && (
                <Link
                  href={`/admin/orders/${ticket.order.id}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
                >
                  Open order
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </Link>
              )}
            </Panel>
          )}
        </aside>
      </div>
    </div>
  )
}
