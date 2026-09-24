import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/format"
import { isOptimizableImage } from "@/lib/images"
import { productHref } from "@/lib/routes"
import type { AnalyticsDashboard } from "@/lib/backend-analytics"

export function TopProducts({
  products,
}: {
  products: AnalyticsDashboard["topProducts"]
}) {
  const max = Math.max(1, ...products.map((product) => Number(product.revenue)))

  return (
    <div className="flex h-full flex-col gap-5 rounded-3xl border border-border/70 bg-card p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Top products</h2>
        <p className="text-[15px] text-muted-foreground">
          By revenue in this period
        </p>
      </div>
      {products.length === 0 ? (
        <p className="text-[15px] text-muted-foreground">
          No sales in this period yet.
        </p>
      ) : (
        <ol className="space-y-4">
          {products.map((product, index) => (
            <li key={product.id}>
              <Link
                href={productHref(product.id)}
                className="group flex items-center gap-3.5"
              >
                <span className="w-4 text-sm font-semibold text-muted-foreground tabular-nums">
                  {index + 1}
                </span>
                <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {product.thumbnailUrl && (
                    <Image
                      src={product.thumbnailUrl}
                      alt=""
                      fill
                      sizes="48px"
                      unoptimized={!isOptimizableImage(product.thumbnailUrl)}
                      className="object-cover"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1 space-y-1.5">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-[15px] font-medium text-foreground group-hover:underline">
                      {product.name}
                    </span>
                    <span className="shrink-0 text-[15px] font-semibold text-foreground tabular-nums">
                      {formatPrice(product.revenue)}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${(Number(product.revenue) / max) * 100}%`,
                          backgroundColor: "var(--chart-1)",
                        }}
                      />
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {product.units} sold · {product.categoryName}
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
