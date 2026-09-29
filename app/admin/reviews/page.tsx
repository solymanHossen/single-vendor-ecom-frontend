import type { Metadata } from "next"
import Link from "next/link"
import { BadgeCheck, ChevronLeft, ChevronRight, CircleAlert, EyeOff, Hourglass, MessageSquareQuote, Store } from "lucide-react"
import { AccessDenied } from "@/components/admin/access-denied"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { UrlSearch } from "@/components/admin/url-search"
import { UrlSelect } from "@/components/admin/url-select"
import { ReviewModeration } from "@/components/admin/reviews/review-moderation"
import { LineThumb } from "@/components/cart/cart-drawer"
import { StarRating } from "@/components/catalog/star-rating"
import { ReviewPhotos } from "@/components/reviews/review-photos"
import { Button } from "@/components/ui/button"
import { getAdminAccess } from "@/lib/admin-access"
import { getStoreSettings } from "@/lib/backend-settings"
import {
  ADMIN_REVIEWS_PAGE_SIZE,
  getAdminReviews,
  type AdminReviewPage,
  type ReviewStatus,
} from "@/lib/backend-reviews"
import { formatDate, formatRelative } from "@/lib/format"
import { productHref } from "@/lib/routes"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Reviews · Admin" }

type Tab = ReviewStatus | "ALL"
const TABS: Array<{ key: Tab; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "PUBLISHED", label: "Published" },
  { key: "PENDING", label: "Pending" },
  { key: "HIDDEN", label: "Hidden" },
]

