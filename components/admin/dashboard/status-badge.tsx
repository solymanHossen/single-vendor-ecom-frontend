import {
  CircleCheck,
  CircleDashed,
  CircleX,
  Clock,
  RotateCcw,
  Truck,
  type LucideIcon,
} from "lucide-react"
import type { OrderStatus, PaymentStatus } from "@/lib/backend-analytics"
import { cn } from "@/lib/utils"

type Tone = "good" | "warning" | "serious" | "critical" | "neutral"

// Status colour is always paired with an icon and a label, never used alone.
const TONE_CLASS: Readonly<Record<Tone, string>> = {
  good: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  warning:
    "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  serious:
    "bg-orange-50 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300",
  critical: "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300",
  neutral: "bg-muted text-foreground",
}

export const ORDER_STATUS_META: Readonly<
  Record<OrderStatus, { label: string; icon: LucideIcon; tone: Tone }>
> = {
  PENDING: { label: "Pending", icon: Clock, tone: "warning" },
  PROCESSING: { label: "Processing", icon: CircleDashed, tone: "neutral" },
  SHIPPED: { label: "Shipped", icon: Truck, tone: "neutral" },
  DELIVERED: { label: "Delivered", icon: CircleCheck, tone: "good" },
  CANCELLED: { label: "Cancelled", icon: CircleX, tone: "critical" },
  RETURNED: { label: "Returned", icon: RotateCcw, tone: "serious" },
}

const PAYMENT_STATUS_META: Readonly<
  Record<PaymentStatus, { label: string; icon: LucideIcon; tone: Tone }>
> = {
  PAID: { label: "Paid", icon: CircleCheck, tone: "good" },
  UNPAID: { label: "Unpaid", icon: Clock, tone: "warning" },
  FAILED: { label: "Failed", icon: CircleX, tone: "critical" },
  REFUNDED: { label: "Refunded", icon: RotateCcw, tone: "serious" },
}

function Badge({
  label,
  icon: Icon,
  tone,
}: {
  label: string
  icon: LucideIcon
  tone: Tone
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        TONE_CLASS[tone]
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  )
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge {...ORDER_STATUS_META[status]} />
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge {...PAYMENT_STATUS_META[status]} />
}
