import Link from "next/link"
import { LinkPending } from "@/components/catalog/link-pending"
import { ANALYTICS_RANGES, type AnalyticsRange } from "@/lib/backend-analytics"
import { cn } from "@/lib/utils"

const LABELS: Readonly<Record<AnalyticsRange, string>> = {
  7: "7 days",
  30: "30 days",
  90: "90 days",
}

/** Date-range presets as links (shareable URL state, works without JS). */
export function RangePicker({ value }: { value: AnalyticsRange }) {
  return (
    <nav
      aria-label="Reporting period"
      className="inline-flex rounded-2xl bg-muted p-1"
    >
      {ANALYTICS_RANGES.map((range) => (
        <Link
          key={range}
          href={range === 30 ? "/admin" : `/admin?range=${range}`}
          scroll={false}
          aria-current={value === range ? "page" : undefined}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[15px] font-medium transition-colors duration-150",
            value === range
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {LABELS[range]}
          <LinkPending className="size-3.5" />
        </Link>
      ))}
    </nav>
  )
}
