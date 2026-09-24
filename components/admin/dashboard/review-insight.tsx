import { Star } from "lucide-react"
import { StarRating } from "@/components/catalog/star-rating"
import type { AnalyticsDashboard } from "@/lib/backend-analytics"
import { formatCount } from "./format"

export function ReviewInsight({
  reviews,
}: {
  reviews: AnalyticsDashboard["reviews"]
}) {
  const max = Math.max(1, ...Object.values(reviews.distribution))
  const stars = ["5", "4", "3", "2", "1"] as const

  return (
    <div className="flex h-full flex-col gap-6 rounded-3xl border border-border/70 bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            Customer reviews
          </h2>
          <p className="text-[15px] text-muted-foreground">
            {formatCount(reviews.approvedCount)} published ·{" "}
            {formatCount(reviews.pendingCount)} awaiting approval
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="space-y-1.5">
          <p className="text-5xl font-semibold tracking-tight text-foreground">
            {reviews.averageRating.toFixed(1)}
          </p>
          <StarRating value={reviews.averageRating} size="md" />
        </div>
        <ul className="flex-1 space-y-1.5" aria-label="Rating distribution">
          {stars.map((star) => {
            const count = reviews.distribution[star]
            return (
              <li key={star} className="flex items-center gap-2.5 text-sm">
                <span className="flex w-7 items-center gap-0.5 text-muted-foreground">
                  {star}
                  <Star className="size-3" aria-hidden="true" />
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${(count / max) * 100}%`,
                      backgroundColor: "var(--chart-1)",
                    }}
                  />
                </span>
                <span className="w-8 text-right text-muted-foreground tabular-nums">
                  {count}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      <ul className="space-y-3 border-t border-border/70 pt-5">
        {reviews.latest.map((review) => (
          <li key={review.id} className="space-y-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-medium text-foreground">
                {review.productName}
              </p>
              <span className="flex shrink-0 items-center gap-2">
                {!review.isApproved && (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                    Pending
                  </span>
                )}
                <StarRating value={review.rating} />
              </span>
            </div>
            <p className="line-clamp-1 text-sm text-muted-foreground">
              {review.comment ?? "No written comment"} —{" "}
              {review.customerName ?? "Customer"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
