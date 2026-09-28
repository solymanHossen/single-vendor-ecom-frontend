import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ChevronRight, LifeBuoy, MessageSquareText, Package, Plus, RotateCcw, Truck } from "lucide-react"
import { auth } from "@/auth"
import { TicketStatusBadge } from "@/components/support/ticket-badges"
import { Button } from "@/components/ui/button"
import { getMyTickets } from "@/lib/backend-tickets"
import { formatRelative } from "@/lib/format"
import { supportTicketHref } from "@/lib/routes"
import { TICKET_CATEGORY_META } from "@/lib/ticket-meta"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Help & support" }

const TABS = [
  { key: "active", label: "Active" },
  { key: "resolved", label: "Resolved" },
  { key: "all", label: "All" },
] as const
type Tab = (typeof TABS)[number]["key"]

const SHORTCUTS = [
  { href: "/dashboard/orders", label: "Track an order", hint: "See where your parcel is", icon: Truck },
  { href: "/dashboard/support/new?category=RETURN", label: "Return an item", hint: "Start a return or exchange", icon: RotateCcw },
  { href: "/dashboard/support/new?category=ORDER", label: "Order problem", hint: "Changes, cancellations and more", icon: Package },
]

export default async function SupportPage({ searchParams }: PageProps<"/dashboard/support">) {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")

  const params = await searchParams
  const tab: Tab = TABS.some((item) => item.key === params.state) ? (params.state as Tab) : "active"
  const page = Math.max(1, Number(params.page) || 1)
  const data = await getMyTickets(session.accessToken, { page, state: tab })

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Help &amp; support</h1>
          <p className="text-base text-muted-foreground">Ask us anything. Every conversation with our team lives here.</p>
        </div>
        <Button asChild className="h-11 rounded-xl px-5 text-[15px] font-semibold">
          <Link href="/dashboard/support/new">
            <Plus className="size-5" />
            New request
          </Link>
        </Button>
      </div>

      <section aria-label="Quick help" className="grid gap-3 sm:grid-cols-3">
        {SHORTCUTS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 transition-colors hover:border-foreground/40"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
              <item.icon className="size-5 text-foreground" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block font-medium text-foreground">{item.label}</span>
              <span className="block truncate text-sm text-muted-foreground">{item.hint}</span>
            </span>
          </Link>
        ))}
      </section>

      <div className="space-y-4">
        <nav aria-label="Filter requests" className="flex gap-2">
          {TABS.map((item) => {
            const active = item.key === tab
            return (
              <Link
                key={item.key}
                href={item.key === "active" ? "/dashboard/support" : `/dashboard/support?state=${item.key}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-foreground hover:border-foreground/40"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {data.items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-border/70 bg-card px-6 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-muted">
              <LifeBuoy className="size-6 text-muted-foreground" />
            </span>
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                {tab === "active" ? "No open requests" : tab === "resolved" ? "Nothing resolved yet" : "No requests yet"}
              </p>
              <p className="text-sm text-muted-foreground">
                Something not right? We&apos;re here to help — most requests get a reply the same day.
              </p>
            </div>
            <Button asChild className="h-10 rounded-xl">
              <Link href="/dashboard/support/new">Ask for help</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border/70 overflow-hidden rounded-3xl border border-border/70 bg-card">
            {data.items.map((ticket) => {
              const Icon = TICKET_CATEGORY_META[ticket.category].icon
              return (
                <li key={ticket.id}>
                  <Link
                    href={supportTicketHref(ticket.id)}
                    className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/40 sm:px-6"
                  >
                    <span className="relative mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <Icon className="size-5 text-foreground" aria-hidden="true" />
                      {ticket.unread && (
                        <span className="absolute -top-1 -right-1 size-3 rounded-full bg-primary ring-2 ring-card" aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 space-y-1">
                      <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className={cn("truncate text-foreground", ticket.unread ? "font-semibold" : "font-medium")}>
                          {ticket.subject}
                        </span>
                        {ticket.unread && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                            New reply
                          </span>
                        )}
                      </span>
                      {ticket.preview && (
                        <span className="line-clamp-1 block text-sm text-muted-foreground">
                          {ticket.preview.fromStaff ? "Support: " : "You: "}
                          {ticket.preview.text}
                        </span>
                      )}
                      <span className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                        <TicketStatusBadge status={ticket.status} audience="customer" className="py-0.5" />
                        <span>#{ticket.id}</span>
                        {ticket.orderId && <span>· Order #{ticket.orderId}</span>}
                        <span>· {formatRelative(ticket.lastMessageAt)}</span>
                        <span className="inline-flex items-center gap-1">
                          · <MessageSquareText className="size-3.5" aria-hidden="true" />
                          {ticket.replyCount}
                        </span>
                      </span>
                    </span>
                    <ChevronRight className="mt-3 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        {data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="tabular-nums">
              Page {page} of {data.meta.totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Button asChild variant="outline" className="h-9 rounded-lg">
                  <Link href={`/dashboard/support?state=${tab}&page=${page - 1}`}>Newer</Link>
                </Button>
              )}
              {page < data.meta.totalPages && (
                <Button asChild variant="outline" className="h-9 rounded-lg">
                  <Link href={`/dashboard/support?state=${tab}&page=${page + 1}`}>Older</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
