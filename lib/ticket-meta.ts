import {
  Banknote,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CircleHelp,
  Hourglass,
  Lock,
  Package,
  PackageSearch,
  RotateCcw,
  Truck,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import type { TicketCategory, TicketPriority, TicketStatus } from "@/lib/backend-tickets"

export type Tone = "good" | "info" | "warning" | "critical" | "neutral"

export const TONE_CLASS: Record<Tone, string> = {
  good: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  info: "bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300",
  warning: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  critical: "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300",
  neutral: "bg-muted text-muted-foreground",
}

/** Staff wording and shopper wording differ: "Waiting on customer" vs "Awaiting your reply". */
export const TICKET_STATUS_META: Record<
  TicketStatus,
  { staff: string; customer: string; icon: LucideIcon; tone: Tone }
> = {
  OPEN: { staff: "Open", customer: "Received", icon: CircleDot, tone: "info" },
  IN_PROGRESS: { staff: "In progress", customer: "In progress", icon: CircleDashed, tone: "info" },
  WAITING: { staff: "Waiting on customer", customer: "Awaiting your reply", icon: Hourglass, tone: "warning" },
  RESOLVED: { staff: "Resolved", customer: "Resolved", icon: CircleCheck, tone: "good" },
  CLOSED: { staff: "Closed", customer: "Closed", icon: Lock, tone: "neutral" },
}

export const TICKET_CATEGORY_META: Record<
  TicketCategory,
  { label: string; hint: string; icon: LucideIcon }
> = {
  ORDER: { label: "An order", hint: "Changes, cancellations, order status", icon: Package },
  DELIVERY: { label: "Delivery", hint: "Late, missing or tracking", icon: Truck },
  PAYMENT: { label: "Payment", hint: "Charges, refunds, bKash, COD", icon: Banknote },
  RETURN: { label: "Return or exchange", hint: "Send something back", icon: RotateCcw },
  PRODUCT: { label: "A product", hint: "Damaged, faulty or a question", icon: PackageSearch },
  ACCOUNT: { label: "My account", hint: "Sign-in, profile, security", icon: UserRound },
  OTHER: { label: "Something else", hint: "Anything we didn't list", icon: CircleHelp },
}

/** Categories where linking an order helps us most. */
export const ORDER_CATEGORIES: readonly TicketCategory[] = ["ORDER", "DELIVERY", "PAYMENT", "RETURN", "PRODUCT"]

export const TICKET_PRIORITY_META: Record<TicketPriority, { label: string; tone: Tone; rank: number }> = {
  HIGH: { label: "High", tone: "critical", rank: 3 },
  MEDIUM: { label: "Medium", tone: "warning", rank: 2 },
  LOW: { label: "Low", tone: "neutral", rank: 1 },
}

/** "4 min", "3 h", "2 days" — for response times. */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.max(1, Math.round(minutes))} min`
  const hours = minutes / 60
  if (hours < 48) return `${Number(hours.toFixed(hours < 10 ? 1 : 0))} h`
  return `${Math.round(hours / 24)} days`
}
