import type { Metadata } from "next"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock,
  Inbox,
  MessageSquareReply,
  SmilePlus,
  Timer,
  type LucideIcon,
} from "lucide-react"
import { AccessDenied } from "@/components/admin/access-denied"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { UrlSearch } from "@/components/admin/url-search"
import { UrlSelect } from "@/components/admin/url-select"
import { TicketPriorityBadge, TicketStatusBadge } from "@/components/support/ticket-badges"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getAdminAccess } from "@/lib/admin-access"
import {
  ADMIN_TICKET_PAGE_SIZE,
  getAdminTickets,
  getTicketSummary,
  type TicketCategory,
  type TicketPage,
  type TicketPriority,
  type TicketSummary,
  type TicketView,
} from "@/lib/backend-tickets"
import { formatRelative } from "@/lib/format"
import { TICKET_CATEGORY_META, TICKET_PRIORITY_META, formatDuration } from "@/lib/ticket-meta"
import { cn, getInitials } from "@/lib/utils"

export const metadata: Metadata = { title: "Support · Admin" }

const VIEWS: Array<{ key: TicketView; label: string; attention?: boolean }> = [
  { key: "needs_reply", label: "Needs reply", attention: true },
  { key: "mine", label: "Assigned to me" },
  { key: "unassigned", label: "Unassigned" },
  { key: "waiting", label: "Waiting on customer" },
  { key: "resolved", label: "Resolved" },
  { key: "all", label: "All" },
]
const PRIORITIES = Object.keys(TICKET_PRIORITY_META) as TicketPriority[]
const CATEGORIES = Object.keys(TICKET_CATEGORY_META) as TicketCategory[]
const HOUR = 3_600_000

