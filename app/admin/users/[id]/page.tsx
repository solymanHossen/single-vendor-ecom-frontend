import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowUpRight, Info, KeyRound, Mail, Phone } from "lucide-react"
import { AccessDenied } from "@/components/admin/access-denied"
import { Panel } from "@/components/orders/order-details"
import { UserAccessEditor } from "@/components/admin/users/user-access-editor"
import { UserAccountActions } from "@/components/admin/users/user-account-actions"
import { AccessBadge, AccountStatusBadge } from "@/components/admin/users/user-badges"
import { UserSessions } from "@/components/admin/users/user-sessions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getAdminAccess } from "@/lib/admin-access"
import {
  getAdminUser,
  getAuditLogs,
  getPermissionCatalog,
  getStaffRoles,
} from "@/lib/backend-access"
import { formatDate, formatPrice, formatRelative } from "@/lib/format"
import { getInitials } from "@/lib/utils"

export const metadata: Metadata = { title: "User · Admin" }

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[15px]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{children}</dd>
    </div>
  )
}

export default async function AdminUserPage({ params }: PageProps<"/admin/users/[id]">) {
  const access = await getAdminAccess()
  if (!access.can("customers.view")) return <AccessDenied area="users" />
  const isOwner = access.can("owner")

  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) notFound()
  const user = await getAdminUser(access.accessToken, id)
  if (!user) notFound()

  const [roles, catalog, activity] = isOwner
    ? await Promise.all([
        getStaffRoles(access.accessToken),
        getPermissionCatalog(access.accessToken),
        getAuditLogs(access.accessToken, { page: 1, targetType: "user", targetId: String(id), limit: 8 }),
      ])
    : [[], [], null]

  // The same guardrails the API enforces, explained instead of hidden.
  const isSelf = user.id === access.profile.id
  const protectedReason = isSelf
    ? "This is your own account — manage it from Profile & security."
    : user.role === "SUPER_ADMIN"
      ? "Super admin accounts can't be changed from the admin console."
      : !access.can("customers.manage")
        ? "View only — your role can't change accounts."
        : null

  const formatted = Object.fromEntries(
    user.sessions.map((session) => [
      session.id,
      { signedIn: formatRelative(session.createdAt), expires: formatDate(session.expiresAt) },
    ])
  )

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Users
      </Link>

      <section className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-border/70 bg-card p-6 sm:p-8">
        <div className="flex min-w-0 items-center gap-5">
          <Avatar className="size-20">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
            <AvatarFallback className="text-xl">{getInitials(user.name, user.email)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {user.name ?? "No name"}
              {isSelf && <span className="ml-2 text-base font-normal text-muted-foreground">(you)</span>}
            </h1>
            <p className="truncate text-[15px] text-muted-foreground">{user.email}</p>
            <div className="flex flex-wrap gap-2">
              <AccessBadge user={user} />
              <AccountStatusBadge user={user} />
            </div>
          </div>
        </div>
        {protectedReason ? (
          <p className="flex max-w-sm items-start gap-2 rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {protectedReason}
          </p>
        ) : (
          <UserAccountActions
            userId={user.id}
            email={user.email}
            isActive={user.isActive}
            isLocked={user.isLocked}
            activeSessions={user.activeSessions}
          />
        )}
      </section>

      <div className="grid items-start gap-6 *:min-w-0 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <Panel title="Account">
            <dl className="space-y-3">
              <Row label="Member since">{formatDate(user.createdAt)}</Row>
              <Row label="Last sign-in">{user.lastLoginAt ? formatRelative(user.lastLoginAt) : "Never"}</Row>
              <Row label="Signs in with">
                {[user.hasPassword && "Password", user.hasGoogle && "Google"].filter(Boolean).join(" · ") || "—"}
              </Row>
              {user.isLocked && user.lockedUntil && (
                <Row label="Locked until">{formatDate(user.lockedUntil, true)}</Row>
              )}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-border/70 pt-5 text-[15px]">
              <a href={`mailto:${user.email}`} className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <Mail className="size-4" aria-hidden="true" />
                Email
              </a>
              {user.phone && (
                <a href={`tel:${user.phone}`} className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-muted-foreground tabular-nums hover:bg-muted hover:text-foreground">
                  <Phone className="size-4" aria-hidden="true" />
                  {user.phone}
                </a>
              )}
            </div>
          </Panel>

          <Panel title={`Signed-in devices · ${user.activeSessions}`}>
            <UserSessions
              userId={user.id}
              sessions={user.sessions}
              canManage={!protectedReason}
              formatted={formatted}
            />
          </Panel>

          {activity && (
            <Panel
              title="Recent activity"
              action={
                <Link href="/admin/activity" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Full log →
                </Link>
              }
            >
              {activity.items.length === 0 ? (
                <p className="text-[15px] text-muted-foreground">No account changes recorded yet.</p>
              ) : (
                <ol className="space-y-3.5">
                  {activity.items.map((entry) => (
                    <li key={entry.id} className="flex gap-3 text-[15px]">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/40" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block text-foreground">{entry.summary}</span>
                        <span className="block text-sm text-muted-foreground">
                          {entry.actor?.name ?? entry.actorEmail ?? "System"} · {formatRelative(entry.createdAt)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>
          )}
        </div>

        <div className="space-y-6">
          <Panel title="Orders">
            <dl className="space-y-3">
              <Row label="Orders">{user.orderCount}</Row>
              <Row label="Spent (delivered)">{formatPrice(user.totalSpent)}</Row>
              <Row label="Last order">{user.lastOrderAt ? formatRelative(user.lastOrderAt) : "—"}</Row>
              <Row label="Saved addresses">{user.addressCount}</Row>
            </dl>
            {user.orderCount > 0 && access.can("orders.view") && (
              <Button asChild variant="outline" className="mt-5 h-10 w-full rounded-xl">
                <Link href={`/admin/orders?q=${encodeURIComponent(user.email)}`}>
                  View their orders
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            )}
          </Panel>

          {isOwner && (
            <Panel title="Access">
              {isSelf || user.role === "SUPER_ADMIN" ? (
                <p className="flex items-start gap-2 text-[15px] text-muted-foreground">
                  <KeyRound className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {isSelf ? "You can't change your own access." : "Super admins always have full access."}
                </p>
              ) : (
                <UserAccessEditor
                  userId={user.id}
                  email={user.email}
                  current={user.role === "USER" ? "customer" : (user.staffRole?.id ?? null)}
                  roles={roles}
                  catalog={catalog}
                />
              )}
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}
