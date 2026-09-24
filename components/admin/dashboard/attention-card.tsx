import Image from "next/image"
import {
  MessageSquareWarning,
  PackageOpen,
  RotateCcw,
  Star,
  type LucideIcon,
} from "lucide-react"
import type { AnalyticsDashboard } from "@/lib/backend-analytics"
import { isOptimizableImage } from "@/lib/images"
import { cn } from "@/lib/utils"
import { formatCount } from "./format"

function QueueItem({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: LucideIcon
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-muted/50 p-3.5">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          value > 0
            ? "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
            : "bg-background text-muted-foreground"
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 text-sm text-muted-foreground">
        {label}
      </span>
      <span className="text-xl font-semibold text-foreground tabular-nums">
        {formatCount(value)}
      </span>
    </li>
  )
}

/** Work queue + stock alerts: what an admin should act on today. */
export function AttentionCard({
  operations,
  lowStock,
}: {
  operations: AnalyticsDashboard["operations"]
  lowStock: AnalyticsDashboard["lowStock"]
}) {
  return (
    <div className="flex h-full flex-col gap-6 rounded-3xl border border-border/70 bg-card p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">
          Needs attention
        </h2>
        <p className="text-[15px] text-muted-foreground">
          Open work across the store
        </p>
      </div>

      <ul className="grid gap-2.5">
        <QueueItem
          label="Orders to fulfil"
          value={operations.awaitingFulfilment}
          icon={PackageOpen}
        />
        <QueueItem
          label="Open support tickets"
          value={operations.openTickets}
          icon={MessageSquareWarning}
        />
        <QueueItem
          label="Reviews to moderate"
          value={operations.pendingReviews}
          icon={Star}
        />
        <QueueItem
          label="Return requests"
          value={operations.pendingReturns}
          icon={RotateCcw}
        />
      </ul>

      <div className="space-y-3 border-t border-border/70 pt-5">
        <p className="text-sm font-semibold text-foreground">Low stock</p>
        {lowStock.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Every product is well stocked.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {lowStock.map((product) => (
              <li key={product.id} className="flex items-center gap-3">
                <span className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {product.thumbnailUrl && (
                    <Image
                      src={product.thumbnailUrl}
                      alt=""
                      fill
                      sizes="40px"
                      unoptimized={!isOptimizableImage(product.thumbnailUrl)}
                      className="object-cover"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                  {product.name}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                    product.stockQuantity === 0
                      ? "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300"
                      : "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                  )}
                >
                  {product.stockQuantity === 0
                    ? "Out of stock"
                    : `${product.stockQuantity} left`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
