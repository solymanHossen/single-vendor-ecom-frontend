import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { FadeImage } from "@/components/ui/fade-image"
import { discountPercent, formatPrice } from "@/lib/format"
import { isOptimizableImage } from "@/lib/images"
import { productHref } from "@/lib/routes"
import type { CatalogProductCard } from "@/lib/storefront-types"
import { cn } from "@/lib/utils"
import { StarRating } from "./star-rating"

const LOW_STOCK_THRESHOLD = 5
const CARD_SIZES =
  "(min-width: 1536px) 340px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"

interface ProductCardProps {
  product: CatalogProductCard
  /** Eager-load the first row's images — they are the listing's LCP element. */
  priority?: boolean
}

/**
 * Borderless, image-first card. The title always reserves two lines and the
 * meta rows have fixed heights, so every card in a row lines up regardless
 * of name length. Hover crossfades to the second photo (pure CSS).
 */
export function ProductCard({ product, priority = false }: ProductCardProps) {
  const percent = discountPercent(product.basePrice, product.discountPrice)
  const outOfStock = product.stockQuantity <= 0
  const lowStock = !outOfStock && product.stockQuantity <= LOW_STOCK_THRESHOLD
  const price = product.discountPrice ?? product.basePrice

  return (
    <Link
      href={productHref(product.id)}
      className="group relative block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        {product.thumbnailUrl && (
          <FadeImage
            src={product.thumbnailUrl}
            alt={product.name}
            fill
            priority={priority}
            sizes={CARD_SIZES}
            unoptimized={!isOptimizableImage(product.thumbnailUrl)}
            className={cn(
              "object-cover group-hover:scale-[1.04]",
              product.hoverImageUrl && "group-hover:opacity-0",
              outOfStock && "grayscale-60"
            )}
          />
        )}
        {product.hoverImageUrl && (
          <FadeImage
            src={product.hoverImageUrl}
            alt=""
            fill
            sizes={CARD_SIZES}
            unoptimized={!isOptimizableImage(product.hoverImageUrl)}
            className="object-cover opacity-0! group-hover:scale-[1.04] group-hover:opacity-100!"
          />
        )}

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {percent > 0 && (
            <span className="rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background">
              −{percent}%
            </span>
          )}
          {product.isNew && (
            <span className="rounded-full bg-background/95 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
              New
            </span>
          )}
        </div>

        {/* Quick affordance: slides up on hover */}
        <span className="absolute right-3 bottom-3 flex size-10 translate-y-2 items-center justify-center rounded-full bg-background text-foreground opacity-0 shadow-md transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          <ArrowUpRight className="size-5" />
        </span>

        {outOfStock && (
          <span className="absolute inset-x-3 bottom-3 rounded-full bg-background/95 py-1.5 text-center text-sm font-medium text-foreground backdrop-blur">
            Out of stock
          </span>
        )}
      </div>

      <div className="space-y-1.5 px-1 pt-3.5">
        <p className="truncate text-sm text-muted-foreground">
          {product.categoryName}
        </p>
        <h3 className="line-clamp-2 min-h-[2lh] text-[15px] leading-snug font-medium text-foreground transition-colors group-hover:text-primary">
          {product.name}
        </h3>

        <div className="flex h-5 items-center gap-1.5 text-sm text-muted-foreground">
          {product.reviewCount > 0 ? (
            <>
              <StarRating value={product.ratingAverage} />
              <span className="font-medium text-foreground">
                {product.ratingAverage.toFixed(1)}
              </span>
              <span>({product.reviewCount})</span>
            </>
          ) : (
            <span>No reviews yet</span>
          )}
        </div>

        <div className="flex items-baseline justify-between gap-2 pt-0.5">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-lg font-semibold tracking-tight text-foreground">
              {formatPrice(price)}
            </span>
            {percent > 0 && (
              <span className="text-sm text-muted-foreground line-through">
                <span className="sr-only">Regular price </span>
                {formatPrice(product.basePrice)}
              </span>
            )}
          </p>
          {lowStock ? (
            <span className="shrink-0 text-xs font-medium text-amber-600 dark:text-amber-400">
              Only {product.stockQuantity} left
            </span>
          ) : product.variantCount > 1 ? (
            <span className="shrink-0 text-xs text-muted-foreground">
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
    <div>
      <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
      <div className="space-y-2 px-1 pt-3.5">
        <div className="h-3.5 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
