import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { adminProductsHref } from "@/lib/admin-product-params"
import type { AdminProductQuery } from "@/lib/backend-admin-products"
import { cn } from "@/lib/utils"

/** 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(current: number, total: number): Array<number | "gap"> {
  const pages = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)
  return pages.flatMap((page, index) => {
    const previous = pages[index - 1]
    return previous !== undefined && page - previous > 1
      ? (["gap", page] as const)
      : [page]
  })
}

export function AdminPagination({
  query,
  total,
  totalPages,
  pageSize,
}: {
  query: AdminProductQuery
  total: number
  totalPages: number
  pageSize: number
}) {
  if (total === 0) return null
  const current = Math.min(query.page, Math.max(totalPages, 1))
  const from = (current - 1) * pageSize + 1
  const to = Math.min(current * pageSize, total)

  const item =
    "flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors"

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 px-6 py-4">
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground tabular-nums">
          {from}–{to}
        </span>{" "}
        of <span className="font-medium text-foreground tabular-nums">{total}</span>{" "}
        products
      </p>
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          {current > 1 ? (
            <Link
              href={adminProductsHref(query, { page: current - 1 })}
              className={cn(item, "hover:bg-muted")}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Link>
          ) : (
            <span className={cn(item, "text-muted-foreground/50")} aria-hidden="true">
              <ChevronLeft className="size-4" />
            </span>
          )}
          {pageWindow(current, totalPages).map((page, index) =>
            page === "gap" ? (
              <span key={`gap-${index}`} className={cn(item, "text-muted-foreground")}>
                …
              </span>
            ) : (
              <Link
                key={page}
                href={adminProductsHref(query, { page })}
                aria-current={page === current ? "page" : undefined}
                className={cn(
                  item,
                  "tabular-nums",
                  page === current
                    ? "bg-foreground text-background"
                    : "hover:bg-muted"
                )}
              >
                {page}
              </Link>
            )
          )}
          {current < totalPages ? (
            <Link
              href={adminProductsHref(query, { page: current + 1 })}
              className={cn(item, "hover:bg-muted")}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span className={cn(item, "text-muted-foreground/50")} aria-hidden="true">
              <ChevronRight className="size-4" />
            </span>
          )}
        </nav>
      )}
    </div>
  )
}
