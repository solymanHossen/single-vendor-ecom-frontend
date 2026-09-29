import Link from "next/link"
import {
  BadgeCheck,
  Camera,
  ChevronLeft,
  ChevronRight,
  MessageSquareQuote,
  Store,
  ThumbsUp,
  X,
} from "lucide-react"
import { SortSelect } from "@/components/catalog/sort-select"
import { StarRating } from "@/components/catalog/star-rating"
import { HelpfulButton } from "@/components/reviews/helpful-button"
import { ReviewComposer } from "@/components/reviews/review-composer"
import { ReviewPhotos } from "@/components/reviews/review-photos"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  REVIEW_SORTS,
  REVIEWS_PAGE_SIZE,
  type MyReviewStatus,
  type ProductReviews,
  type Review,
  type ReviewQuery,
} from "@/lib/backend-reviews"
import { formatDate } from "@/lib/format"
import { cn, getInitials } from "@/lib/utils"

interface ReviewsSectionProps {
  productId: number
  productName: string
  storeName: string
  data: ProductReviews
  query: ReviewQuery
  /** Builds a link to this section with some query values changed (page resets). */
  href: (next: Partial<ReviewQuery>) => string
  status: MyReviewStatus | null
  signedIn: boolean
  loginHref: string
  autoOpen: boolean
}

const STARS = [5, 4, 3, 2, 1] as const

