import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, ChevronRight, CircleAlert, UsersRound } from "lucide-react"
import { AccessDenied } from "@/components/admin/access-denied"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { UrlSearch } from "@/components/admin/url-search"
import { AccessBadge, AccountStatusBadge } from "@/components/admin/users/user-badges"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  ADMIN_USERS_PAGE_SIZE,
  getAdminUsers,
  type AdminUserPage,
  type UserStatus,
  type UserType,
} from "@/lib/backend-access"
import { formatDate, formatRelative } from "@/lib/format"
import { cn, getInitials } from "@/lib/utils"

export const metadata: Metadata = { title: "Users · Admin" }

type Tab = "all" | "customers" | "staff" | "inactive" | "locked"

const TAB_QUERY: Record<Tab, { type: UserType; status: UserStatus }> = {
  all: { type: "all", status: "all" },
  customers: { type: "customers", status: "all" },
  staff: { type: "staff", status: "all" },
  inactive: { type: "all", status: "inactive" },
  locked: { type: "all", status: "locked" },
}

function href(params: { tab?: Tab; q?: string; page?: number }): string {
  const search = new URLSearchParams()
  if (params.tab && params.tab !== "all") search.set("tab", params.tab)
  if (params.q) search.set("q", params.q)
  if (params.page && params.page > 1) search.set("page", String(params.page))
  const qs = search.toString()
  return qs ? `/admin/users?${qs}` : "/admin/users"
}

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const access = await getAdminAccess()
  if (!access.can("customers.view")) return <AccessDenied area="users" />
  const isOwner = access.can("owner")

  const params = await searchParams
  const requested = typeof params.tab === "string" ? params.tab : "all"
  const tab: Tab = requested in TAB_QUERY && (requested !== "staff" || isOwner) ? (requested as Tab) : "all"
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 150) : ""
  const page = Math.max(1, Number(params.page) || 1)

  let data: AdminUserPage | null = null
  try {
    data = await getAdminUsers(access.accessToken, { page, search: q || undefined, ...TAB_QUERY[tab] })
  } catch (error: unknown) {
    console.error("[admin] users unavailable:", error)
  }

  const tabs: Array<{ key: Tab; label: string; count?: number; tone?: "warning" | "critical" }> = data
    ? [
        { key: "all", label: isOwner ? "Everyone" : "All customers", count: data.counts.all },
        ...(isOwner
          ? [
              { key: "customers" as const, label: "Customers", count: data.counts.customers },
              { key: "staff" as const, label: "Staff", count: data.counts.staff },
            ]
          : []),
        { key: "inactive", label: "Deactivated", count: data.counts.inactive, tone: "critical" },
        { key: "locked", label: "Locked", count: data.counts.locked, tone: "warning" },
      ]
    : []

  return (
    <>
      <AdminPageHeader
        title="Users"
        description={
          isOwner
            ? "Customers and staff in one place. Help with sign-in problems, manage access and keep accounts safe."
            : "Look up customers, help with sign-in problems and keep accounts safe."
        }
      />

      {!data ? (
        <div role="alert" className="flex items-center gap-3 rounded-3xl bg-destructive/8 px-6 py-5 text-[15px] text-destructive">
          <CircleAlert className="size-5 shrink-0" />
          Users are temporarily unavailable. Refresh in a moment.
        </div>
      ) : (
        <div className="space-y-6">
          <nav aria-label="Filter users" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {tabs.map((item) => {
              const active = item.key === tab
              const attention = item.tone && (item.count ?? 0) > 0
              return (
                <Link
                  key={item.key}
                  href={href({ tab: item.key, q })}
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
                        : attention && item.tone === "critical"
                          ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                          : attention
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-muted text-muted-foreground"
                    )}
                  >
                    {item.count}
                  </span>
                </Link>
              )
            })}
          </nav>

          <section className="overflow-hidden rounded-3xl border border-border/70 bg-card">
            <div className="border-b border-border/70 px-6 py-4">
              <UrlSearch initial={q} placeholder="Search by name, email or phone…" label="Search users" />
            </div>

            {data.items.length === 0 ? (
              <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                  <UsersRound className="size-7 text-muted-foreground" />
                </span>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-foreground">No users found</p>
                  <p className="text-[15px] text-muted-foreground">Try another search or filter.</p>
                </div>
                {(q || tab !== "all") && (
                  <Button asChild variant="outline" className="h-10 rounded-xl">
                    <Link href="/admin/users">Clear filters</Link>
                  </Button>
                )}
              </div>
            ) : (
              <Table className="text-[15px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent [&>th]:h-12 [&>th]:text-[13px] [&>th]:font-medium [&>th]:text-muted-foreground">
                    <TableHead className="pl-6">User</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead>Last sign-in</TableHead>
                    <TableHead className="pr-6">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((user) => (
                    <TableRow key={user.id} className="group relative [&>td]:py-3.5">
                      <TableCell className="max-w-72 pl-6">
                        <span className="flex items-center gap-3">
                          <Avatar className="size-10">
                            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
                            <AvatarFallback className="text-xs">{getInitials(user.name, user.email)}</AvatarFallback>
                          </Avatar>
                          <span className="min-w-0">
                            {/* The anchor stretches over the whole row. */}
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="block truncate font-medium text-foreground after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4"
                            >
                              {user.name ?? "No name"}
                              {user.id === access.profile.id && (
                                <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>
                              )}
                            </Link>
                            <span className="block truncate text-sm text-muted-foreground">{user.email}</span>
                          </span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <AccessBadge user={user} />
                      </TableCell>
                      <TableCell>
                        <AccountStatusBadge user={user} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{user.orderCount}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.lastLoginAt ? formatRelative(user.lastLoginAt) : "Never"}
                      </TableCell>
                      <TableCell className="pr-6 text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
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
                    {(page - 1) * ADMIN_USERS_PAGE_SIZE + 1}–{Math.min(page * ADMIN_USERS_PAGE_SIZE, data.meta.total)}
                  </span>{" "}
                  of <span className="font-medium text-foreground tabular-nums">{data.meta.total}</span>
                </p>
                {data.meta.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    {page > 1 ? (
                      <Button asChild variant="outline" size="icon" className="size-9 rounded-lg">
                        <Link href={href({ tab, q, page: page - 1 })} aria-label="Previous page">
                          <ChevronLeft className="size-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" size="icon" className="size-9 rounded-lg" disabled aria-label="Previous page">
                        <ChevronLeft className="size-4" />
                      </Button>
                    )}
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {page} / {data.meta.totalPages}
                    </span>
                    {page < data.meta.totalPages ? (
                      <Button asChild variant="outline" size="icon" className="size-9 rounded-lg">
                        <Link href={href({ tab, q, page: page + 1 })} aria-label="Next page">
                          <ChevronRight className="size-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" size="icon" className="size-9 rounded-lg" disabled aria-label="Next page">
                        <ChevronRight className="size-4" />
                      </Button>
                    )}
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
