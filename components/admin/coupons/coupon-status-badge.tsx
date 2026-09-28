import { CalendarClock, CircleCheck, CircleOff, CircleSlash, History } from "lucide-react"
import type { CouponStatus } from "@/lib/backend-coupons"
import { COUPON_STATUS_META } from "@/lib/coupon-format"
import { cn } from "@/lib/utils"

const PILL = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"

const TONE: Record<CouponStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  SCHEDULED: "bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300",
  USED_UP: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  EXPIRED: "bg-muted text-muted-foreground",
  DISABLED: "bg-muted text-muted-foreground",
}

const ICON = {
  ACTIVE: CircleCheck,
  SCHEDULED: CalendarClock,
  USED_UP: CircleSlash,
  EXPIRED: History,
  DISABLED: CircleOff,
} satisfies Record<CouponStatus, unknown>

/** Icon + label, never colour alone. */
export function CouponStatusBadge({ status, className }: { status: CouponStatus; className?: string }) {
  const Icon = ICON[status]
  return (
    <span className={cn(PILL, TONE[status], className)} title={COUPON_STATUS_META[status].hint}>
      <Icon className="size-3.5" aria-hidden="true" />
      {COUPON_STATUS_META[status].label}
    </span>
  )
}