function ReviewCard({
  review,
  storeName,
  voted,
  isOwn,
  signedIn,
  loginHref,
}: {
  review: Review
  storeName: string
  voted: boolean
  isOwn: boolean
  signedIn: boolean
  loginHref: string
}) {
  return (
    <article className="space-y-4 rounded-3xl border border-border/70 bg-card p-5 sm:p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-11">
            {review.reviewer.avatarUrl && (
              <AvatarImage src={review.reviewer.avatarUrl} alt="" />
            )}
            <AvatarFallback className="text-sm">
              {getInitials(review.reviewer.name, null)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">
              {review.reviewer.name}
              {isOwn && (
                <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                  (you)
                </span>
              )}
            </p>
            {review.verified && (
              <p className="flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                Verified purchase
              </p>
            )}
          </div>
        </div>
        <time
          dateTime={review.createdAt}
          className="shrink-0 text-sm text-muted-foreground"
        >
          {formatDate(review.createdAt)}
        </time>
      </header>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <StarRating value={review.rating} size="md" />
          {review.title && (
            <h3 className="text-[15px] font-semibold text-foreground">
              {review.title}
            </h3>
          )}
        </div>
        {review.variantLabel && (
          <p className="text-sm text-muted-foreground">
            Bought: {review.variantLabel}
          </p>
        )}
        {review.comment && (
          <p className="text-[15px] leading-relaxed break-words whitespace-pre-line text-foreground/90">
            {review.comment}
          </p>
        )}
      </div>

      <ReviewPhotos photos={review.images} reviewer={review.reviewer.name} />

      {review.reply && (
        <div className="flex gap-3 rounded-2xl bg-muted/60 p-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background shadow-xs">
            <Store className="size-4 text-foreground" aria-hidden="true" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Response from {storeName}
              <span className="ml-2 font-normal text-muted-foreground">
                {formatDate(review.reply.createdAt)}
              </span>
            </p>
            <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
              {review.reply.text}
            </p>
          </div>
        </div>
      )}

      {(!isOwn || review.helpfulCount > 0 || review.edited) && (
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <HelpfulButton
            reviewId={review.id}
            count={review.helpfulCount}
            voted={voted}
            signedIn={signedIn}
            isOwn={isOwn}
            loginHref={loginHref}
          />
          {review.edited && (
            <span className="text-xs text-muted-foreground">Edited</span>
          )}
        </footer>
      )}
    </article>
  )
}

export function ReviewsSection({
  productId,
  productName,
  storeName,
  data,
  query,
  href,
  status,
  signedIn,
  loginHref,
  autoOpen,
}: ReviewsSectionProps) {
  const { summary, items, meta } = data
  const filtered = !!query.rating || !!query.withPhotos
  const voted = new Set(status?.votedReviewIds ?? [])
  const ownId = status?.review?.id ?? null
  const first = (meta.page - 1) * REVIEWS_PAGE_SIZE + 1
  const last = Math.min(meta.page * REVIEWS_PAGE_SIZE, meta.total)

  const chip = (active: boolean) =>
    cn(
      "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors",
      active
        ? "border-foreground bg-foreground text-background"
        : "border-border bg-card text-foreground hover:border-foreground/40"
    )

  return (
    <div className="grid items-start gap-8 *:min-w-0 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-12">
      {/* Summary + write */}
      <aside className="space-y-5 lg:sticky lg:top-24">
        <div className="space-y-5 rounded-3xl border border-border/70 bg-card p-6">
          <div className="flex items-center gap-4">
            <span className="text-5xl font-semibold tracking-tight text-foreground tabular-nums">
              {summary.count > 0 ? summary.average.toFixed(1) : "–"}
            </span>
            <div className="space-y-1">
              <StarRating value={summary.average} size="md" />
              <p className="text-sm text-muted-foreground">
                {summary.count === 0
                  ? "No reviews yet"
                  : `Based on ${summary.count} ${summary.count === 1 ? "review" : "reviews"}`}
              </p>
            </div>
          </div>

          {summary.recommendRate !== null && (
            <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              <ThumbsUp className="size-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-semibold">
                  {Math.round(summary.recommendRate * 100)}%
                </span>{" "}
                rated it 4 stars or more
              </span>
            </p>
          )}

          <ul className="space-y-1" aria-label="Filter by rating">
            {STARS.map((star) => {
              const count =
                summary.distribution[
                  String(star) as keyof typeof summary.distribution
                ]
              const percent =
                summary.count > 0 ? (count / summary.count) * 100 : 0
              const active = query.rating === star
              const row = (
                <>
                  <span className="flex w-9 items-center gap-1 text-sm font-medium text-foreground tabular-nums">
                    {star}
                    <span className="text-amber-400" aria-hidden="true">
                      ★
                    </span>
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-amber-400"
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                  <span className="w-8 text-right text-sm text-muted-foreground tabular-nums">
                    {count}
                  </span>
                </>
              )
              return (
                <li key={star}>
                  {count > 0 ? (
                    <Link
                      href={href({
                        rating: active ? undefined : star,
                        page: 1,
                      })}
                      scroll={false}
                      aria-current={active ? "true" : undefined}
                      aria-label={`${star} star reviews: ${count}${active ? " (showing)" : ""}`}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted",
                        active && "bg-muted ring-1 ring-foreground/15"
                      )}
                    >
                      {row}
                    </Link>
                  ) : (
                    <span className="flex items-center gap-3 px-2 py-1.5 opacity-60">
                      {row}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        <ReviewComposer
          productId={productId}
          productName={productName}
          status={status}
          signedIn={signedIn}
          loginHref={loginHref}
          autoOpen={autoOpen}
        />
      </aside>

      {/* List */}
      <div className="space-y-5">
        {summary.count > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav
              aria-label="Review filters"
              className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
            >
              <Link
                href={href({
                  rating: undefined,
                  withPhotos: undefined,
                  page: 1,
                })}
                scroll={false}
                className={chip(!filtered)}
              >
                All reviews
                <span className="tabular-nums opacity-70">{summary.count}</span>
              </Link>
              {summary.withPhotos > 0 && (
                <Link
                  href={href({
                    withPhotos: query.withPhotos ? undefined : true,
                    page: 1,
                  })}
                  scroll={false}
                  className={chip(!!query.withPhotos)}
                >
                  <Camera className="size-4" aria-hidden="true" />
                  With photos
                  <span className="tabular-nums opacity-70">
                    {summary.withPhotos}
                  </span>
                </Link>
              )}
              {query.rating && (
                <Link
                  href={href({ rating: undefined, page: 1 })}
                  scroll={false}
                  className={chip(true)}
                >
                  {query.rating} ★ only
                  <X className="size-3.5" aria-label="Clear star filter" />
                </Link>
              )}
            </nav>
            <SortSelect
              label="Sort reviews"
              value={query.sort}
              options={REVIEW_SORTS.map((option) => ({
                ...option,
                href: href({ sort: option.value, page: 1 }),
              }))}
            />
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border px-6 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted">
              <MessageSquareQuote
                className="size-5 text-muted-foreground"
                aria-hidden="true"
              />
            </span>
            {filtered ? (
              <>
                <p className="font-medium text-foreground">
                  No reviews match that filter
                </p>
                <Link
                  href={href({
                    rating: undefined,
                    withPhotos: undefined,
                    page: 1,
                  })}
                  scroll={false}
                  className="text-sm font-medium text-foreground underline underline-offset-4"
                >
                  Show all reviews
                </Link>
              </>
            ) : (
              <>
                <p className="font-medium text-foreground">No reviews yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Reviews come from customers who received this item. Bought it?
                  Be the first to share your thoughts.
                </p>
              </>
            )}
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((review) => (
              <li key={review.id}>
                <ReviewCard
                  review={review}
                  storeName={storeName}
                  voted={voted.has(review.id)}
                  isOwn={review.id === ownId}
                  signedIn={signedIn}
                  loginHref={loginHref}
                />
              </li>
            ))}
          </ul>
        )}

        {meta.totalPages > 1 && (
          <nav
            aria-label="Review pages"
            className="flex flex-wrap items-center justify-between gap-3 pt-2"
          >
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground tabular-nums">
                {first}–{last}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground tabular-nums">
                {meta.total}
              </span>
            </p>
            <div className="flex items-center gap-2">
              {[
                {
                  label: "Previous reviews",
                  icon: ChevronLeft,
                  page: meta.page - 1,
                  enabled: meta.page > 1,
                },
                {
                  label: "More reviews",
                  icon: ChevronRight,
                  page: meta.page + 1,
                  enabled: meta.page < meta.totalPages,
                },
              ].map((control) =>
                control.enabled ? (
                  <Link
                    key={control.label}
                    href={href({ page: control.page })}
                    scroll={false}
                    aria-label={control.label}
                    className="flex size-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:border-foreground/40"
                  >
                    <control.icon className="size-4" />
                  </Link>
                ) : (
                  <span
                    key={control.label}
                    aria-hidden="true"
                    className="flex size-10 items-center justify-center rounded-full border border-border/60 text-muted-foreground/40"
                  >
                    <control.icon className="size-4" />
                  </span>
                )
              )}
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}