function StatTile({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string; hint: string }) {
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

export default async function AdminTicketsPage({ searchParams }: PageProps<"/admin/tickets">) {
  const access = await getAdminAccess()
  if (!access.can("tickets.manage")) return <AccessDenied area="support" />

  const params = await searchParams
  const view: TicketView = VIEWS.some((item) => item.key === params.view) ? (params.view as TicketView) : "needs_reply"
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 150) : ""
  const page = Math.max(1, Number(params.page) || 1)
  const priority = PRIORITIES.find((value) => value === params.priority)
  const category = CATEGORIES.find((value) => value === params.category)
  const customerId = Number(params.customer) > 0 ? Number(params.customer) : undefined

  const href = (next: { view?: TicketView; page?: number }) => {
    const search = new URLSearchParams()
    const nextView = next.view ?? view
    if (nextView !== "needs_reply") search.set("view", nextView)
    if (q) search.set("q", q)
    if (priority) search.set("priority", priority)
    if (category) search.set("category", category)
    if (customerId) search.set("customer", String(customerId))
    if (next.page && next.page > 1) search.set("page", String(next.page))
    const qs = search.toString()
    return qs ? `/admin/tickets?${qs}` : "/admin/tickets"
  }

  let data: TicketPage | null = null
  let summary: TicketSummary | null = null
  try {
    ;[data, summary] = await Promise.all([
      getAdminTickets(access.accessToken, { page, view, search: q || undefined, priority, category, userId: customerId }),
      getTicketSummary(access.accessToken),
    ])
  } catch (error: unknown) {
    console.error("[admin] tickets unavailable:", error)
  }
  // eslint-disable-next-line react-hooks/purity -- request time, for waiting-time warnings
  const now = Date.now()

  return (
    <>
      <AdminPageHeader
        title="Support"
        description="Every customer conversation in one inbox. Work “Needs reply” top to bottom — most urgent and longest waiting first."
      />

      {!data || !summary ? (
        <div role="alert" className="flex items-center gap-3 rounded-3xl bg-destructive/8 px-6 py-5 text-[15px] text-destructive">
          <CircleAlert className="size-5 shrink-0" />
          Support is temporarily unavailable. Refresh in a moment.
        </div>
      ) : (
        <div className="space-y-6">
          <section aria-label="Support health" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatTile icon={MessageSquareReply} label="Needs a reply" value={String(summary.views.needs_reply)} hint="Customer spoke last" />
            <StatTile icon={Inbox} label="Open requests" value={String(summary.openCount)} hint={`${summary.views.unassigned} unassigned`} />
            <StatTile
              icon={Timer}
              label="First response"
              value={summary.avgFirstResponseMinutes === null ? "—" : formatDuration(summary.avgFirstResponseMinutes)}
              hint="Average, last 30 days"
            />
            <StatTile
              icon={SmilePlus}
              label="Satisfaction"
              value={summary.satisfactionRate === null ? "—" : `${Math.round(summary.satisfactionRate * 100)}%`}
              hint={summary.ratedCount > 0 ? `${summary.ratedCount} ratings, last 90 days` : "No ratings yet"}
            />
          </section>

          <nav aria-label="Support views" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {VIEWS.map((item) => {
              const active = item.key === view
              const count = summary.views[item.key]
              return (
                <Link
                  key={item.key}
                  href={href({ view: item.key })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-11 shrink-0 items-center gap-2.5 rounded-xl border px-4 text-[15px] font-medium transition-colors",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border/70 bg-card text-foreground hover:border-foreground/40"
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                      active
                        ? "bg-background/15 text-background"
                        : item.attention && count > 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </Link>
              )
            })}
          </nav>

          <section className="overflow-hidden rounded-3xl border border-border/70 bg-card">
            <div className="flex flex-wrap gap-3 border-b border-border/70 px-6 py-4">
              <UrlSearch initial={q} placeholder="Search subject, customer, #ticket or order…" label="Search tickets" />
              <UrlSelect
                param="priority"
                value={priority}
                label="Priority"
                allLabel="Any priority"
                options={PRIORITIES.map((value) => ({ value, label: `${TICKET_PRIORITY_META[value].label} priority` }))}
              />
              <UrlSelect
                param="category"
                value={category}
                label="Topic"
                allLabel="Any topic"
                options={CATEGORIES.map((value) => ({ value, label: TICKET_CATEGORY_META[value].label }))}
              />
            </div>
            {customerId && (
              <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/40 px-6 py-3 text-sm">
                <span className="text-muted-foreground">Showing one customer&apos;s requests</span>
                <Link href="/admin/tickets?view=all" className="font-medium text-foreground hover:underline">
                  Show everyone
                </Link>
              </div>
            )}

            {data.items.length === 0 ? (
              <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                  <Inbox className="size-7 text-muted-foreground" />
                </span>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-foreground">
                    {view === "needs_reply" && !q && !priority && !category ? "Inbox zero" : "No tickets here"}
                  </p>
                  <p className="text-[15px] text-muted-foreground">
                    {view === "needs_reply" && !q && !priority && !category
                      ? "Every customer has an answer. Nice work."
                      : "Try another view, search or filter."}
                  </p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-border/70">
                {data.items.map((ticket) => {
                  const waitingHours = (now - new Date(ticket.lastMessageAt).getTime()) / HOUR
                  const overdue = ticket.awaitingStaff && waitingHours >= 24
                  const Icon = TICKET_CATEGORY_META[ticket.category].icon
                  return (
                    <li key={ticket.id} className="group relative flex items-start gap-4 px-6 py-4 transition-colors hover:bg-muted/40">
                      <span
                        className={cn(
                          "mt-2 size-2 shrink-0 rounded-full",
                          ticket.awaitingStaff ? "bg-primary" : "bg-transparent"
                        )}
                        aria-label={ticket.awaitingStaff ? "Needs a reply" : undefined}
                      />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <Link
                            href={`/admin/tickets/${ticket.id}`}
                            className={cn(
                              "truncate text-foreground after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4",
                              ticket.awaitingStaff ? "font-semibold" : "font-medium"
                            )}
                          >
                            {ticket.subject}
                          </Link>
                          <span className="text-sm text-muted-foreground">#{ticket.id}</span>
                        </div>
                        {ticket.preview && (
                          <p className="line-clamp-1 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground/80">
                              {ticket.preview.fromStaff ? "Support" : (ticket.customer?.name?.split(/\s+/)[0] ?? "Customer")}:
                            </span>{" "}
                            {ticket.preview.text}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-muted-foreground">
                          <TicketStatusBadge status={ticket.status} audience="staff" className="py-0.5" />
                          {ticket.priority !== "MEDIUM" && <TicketPriorityBadge priority={ticket.priority} className="py-0.5" />}
                          <span className="inline-flex items-center gap-1">
                            <Icon className="size-3.5" aria-hidden="true" />
                            {TICKET_CATEGORY_META[ticket.category].label}
                          </span>
                          {ticket.orderId && <span>· Order #{ticket.orderId}</span>}
                          <span>· {ticket.customer?.name ?? ticket.customer?.email}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-sm tabular-nums",
                            overdue ? "font-semibold text-red-700 dark:text-red-400" : "text-muted-foreground"
                          )}
                          title={overdue ? "Waiting over 24 hours" : undefined}
                        >
                          {overdue && <Clock className="size-3.5" aria-hidden="true" />}
                          {formatRelative(ticket.lastMessageAt)}
                        </span>
                        {ticket.assignee ? (
                          <Avatar className="size-7" title={`Assigned to ${ticket.assignee.name ?? ticket.assignee.email}`}>
                            {ticket.assignee.avatarUrl && <AvatarImage src={ticket.assignee.avatarUrl} alt="" />}
                            <AvatarFallback className="text-[10px]">
                              {getInitials(ticket.assignee.name, ticket.assignee.email)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unassigned</span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            {data.meta.total > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {(page - 1) * ADMIN_TICKET_PAGE_SIZE + 1}–{Math.min(page * ADMIN_TICKET_PAGE_SIZE, data.meta.total)}
                  </span>{" "}
                  of <span className="font-medium text-foreground tabular-nums">{data.meta.total}</span>
                </p>
                {data.meta.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button asChild={page > 1} variant="outline" size="icon" className="size-9 rounded-lg" disabled={page <= 1} aria-label="Previous page">
                      {page > 1 ? (
                        <Link href={href({ page: page - 1 })}>
                          <ChevronLeft className="size-4" />
                        </Link>
                      ) : (
                        <ChevronLeft className="size-4" />
                      )}
                    </Button>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {page} / {data.meta.totalPages}
                    </span>
                    <Button
                      asChild={page < data.meta.totalPages}
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-lg"
                      disabled={page >= data.meta.totalPages}
                      aria-label="Next page"
                    >
                      {page < data.meta.totalPages ? (
                        <Link href={href({ page: page + 1 })}>
                          <ChevronRight className="size-4" />
                        </Link>
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  )
}
