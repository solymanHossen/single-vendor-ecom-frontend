import Image from "next/image"
import Link from "next/link"
import { BadgeCheck, MessageSquareReply } from "lucide-react"
import { StarRating } from "@/components/catalog/star-rating"
import { isOptimizableImage } from "@/lib/images"
import type { RatingSummary, ReviewPage } from "@/lib/storefront-types"
import { cn } from "@/lib/utils"

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Dhaka",
})

interface ReviewsSectionProps {
  rating: RatingSummary
  reviews: ReviewPage
  /** Builds the href for a given reviews page (keeps other URL state intact). */
  pageHref: (page: number) => string
}

export function ReviewsSection({
  rating,
  reviews,
  pageHref,
}: ReviewsSectionProps) {
  const stars = ["5", "4", "3", "2", "1"] as const

  return (
    <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
      {/* Summary */}
      <div className="space-y-4">
        <div className="flex items-end gap-3">
          <span className="text-5xl font-bold tracking-tight text-foreground">
            {rating.count > 0 ? rating.average.toFixed(1) : "–"}
          </span>
          <div className="space-y-1 pb-1">
            <StarRating value={rating.average} size="md" />
            <p className="text-xs text-muted-foreground">
              {rating.count} verified{" "}
              {rating.count === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
        <ul className="space-y-1.5">
          {stars.map((star) => {
            const count = rating.distribution[star]
            const percent = rating.count > 0 ? (count / rating.count) * 100 : 0
            return (
              <li key={star} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-muted-foreground">{star} ★</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-amber-400"
                    style={{ width: `${percent}%` }}
                  />
                </span>
                <span className="w-6 text-right text-muted-foreground">
                  {count}
                </span>
              </li>
            )
          })}
        </ul>
        <p className="text-xs text-muted-foreground">
          Only customers who received this product can review it.
        </p>
      </div>

      {/* List */}
      <div className="space-y-6">
        {reviews.items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No reviews yet. Customers can review this product after delivery.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {reviews.items.map((review) => (
              <li key={review.id} className="space-y-3 py-5 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {(review.reviewer.name ?? "C").slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {review.reviewer.name ?? "Customer"}
                      </p>
                      {review.orderId !== null && (
                        <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <BadgeCheck className="size-3.5" />
                          Verified purchase
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating value={review.rating} />
                    <time
                      dateTime={review.createdAt}
                      className="text-xs text-muted-foreground"
                    >
                      {dateFormatter.format(new Date(review.createdAt))}
                    </time>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {review.comment}
                  </p>
                )}

                {review.images.length > 0 && (
                  <ul className="flex gap-2">
                    {review.images.map((image) => (
                      <li
                        key={image.id}
                        className="relative size-20 overflow-hidden rounded-xl bg-muted"
                      >
                        <Image
                          src={image.imageUrl}
                          alt="Customer photo"
                          fill
                          sizes="80px"
                          unoptimized={!isOptimizableImage(image.imageUrl)}
                          className="object-cover"
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {review.reply && (
                  <div className="ml-4 flex gap-2.5 rounded-xl bg-muted/60 p-3.5">
                    <MessageSquareReply className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">
                        Response from AURA
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {review.reply.replyText}
                      </p>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {reviews.meta.totalPages > 1 && (
          <nav aria-label="Review pages" className="flex flex-wrap gap-1.5">
            {Array.from(
              { length: reviews.meta.totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <Link
                key={page}
                href={pageHref(page)}
                scroll={false}
                aria-current={page === reviews.meta.page ? "page" : undefined}
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  page === reviews.meta.page
                    ? "bg-foreground text-background"
                    : "hover:bg-muted"
                )}
              >
                {page}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </div>
  )
}
