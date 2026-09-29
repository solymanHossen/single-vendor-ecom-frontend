import type { Metadata } from "next"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  KeyRound,
  ScrollText,
  Settings,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import { AccessDenied } from "@/components/admin/access-denied"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Button } from "@/components/ui/button"
import { getAdminAccess } from "@/lib/admin-access"
import { getAuditLogs, type AuditArea, type AuditPage } from "@/lib/backend-access"
import { formatDate, formatRelative } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Activity log · Admin" }

const AREAS: Array<{ key: AuditArea | undefined; label: string }> = [
  { key: undefined, label: "Everything" },
  { key: "user", label: "Users" },
  { key: "role", label: "Roles" },
  { key: "settings", label: "Settings" },
  { key: "coupon", label: "Coupons" },
  { key: "campaign", label: "Campaigns" },
  { key: "auth", label: "Sign-in & security" },
]

const AREA_ICON: Record<string, LucideIcon> = {
  user: UserRound,
  role: ShieldCheck,
  settings: Settings,
  auth: KeyRound,
}

function href(area: AuditArea | undefined, page = 1): string {
  const params = new URLSearchParams()
  if (area) params.set("area", area)
  if (page > 1) params.set("page", String(page))
  const qs = params.toString()
  return qs ? `/admin/activity?${qs}` : "/admin/activity"
}

export default async function AdminActivityPage({ searchParams }: PageProps<"/admin/activity">) {
  const access = await getAdminAccess()
  if (!access.can("owner")) return <AccessDenied area="the activity log" ownerOnly />

  const params = await searchParams
  const area = AREAS.find((item) => item.key && item.key === params.area)?.key
  const page = Math.max(1, Number(params.page) || 1)

  let data: AuditPage | null = null
  try {
    data = await getAuditLogs(access.accessToken, { page, area })
  } catch (error: unknown) {
    console.error("[admin] audit log unavailable:", error)
  }

  const retention = data?.retentionDays ?? 90

  return (
    <>
      <AdminPageHeader
        title="Activity log"
        description={`Access changes, account actions, store settings, coupons and security events from the last ${retention} days — who did what, and when. Older entries are removed automatically.`}
      />

      <div className="space-y-6">
        <nav aria-label="Filter activity" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {AREAS.map((item) => {
            const active = item.key === area
            return (
              <Link
                key={item.label}
                href={href(item.key)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center rounded-xl border px-4 text-[15px] font-medium transition-colors",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border/70 bg-card text-foreground hover:border-foreground/40"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {!data ? (
          <div role="alert" className="flex items-center gap-3 rounded-3xl bg-destructive/8 px-6 py-5 text-[15px] text-destructive">
            <CircleAlert className="size-5 shrink-0" />
            The activity log is temporarily unavailable. Refresh in a moment.
          </div>
        ) : data.items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-border/70 bg-card px-6 py-20 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <ScrollText className="size-7 text-muted-foreground" />
            </span>
            <p className="text-lg font-semibold text-foreground">No activity in the last {retention} days</p>
            <p className="text-[15px] text-muted-foreground">Access and security changes will appear here.</p>
          </div>
        ) : (
          <section className="rounded-3xl border border-border/70 bg-card">
            <ol className="divide-y divide-border/70">
              {data.items.map((entry) => {
                const areaKey = entry.action.split(".")[0] ?? ""
                const Icon = AREA_ICON[areaKey] ?? ScrollText
                const target =
                  entry.targetType === "user" && entry.targetId
                    ? `/admin/users/${entry.targetId}`
                    : entry.targetType === "role"
                      ? "/admin/roles"
                      : entry.targetType === "settings"
                        ? "/admin/settings"
                        : null
                return (
                  <li key={entry.id} className="flex gap-4 px-6 py-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <Icon className="size-[18px] text-foreground" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] text-foreground">
                        {target ? (
                          <Link href={target} className="hover:underline hover:underline-offset-4">
                            {entry.summary}
                          </Link>
                        ) : (
                          entry.summary
                        )}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {entry.actor ? (entry.actor.name ?? entry.actor.email) : (entry.actorEmail ?? "System")}
                        {" · "}
                        <time dateTime={entry.createdAt} title={formatDate(entry.createdAt, true)}>
                          {formatRelative(entry.createdAt)}
                        </time>
                        {entry.ipAddress && <span className="font-mono text-xs"> · {entry.ipAddress}</span>}
                      </p>
                    </div>
                    <code className="hidden shrink-0 self-center rounded-lg bg-muted px-2 py-1 text-xs text-muted-foreground sm:block">
                      {entry.action}
                    </code>
                  </li>
                )
              })}
            </ol>
            {data.meta.totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 border-t border-border/70 px-6 py-4">
                <p className="text-sm text-muted-foreground tabular-nums">
                  Page {page} of {data.meta.totalPages} · {data.meta.total} events
                </p>
                <div className="flex gap-2">
                  {page > 1 ? (
                    <Button asChild variant="outline" size="icon" className="size-9 rounded-lg">
                      <Link href={href(area, page - 1)} aria-label="Newer">
                        <ChevronLeft className="size-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="icon" className="size-9 rounded-lg" disabled aria-label="Newer">
                      <ChevronLeft className="size-4" />
                    </Button>
                  )}
                  {page < data.meta.totalPages ? (
                    <Button asChild variant="outline" size="icon" className="size-9 rounded-lg">
                      <Link href={href(area, page + 1)} aria-label="Older">
                        <ChevronRight className="size-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="icon" className="size-9 rounded-lg" disabled aria-label="Older">
                      <ChevronRight className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  )
}
