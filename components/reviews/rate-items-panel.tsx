import Link from "next/link"
import { ChevronRight, Star } from "lucide-react"
import { LineThumb } from "@/components/cart/cart-drawer"
import { StarRating } from "@/components/catalog/star-rating"
import type { OrderItem } from "@/lib/backend-commerce"
import type { OwnReview } from "@/lib/backend-reviews"
import { productHref } from "@/lib/routes"

/** Delivered orders: one review per product — "Rate" or "Your rating ★4". */
export function RateItemsPanel({ items, reviews }: { items: OrderItem[]; reviews: OwnReview[] }) {
  const byProduct = new Map(reviews.map((review) => [review.productId, review]))
  // The same product in two variants is still one review.
  const products = [...new Map(items.map((item) => [item.productId, item])).values()]
  const remaining = products.filter((item) => !byProduct.has(item.productId)).length

  return (
    <section className="rounded-3xl border border-border/70 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-6 py-4">
        <div>
          <h2 className="font-semibold text-foreground">Rate your items</h2>
          <p className="text-sm text-muted-foreground">
            {remaining === 0
              ? "Thanks — you've reviewed everything in this order."
              : "Your review helps other shoppers — it takes a minute."}
          </p>
        </div>
        {remaining > 0 && (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            {remaining} to review
          </span>
        )}
      </div>
      <ul className="divide-y divide-border/70">
        {products.map((item) => {
          const review = byProduct.get(item.productId)
          return (
            <li key={item.productId}>
              <Link
                href={`${productHref(item.productId)}?review=write#reviews`}
                className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
              >
                <LineThumb url={item.product.imageUrl} size={52} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-foreground">{item.product.name}</span>
                  {review ? (
                    <span className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <StarRating value={review.rating} />
                      {review.status === "PENDING" ? "Awaiting a quick check" : review.status === "HIDDEN" ? "Hidden" : "Your review"}
                    </span>
                  ) : (
                    <span className="mt-1 flex items-center gap-0.5 text-muted-foreground/40" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="size-4" />
                      ))}
                    </span>
                  )}
                </span>
                <span className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-border bg-background px-3.5 text-sm font-medium text-foreground transition-colors group-hover:border-foreground/40">
                  {review ? "Edit" : "Write a review"}
                  <ChevronRight className="size-4" aria-hidden="true" />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
