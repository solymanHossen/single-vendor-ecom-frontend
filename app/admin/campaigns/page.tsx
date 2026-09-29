import type { Metadata } from "next"
import Link from "next/link"
import { CircleAlert, Clock, Megaphone, Plus } from "lucide-react"
import { AccessDenied } from "@/components/admin/access-denied"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { UrlSearch } from "@/components/admin/url-search"
import { CampaignActions } from "@/components/admin/campaigns/campaign-actions"
import { CampaignStatusBadge } from "@/components/admin/campaigns/campaign-status-badge"
import { DEFAULT_ACCENT } from "@/components/campaigns/campaign-hero"
import { Button } from "@/components/ui/button"
import { getAdminAccess } from "@/lib/admin-access"
import { getAdminCampaigns, type Campaign, type CampaignPage, type CampaignStatus } from "@/lib/backend-campaigns"
import { formatDate, formatPrice, timeUntil } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Campaigns · Admin" }

type Tab = CampaignStatus | "ALL"
const TABS: Array<{ key: Tab; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "LIVE", label: "Live" },
  { key: "SCHEDULED", label: "Scheduled" },
  { key: "DRAFT", label: "Drafts" },
  { key: "ENDED", label: "Ended" },
]

function When({ campaign, now }: { campaign: Campaign; now: number }) {
  if (campaign.status === "LIVE") {
    const soon = new Date(campaign.endsAt).getTime() - now < 86_400_000
    return (
      <span className={cn("inline-flex items-center gap-1 text-sm", soon ? "font-medium text-amber-700 dark:text-amber-400" : "text-muted-foreground")}>
        <Clock className="size-3.5" aria-hidden="true" /> Ends in {timeUntil(campaign.endsAt, now)}
      </span>
    )
  }
  if (campaign.status === "SCHEDULED") return <span className="text-sm text-muted-foreground">Starts {formatDate(campaign.startsAt, true)}</span>
  if (campaign.status === "ENDED") return <span className="text-sm text-muted-foreground">Ended {formatDate(campaign.endsAt)}</span>
  return <span className="text-sm text-muted-foreground">{formatDate(campaign.startsAt)} – {formatDate(campaign.endsAt)}</span>
}

export default async function AdminCampaignsPage({ searchParams }: PageProps<"/admin/campaigns">) {
  const access = await getAdminAccess()
  if (!access.can("campaigns.manage")) return <AccessDenied area="campaigns" />

  const params = await searchParams
  const tab: Tab = TABS.some((item) => item.key === params.status) ? (params.status as Tab) : "ALL"
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : ""
  const page = Math.max(1, Number(params.page) || 1)

  let data: CampaignPage | null = null
  try {
    data = await getAdminCampaigns(access.accessToken, { page, status: tab, search: q || undefined })
  } catch (error: unknown) {
    console.error("[admin] campaigns unavailable:", error)
  }
  // eslint-disable-next-line react-hooks/purity -- request time for "ends in"
  const now = Date.now()
  const tabHref = (key: Tab) => {
    const search = new URLSearchParams()
    if (key !== "ALL") search.set("status", key)
    if (q) search.set("q", q)
    const qs = search.toString()
    return qs ? `/admin/campaigns?${qs}` : "/admin/campaigns"
  }

  return (
    <>
      <AdminPageHeader
        title="Campaigns"
        description="Time-limited sales with their own page and countdown. Prices switch on and off automatically — in the cart, at checkout and across the store."
        actions={
          <Button asChild className="h-11 rounded-xl px-5 text-[15px] font-semibold">
            <Link href="/admin/campaigns/new">
              <Plus className="size-5" /> New campaign
            </Link>
          </Button>
        }
      />

      {!data ? (
        <div role="alert" className="flex items-center gap-3 rounded-3xl bg-destructive/8 px-6 py-5 text-[15px] text-destructive">
          <CircleAlert className="size-5 shrink-0" /> Campaigns are temporarily unavailable. Refresh in a moment.
        </div>
      ) : (
        <div className="space-y-6">
          <nav aria-label="Filter campaigns" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {TABS.map((item) => {
              const active = item.key === tab
              const count = data.counts[item.key]
              return (
                <Link
                  key={item.key}
                  href={tabHref(item.key)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-11 shrink-0 items-center gap-2.5 rounded-xl border px-4 text-[15px] font-medium transition-colors",
                    active ? "border-foreground bg-foreground text-background" : "border-border/70 bg-card text-foreground hover:border-foreground/40"
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                      active ? "bg-background/15 text-background" : item.key === "LIVE" && count > 0 ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" : "bg-muted text-muted-foreground"
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
              <UrlSearch initial={q} placeholder="Search campaigns…" label="Search campaigns" />
            </div>
            {data.items.length === 0 ? (
              <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                  <Megaphone className="size-7 text-muted-foreground" />
                </span>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-foreground">{q || tab !== "ALL" ? "No campaigns here" : "Run your first sale"}</p>
                  <p className="text-[15px] text-muted-foreground">
                    {q || tab !== "ALL" ? "Try another filter or search." : "Eid, 11.11, a weekend flash sale — pick products, set a discount and a countdown."}
                  </p>
                </div>
                {!q && tab === "ALL" && (
                  <Button asChild className="h-10 rounded-xl">
                    <Link href="/admin/campaigns/new"><Plus className="size-4" /> New campaign</Link>
                  </Button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-border/70">
                {data.items.map((campaign) => (
                  <li key={campaign.id} className="group relative flex flex-wrap items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/40">
                    <span
                      className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white"
                      style={{ backgroundColor: campaign.accentColor ?? DEFAULT_ACCENT }}
                      aria-hidden="true"
                    >
                      {campaign.discountType === "PERCENTAGE" ? `${Number(campaign.discountValue)}%` : "৳"}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Link href={`/admin/campaigns/${campaign.id}`} className="truncate font-semibold text-foreground after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4">
                          {campaign.name}
                        </Link>
                        <CampaignStatusBadge status={campaign.status} />
                        {campaign.isFeatured && campaign.isActive && <span className="text-xs font-medium text-muted-foreground">★ Homepage</span>}
                      </div>
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{campaign.label}</span>
                        <When campaign={campaign} now={now} />
                        <span>
                          {[
                            campaign.categoryCount > 0 && `${campaign.categoryCount} ${campaign.categoryCount === 1 ? "category" : "categories"}`,
                            campaign.productCount > 0 && `${campaign.productCount} ${campaign.productCount === 1 ? "product" : "products"}`,
                          ]
                            .filter(Boolean)
                            .join(" + ") || "Nothing added yet"}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground tabular-nums">{formatPrice(campaign.stats.revenue)}</p>
                      <p className="text-sm text-muted-foreground tabular-nums">
                        {campaign.stats.units} sold · {campaign.stats.orders} {campaign.stats.orders === 1 ? "order" : "orders"}
                      </p>
                    </div>
                    <CampaignActions campaign={campaign} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  )
}
