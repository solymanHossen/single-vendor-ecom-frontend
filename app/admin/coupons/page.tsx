import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock,
  Plus,
  ReceiptText,
  TicketPercent,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { AccessDenied } from "@/components/admin/access-denied"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { UrlSearch } from "@/components/admin/url-search"
import { CouponCode } from "@/components/admin/coupons/coupon-code"
import { CouponRowActions } from "@/components/admin/coupons/coupon-row-actions"
import { CouponStatusBadge } from "@/components/admin/coupons/coupon-status-badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getAdminAccess } from "@/lib/admin-access"
import {
  COUPON_PAGE_SIZE,
  getCouponSummary,
  getCoupons,
  type Coupon,
  type CouponPage,
  type CouponSort,
  type CouponStatus,
  type CouponSummary,
} from "@/lib/backend-coupons"
import { offerConditions, offerHeadline } from "@/lib/coupon-format"
import { formatDate, formatPrice, timeUntil } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Coupons · Admin" }

type Tab = "all" | CouponStatus
const TABS: Array<{ key: Tab; label: string }> = [
  { key: "all", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "SCHEDULED", label: "Scheduled" },
  { key: "USED_UP", label: "Used up" },
  { key: "EXPIRED", label: "Expired" },
  { key: "DISABLED", label: "Off" },
]
const SORTS: readonly CouponSort[] = ["createdAt", "validUntil", "usedCount", "code"]

interface ListState {
  tab: Tab
  q: string
  page: number
  sort: CouponSort
  order: "asc" | "desc"
}

function href(state: Partial<ListState>): string {
  const params = new URLSearchParams()
  if (state.tab && state.tab !== "all") params.set("status", state.tab)
  if (state.q) params.set("q", state.q)
  // Default: newest first — only a different sort goes in the URL.
  if (state.sort && !(state.sort === "createdAt" && state.order !== "asc")) {
    params.set("sort", state.sort)
    if (state.order) params.set("order", state.order)
  }
  if (state.page && state.page > 1) params.set("page", String(state.page))
  const qs = params.toString()
  return qs ? `/admin/coupons?${qs}` : "/admin/coupons"
}

const DAY = 86_400_000

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint: React.ReactNode
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

function Usage({ coupon }: { coupon: Coupon }) {
  if (coupon.usageLimit === null) {
    return (
      <span className="text-muted-foreground">
        <span className="font-medium text-foreground tabular-nums">{coupon.usedCount.toLocaleString("en-US")}</span> used
        <span className="block text-sm">No limit</span>
      </span>
    )
  }
  const ratio = Math.min(1, coupon.usedCount / coupon.usageLimit)
  return (
    <span className="block w-36">
      <span className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium text-foreground tabular-nums">
          {coupon.usedCount.toLocaleString("en-US")}
          <span className="font-normal text-muted-foreground"> / {coupon.usageLimit.toLocaleString("en-US")}</span>
        </span>
        <span className="text-muted-foreground tabular-nums">{Math.round(ratio * 100)}%</span>
      </span>
      <span
        className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={`${coupon.code} usage`}
        aria-valuemin={0}
        aria-valuemax={coupon.usageLimit}
        aria-valuenow={coupon.usedCount}
      >
        <span
          className={cn("block h-full rounded-full", ratio >= 0.9 ? "bg-amber-500" : "bg-foreground")}
          style={{ width: `${ratio * 100}%` }}
        />
      </span>
    </span>
  )
}

function Validity({ coupon, now }: { coupon: Coupon; now: number }) {
  const ends = new Date(coupon.validUntil).getTime()
  if (coupon.status === "SCHEDULED") {
    return (
      <span>
        <span className="block text-foreground">Starts {formatDate(coupon.validFrom)}</span>
        <span className="block text-sm text-muted-foreground">in {timeUntil(coupon.validFrom, now)}</span>
      </span>
    )
  }
  if (ends < now) {
    return <span className="text-muted-foreground">Ended {formatDate(coupon.validUntil)}</span>
  }
  const soon = ends - now < 3 * DAY
  return (
    <span>
      <span className="block text-foreground">{formatDate(coupon.validUntil)}</span>
      <span className={cn("flex items-center gap-1 text-sm", soon ? "font-medium text-amber-700 dark:text-amber-400" : "text-muted-foreground")}>
        {soon && <Clock className="size-3.5" aria-hidden="true" />}
        Ends in {timeUntil(coupon.validUntil, now)}
      </span>
    </span>
  )
}

