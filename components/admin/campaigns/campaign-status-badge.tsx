import { CalendarClock, CircleDashed, History, Radio } from "lucide-react"
import type { CampaignStatus } from "@/lib/backend-campaigns"
import { cn } from "@/lib/utils"

const META: Record<CampaignStatus, { label: string; icon: typeof Radio; className: string }> = {
  LIVE: { label: "Live", icon: Radio, className: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" },
  SCHEDULED: { label: "Scheduled", icon: CalendarClock, className: "bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300" },
  DRAFT: { label: "Draft", icon: CircleDashed, className: "bg-muted text-muted-foreground" },
  ENDED: { label: "Ended", icon: History, className: "bg-muted text-muted-foreground" },
}

/** Icon + label, never colour alone. Live pulses. */
export function CampaignStatusBadge({ status, className }: { status: CampaignStatus; className?: string }) {
  const meta = META[status]
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", meta.className, className)}>
      <meta.icon className={cn("size-3.5", status === "LIVE" && "animate-pulse")} aria-hidden="true" />
      {meta.label}
    </span>
  )
}
