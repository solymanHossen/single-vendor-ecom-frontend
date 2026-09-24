import Image from "next/image"
import Link from "next/link"
import { discountPercent } from "@/lib/format"
import { isOptimizableImage } from "@/lib/images"
import { productHref } from "@/lib/routes"
import type { CatalogProductCard } from "@/lib/storefront-types"
import { cn } from "@/lib/utils"
import { Price } from "./price"
import { StarRating } from "./star-rating"

const LOW_STOCK_THRESHOLD = 5

interface ProductCardProps {
  product: CatalogProductCard
  /** Eager-load the first row's images — they are the listing's LCP element. */
  priority?: boolean
}

/**
 * Server component — no client JavaScript. The hover image swap is pure CSS
 * (group-hover), and the whole card is one link for a large touch target.
 */
export function ProductCard({ product, priority = false }: ProductCardProps) {
  const percent = discountPercent(product.basePrice, product.discountPrice)
  const outOfStock = product.stockQuantity <= 0
  const lowStock = !outOfStock && product.stockQuantity <= LOW_STOCK_THRESHOLD

  return (
    <Link
      href={productHref(product.id)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.thumbnailUrl && (
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 280px, (min-width: 768px) 30vw, 50vw"
            unoptimized={!isOptimizableImage(product.thumbnailUrl)}
            className={cn(
              "object-cover transition-all duration-500 group-hover:scale-105",
              product.hoverImageUrl && "group-hover:opacity-0",
              outOfStock && "opacity-60 grayscale"
            )}
          />
        )}
        {product.hoverImageUrl && (
          <Image
            src={product.hoverImageUrl}
            alt=""
            fill
            sizes="(min-width: 1280px) 280px, (min-width: 768px) 30vw, 50vw"
            unoptimized={!isOptimizableImage(product.hoverImageUrl)}
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1">
          {percent > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
              −{percent}%
            </span>
          )}
          {product.isNew && (
            <span className="rounded-full bg-background/90 px-2 py-0.5 text-[11px] font-semibold text-foreground backdrop-blur">
              New
            </span>
          )}
        </div>

        {outOfStock && (
          <span className="absolute inset-x-2.5 bottom-2.5 rounded-lg bg-background/90 py-1 text-center text-xs font-semibold text-foreground backdrop-blur">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {product.categoryName}
        </p>
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-foreground transition-colors group-hover:text-primary">
          {product.name}
        </h3>

        {product.reviewCount > 0 ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <StarRating value={product.ratingAverage} />
            <span>
              {product.ratingAverage.toFixed(1)} ({product.reviewCount})
            </span>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">No reviews yet</span>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-1.5">
          <Price
            basePrice={product.basePrice}
            discountPrice={product.discountPrice}
          />
          {lowStock ? (
            <span className="shrink-0 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              Only {product.stockQuantity} left
            </span>
          ) : product.variantCount > 1 ? (
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {product.variantCount} options
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="space-y-2 p-3.5">
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
