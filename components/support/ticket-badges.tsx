import { ArrowUp, Minus, ArrowDown } from "lucide-react"
import type { TicketPriority, TicketStatus } from "@/lib/backend-tickets"
import { TICKET_PRIORITY_META, TICKET_STATUS_META, TONE_CLASS } from "@/lib/ticket-meta"
import { cn } from "@/lib/utils"

const PILL = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"

/** Icon + label, never colour alone. */
export function TicketStatusBadge({
  status,
  audience,
  className,
}: {
  status: TicketStatus
  audience: "customer" | "staff"
  className?: string
}) {
  const meta = TICKET_STATUS_META[status]
  return (
    <span className={cn(PILL, TONE_CLASS[meta.tone], className)}>
      <meta.icon className="size-3.5" aria-hidden="true" />
      {audience === "staff" ? meta.staff : meta.customer}
    </span>
  )
}

const PRIORITY_ICON = { HIGH: ArrowUp, MEDIUM: Minus, LOW: ArrowDown } as const

export function TicketPriorityBadge({ priority, className }: { priority: TicketPriority; className?: string }) {
  const meta = TICKET_PRIORITY_META[priority]
  const Icon = PRIORITY_ICON[priority]
  return (
    <span className={cn(PILL, TONE_CLASS[meta.tone], className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  )
}