export default async function AdminCouponsPage({ searchParams }: PageProps<"/admin/coupons">) {
  const access = await getAdminAccess()
  if (!access.can("coupons.manage")) return <AccessDenied area="coupons" />

  const params = await searchParams
  const requested = typeof params.status === "string" ? params.status : "all"
  const tab: Tab = TABS.some((item) => item.key === requested) ? (requested as Tab) : "all"
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 150) : ""
  const page = Math.max(1, Number(params.page) || 1)
  const sort: CouponSort = SORTS.includes(params.sort as CouponSort) ? (params.sort as CouponSort) : "createdAt"
  const order: "asc" | "desc" = params.order === "asc" ? "asc" : params.order === "desc" ? "desc" : sort === "code" || sort === "validUntil" ? "asc" : "desc"
  const state: ListState = { tab, q, page, sort, order }

  let data: CouponPage | null = null
  let summary: CouponSummary | null = null
  try {
    ;[data, summary] = await Promise.all([
      getCoupons(access.accessToken, {
        page,
        status: tab === "all" ? undefined : tab,
        search: q || undefined,
        sortBy: sort,
        sortOrder: order,
      }),
      getCouponSummary(access.accessToken),
    ])
  } catch (error: unknown) {
    console.error("[admin] coupons unavailable:", error)
  }
  // Rendered per request (dynamic page), so "now" is the request time.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()

  const sortLink = (key: CouponSort, label: string, className?: string) => {
    const active = sort === key
    const nextOrder = active ? (order === "asc" ? "desc" : "asc") : key === "code" || key === "validUntil" ? "asc" : "desc"
    const Icon = !active ? ArrowUpDown : order === "asc" ? ArrowUp : ArrowDown
    return (
      <TableHead className={className} aria-sort={active ? (order === "asc" ? "ascending" : "descending") : undefined}>
        <Link
          href={href({ ...state, sort: key, order: nextOrder, page: 1 })}
          className={cn("inline-flex items-center gap-1.5 hover:text-foreground", active && "text-foreground")}
        >
          {label}
          <Icon className="size-3.5" aria-hidden="true" />
        </Link>
      </TableHead>
    )
  }

  return (
    <>
      <AdminPageHeader
        title="Coupons"
        description="Create discount codes, schedule campaigns and see what each one earns. Shoppers enter codes at checkout."
        actions={
          <Button asChild className="h-11 rounded-xl px-5 text-[15px] font-semibold">
            <Link href="/admin/coupons/new">
              <Plus className="size-5" />
              New coupon
            </Link>
          </Button>
        }
      />

      {!data || !summary ? (
        <div role="alert" className="flex items-center gap-3 rounded-3xl bg-destructive/8 px-6 py-5 text-[15px] text-destructive">
          <CircleAlert className="size-5 shrink-0" />
          Coupons are temporarily unavailable. Refresh in a moment.
        </div>
      ) : (
        <div className="space-y-6">
          <section aria-label="Coupon performance" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatTile
              icon={TicketPercent}
              label="Live now"
              value={String(summary.statusCounts.ACTIVE)}
              hint={
                summary.endingSoon ? (
                  <>
                    <Link href={`/admin/coupons/${summary.endingSoon.id}`} className="font-medium text-foreground hover:underline">
                      {summary.endingSoon.code}
                    </Link>{" "}
                    ends in {timeUntil(summary.endingSoon.validUntil, now)}
                  </>
                ) : (
                  `${summary.statusCounts.SCHEDULED} scheduled`
                )
              }
            />
            <StatTile
              icon={ReceiptText}
              label="Orders with a coupon"
              value={summary.orderCount.toLocaleString("en-US")}
              hint="Excludes cancelled orders"
            />
            <StatTile icon={Wallet} label="Discount given" value={formatPrice(summary.discountGiven)} hint="Money off items" />
            <StatTile
              icon={ArrowUp}
              label="Coupon revenue"
              value={formatPrice(summary.revenue)}
              hint="Order totals using a coupon"
            />
          </section>

          <nav aria-label="Filter coupons" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {TABS.map((item) => {
              const active = item.key === tab
              const count = item.key === "all" ? summary.total : summary.statusCounts[item.key]
              return (
                <Link
                  key={item.key}
                  href={href({ ...state, tab: item.key, page: 1 })}
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
                      active ? "bg-background/15 text-background" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </Link>
              )
            })}
          </nav>

          <section className="overflow-hidden rounded-3xl border border-border/70 bg-card">
            <div className="border-b border-border/70 px-6 py-4">
              <UrlSearch initial={q} placeholder="Search by code…" label="Search coupons" />
            </div>

            {data.items.length === 0 ? (
              <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                  <TicketPercent className="size-7 text-muted-foreground" />
                </span>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-foreground">
                    {q || tab !== "all" ? "No coupons match" : "No coupons yet"}
                  </p>
                  <p className="text-[15px] text-muted-foreground">
                    {q || tab !== "all"
                      ? "Try another search or filter."
                      : "Create a code for a sale, a welcome offer or free delivery."}
                  </p>
                </div>
                {q || tab !== "all" ? (
                  <Button asChild variant="outline" className="h-10 rounded-xl">
                    <Link href="/admin/coupons">Clear filters</Link>
                  </Button>
                ) : (
                  <Button asChild className="h-10 rounded-xl">
                    <Link href="/admin/coupons/new">
                      <Plus className="size-4" />
                      New coupon
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <Table className="text-[15px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent [&>th]:h-12 [&>th]:text-[13px] [&>th]:font-medium [&>th]:text-muted-foreground">
                    {sortLink("code", "Coupon", "pl-6")}
                    <TableHead>Offer</TableHead>
                    <TableHead>Status</TableHead>
                    {sortLink("usedCount", "Usage")}
                    {sortLink("validUntil", "Ends")}
                    <TableHead className="text-right">Earned</TableHead>
                    <TableHead className="w-14 pr-6">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((coupon) => (
                    <TableRow key={coupon.id} className="group relative [&>td]:py-3.5">
                      <TableCell className="max-w-64 pl-6">
                        {/* The anchor stretches over the whole row. */}
                        <Link href={`/admin/coupons/${coupon.id}`} className="absolute inset-0" aria-label={`Edit ${coupon.code}`} />
                        <CouponCode code={coupon.code} />
                        {coupon.description && (
                          <span className="mt-1.5 block truncate text-sm text-muted-foreground">{coupon.description}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="block font-medium text-foreground">{offerHeadline(coupon)}</span>
                        <span className="block max-w-56 truncate text-sm text-muted-foreground">
                          {offerConditions(coupon).join(" · ") || "Any order"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <CouponStatusBadge status={coupon.status} />
                      </TableCell>
                      <TableCell>
                        <Usage coupon={coupon} />
                      </TableCell>
                      <TableCell>
                        <Validity coupon={coupon} now={now} />
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="block font-medium text-foreground tabular-nums">{formatPrice(coupon.revenue)}</span>
                        <span className="block text-sm text-muted-foreground tabular-nums">
                          {coupon.orderCount} {coupon.orderCount === 1 ? "order" : "orders"}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <CouponRowActions coupon={coupon} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {data.meta.total > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {(page - 1) * COUPON_PAGE_SIZE + 1}–{Math.min(page * COUPON_PAGE_SIZE, data.meta.total)}
                  </span>{" "}
                  of <span className="font-medium text-foreground tabular-nums">{data.meta.total}</span>
                </p>
                {data.meta.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button asChild={page > 1} variant="outline" size="icon" className="size-9 rounded-lg" disabled={page <= 1} aria-label="Previous page">
                      {page > 1 ? (
                        <Link href={href({ ...state, page: page - 1 })}>
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
                        <Link href={href({ ...state, page: page + 1 })}>
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
