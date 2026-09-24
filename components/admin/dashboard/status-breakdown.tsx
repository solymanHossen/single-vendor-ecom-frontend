import type { AnalyticsDashboard } from "@/lib/backend-analytics"
import { formatCount } from "./format"
import { ORDER_STATUS_META } from "@/components/orders/status-badge"

/** Order lifecycle as a bar list: one series → one colour; the icon + label carry status. */
export function StatusBreakdown({
  statuses,
}: {
  statuses: AnalyticsDashboard["ordersByStatus"]
}) {
  const total = statuses.reduce((sum, row) => sum + row.count, 0)
  const max = Math.max(1, ...statuses.map((row) => row.count))

  return (
    <div className="flex h-full flex-col gap-5 rounded-3xl border border-border/70 bg-card p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">
          Orders by status
        </h2>
        <p className="text-[15px] text-muted-foreground">
          {formatCount(total)} orders placed in this period
        </p>
      </div>
      <ul className="flex flex-1 flex-col justify-between gap-4">
        {statuses.map((row) => {
          const meta = ORDER_STATUS_META[row.status]
          const Icon = meta.icon
          const share = total === 0 ? 0 : Math.round((row.count / total) * 100)
          return (
            <li key={row.status} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-[15px]">
                <span className="flex items-center gap-2 text-foreground">
                  <Icon
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  {meta.label}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  <span className="font-semibold text-foreground">
                    {formatCount(row.count)}
                  </span>{" "}
                  · {share}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(row.count / max) * 100}%`,
                    backgroundColor: "var(--chart-1)",
                  }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
