import { CircleCheck, CircleSlash, Crown, Lock, ShieldCheck, User } from "lucide-react"
import type { AdminUser } from "@/lib/backend-access"
import { cn } from "@/lib/utils"

const PILL = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"

/** Who the account is: customer, a staff role, or the owner. Icon + label, never colour alone. */
export function AccessBadge({ user }: { user: Pick<AdminUser, "role" | "staffRole"> }) {
  if (user.role === "SUPER_ADMIN") {
    return (
      <span className={cn(PILL, "bg-foreground text-background")}>
        <Crown className="size-3.5" aria-hidden="true" />
        Super admin
      </span>
    )
  }
  if (user.role === "ADMIN") {
    return (
      <span className={cn(PILL, "bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300")}>
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        {user.staffRole?.name ?? "Staff · no role"}
      </span>
    )
  }
  return (
    <span className={cn(PILL, "bg-muted text-muted-foreground")}>
      <User className="size-3.5" aria-hidden="true" />
      Customer
    </span>
  )
}

export function AccountStatusBadge({ user }: { user: Pick<AdminUser, "isActive" | "isLocked"> }) {
  if (!user.isActive) {
    return (
      <span className={cn(PILL, "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300")}>
        <CircleSlash className="size-3.5" aria-hidden="true" />
        Deactivated
      </span>
    )
  }
  if (user.isLocked) {
    return (
      <span className={cn(PILL, "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300")}>
        <Lock className="size-3.5" aria-hidden="true" />
        Locked
      </span>
    )
  }
  return (
    <span className={cn(PILL, "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300")}>
      <CircleCheck className="size-3.5" aria-hidden="true" />
      Active
    </span>
  )
}