const STATUS_BADGE: Record<ReviewStatus, { label: string; icon: typeof BadgeCheck; className: string }> = {
  PUBLISHED: { label: "Published", icon: BadgeCheck, className: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" },
  PENDING: { label: "Pending", icon: Hourglass, className: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300" },
  HIDDEN: { label: "Hidden", icon: EyeOff, className: "bg-muted text-muted-foreground" },
}

export default async function AdminReviewsPage({ searchParams }: PageProps<"/admin/reviews">) {
  const access = await getAdminAccess()
  if (!access.can("reviews.moderate")) return <AccessDenied area="reviews" />

  const params = await searchParams
  const tab: Tab = TABS.some((item) => item.key === params.status) ? (params.status as Tab) : "ALL"
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 150) : ""
  const page = Math.max(1, Number(params.page) || 1)
  const rating = [1, 2, 3, 4, 5].find((value) => String(value) === params.rating)

  const href = (next: { tab?: Tab; page?: number }) => {
    const search = new URLSearchParams()
    const nextTab = next.tab ?? tab
    if (nextTab !== "ALL") search.set("status", nextTab)
    if (q) search.set("q", q)
    if (rating) search.set("rating", String(rating))
    if (next.page && next.page > 1) search.set("page", String(next.page))
    const qs = search.toString()
    return qs ? `/admin/reviews?${qs}` : "/admin/reviews"
  }

  let data: AdminReviewPage | null = null
  try {
    data = await getAdminReviews(access.accessToken, { page, status: tab, rating, search: q || undefined })
  } catch (error: unknown) {
    console.error("[admin] reviews unavailable:", error)
  }
  const { storeName } = await getStoreSettings()

  return (
    <>
      <AdminPageHeader
        title="Reviews"
        description="Reviews come only from customers whose order was delivered, one per product. They go live straight away — hide anything that breaks the rules, and respond to build trust."
      />

      {!data ? (
        <div role="alert" className="flex items-center gap-3 rounded-3xl bg-destructive/8 px-6 py-5 text-[15px] text-destructive">
          <CircleAlert className="size-5 shrink-0" />
          Reviews are temporarily unavailable. Refresh in a moment.
        </div>
      ) : (
        <div className="space-y-6">
          <nav aria-label="Filter reviews" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {TABS.map((item) => {
              const active = item.key === tab
              const count = data.counts[item.key]
              return (
                <Link
                  key={item.key}
                  href={href({ tab: item.key })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-11 shrink-0 items-center gap-2.5 rounded-xl border px-4 text-[15px] font-medium transition-colors",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border/70 bg-card text-foreground hover:border-foreground/40"
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                      active
                        ? "bg-background/15 text-background"
                        : item.key === "PENDING" && count > 0
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </Link>
              )
            })}
          </nav>

          <section className="overflow-hidden rounded-3xl border border-border/70 bg-card">
            <div className="flex flex-wrap gap-3 border-b border-border/70 px-6 py-4">
              <UrlSearch initial={q} placeholder="Search product, customer or text…" label="Search reviews" />
              <UrlSelect
                param="rating"
                value={rating ? String(rating) : undefined}
                label="Rating"
                allLabel="Any rating"
                options={[5, 4, 3, 2, 1].map((value) => ({ value: String(value), label: `${value} ${value === 1 ? "star" : "stars"}` }))}
              />
            </div>

            {data.items.length === 0 ? (
              <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                  <MessageSquareQuote className="size-7 text-muted-foreground" />
                </span>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-foreground">{tab === "PENDING" ? "Nothing waiting" : "No reviews here"}</p>
                  <p className="text-[15px] text-muted-foreground">
                    {tab === "PENDING" ? "Every review has been looked at." : "Try another filter or search."}
                  </p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-border/70">
                {data.items.map((review) => {
                  const badge = STATUS_BADGE[review.status]
                  return (
                    <li key={review.id} className="grid gap-5 px-6 py-5 lg:grid-cols-[240px_minmax(0,1fr)]">
                      <Link href={productHref(review.product.id)} target="_blank" className="flex min-w-0 items-start gap-3">
                        <LineThumb url={review.product.imageUrl} size={48} />
                        <span className="min-w-0">
                          <span className="line-clamp-2 text-sm font-medium text-foreground hover:underline">{review.product.name}</span>
                          {review.variantLabel && (
                            <span className="block truncate text-xs text-muted-foreground">{review.variantLabel}</span>
                          )}
                        </span>
                      </Link>

                      <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          <StarRating value={review.rating} size="md" />
                          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", badge.className)}>
                            <badge.icon className="size-3.5" aria-hidden="true" />
                            {badge.label}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {review.customer.name ?? review.customer.email} · {formatRelative(review.createdAt)}
                            {review.verified && review.orderId && ` · order #${review.orderId}`}
                          </span>
                        </div>
                        {review.title && <p className="font-semibold text-foreground">{review.title}</p>}
                        {review.comment ? (
                          <p className="text-[15px] leading-relaxed whitespace-pre-line text-foreground/90">{review.comment}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Rating only — no written review.</p>
                        )}
                        <ReviewPhotos photos={review.images} reviewer={review.reviewer.name} />
                        {review.reply && (
                          <div className="flex gap-2.5 rounded-2xl bg-muted/60 p-3.5 text-sm">
                            <Store className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">Your response · {formatDate(review.reply.createdAt)}</span>
                              <br />
                              {review.reply.text}
                            </p>
                          </div>
                        )}
                        <ReviewModeration key={`${review.id}-${review.status}-${review.reply?.text ?? ""}`} review={review} storeName={storeName} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            {data.meta.total > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {(page - 1) * ADMIN_REVIEWS_PAGE_SIZE + 1}–{Math.min(page * ADMIN_REVIEWS_PAGE_SIZE, data.meta.total)}
                  </span>{" "}
                  of <span className="font-medium text-foreground tabular-nums">{data.meta.total}</span>
                </p>
                {data.meta.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button asChild={page > 1} variant="outline" size="icon" className="size-9 rounded-lg" disabled={page <= 1} aria-label="Previous page">
                      {page > 1 ? (
                        <Link href={href({ page: page - 1 })}>
                          <ChevronLeft className="size-4" />
                        </Link>
                      ) : (
                        <ChevronLeft className="size-4" />
                      )}
                    </Button>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {page} / {data.meta.totalPages}
                    </span>
                    <Button
                      asChild={page < data.meta.totalPages}
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-lg"
                      disabled={page >= data.meta.totalPages}
                      aria-label="Next page"
                    >
                      {page < data.meta.totalPages ? (
                        <Link href={href({ page: page + 1 })}>
                          <ChevronRight className="size-4" />
                        </Link>
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  )
}
