import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  type LucideIcon,
} from "lucide-react"
import type { Metric } from "@/lib/backend-analytics"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  label: string
  metric: Metric
  format: (value: number) => string
  icon: LucideIcon
  rangeDays: number
  /** The dashboard's single lead figure renders larger. */
  hero?: boolean
}

/** Stat tile: label · value · signed delta vs the previous period of equal length. */
export function KpiCard({
  label,
  metric,
  format,
  icon: Icon,
  rangeDays,
  hero = false,
}: KpiCardProps) {
  const change = metric.changePercent
  const DeltaIcon =
    change === null || change === 0
      ? Minus
      : change > 0
        ? ArrowUpRight
        : ArrowDownRight

  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-6 rounded-3xl border border-border/70 bg-card p-6",
        hero && "bg-foreground text-background"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={cn(
            "text-[15px] font-medium",
            hero ? "text-background/70" : "text-muted-foreground"
          )}
        >
          {label}
        </p>
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            hero ? "bg-background/10" : "bg-muted text-foreground"
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
      <div className="space-y-2">
        <p
          className={cn(
            "font-semibold tracking-tight",
            hero ? "text-5xl" : "text-4xl"
          )}
        >
          {format(Number(metric.value))}
        </p>
        <p
          className={cn(
            "flex flex-wrap items-center gap-2 text-sm",
            hero ? "text-background/70" : "text-muted-foreground"
          )}
        >
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
              hero
                ? // The lead card is inverted; a tinted badge would lose contrast
                  // there, so it uses the card's own ink (the arrow shows direction).
                  "bg-background/15 text-background"
                : change === null || change === 0
                  ? "bg-muted text-foreground"
                  : change > 0
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300"
            )}
          >
            <DeltaIcon className="size-3.5" aria-hidden="true" />
            {change === null ? "New" : `${change > 0 ? "+" : ""}${change}%`}
          </span>
          vs previous {rangeDays} days
        </p>
      </div>
    </div>
  )
}
