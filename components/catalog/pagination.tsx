import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { catalogHref, type CatalogFilters } from "@/lib/catalog-params"
import { cn } from "@/lib/utils"

/** Page numbers with ellipses: 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(current: number, total: number): Array<number | "gap"> {
  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)
  return sorted.flatMap((page, index) => {
    const previous = sorted[index - 1]
    return previous !== undefined && page - previous > 1
      ? (["gap", page] as const)
      : [page]
  })
}

interface PaginationProps {
  filters: CatalogFilters
  totalPages: number
}

export function Pagination({ filters, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null
  const current = Math.min(filters.page, totalPages)

  const linkClass =
    "flex h-11 min-w-11 items-center justify-center gap-1 rounded-full px-4 text-[15px] font-medium transition-colors duration-200"

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1"
    >
      {current > 1 ? (
        <Link
          href={catalogHref(filters, { page: current - 1 })}
          className={cn(linkClass, "hover:bg-muted")}
          rel="prev"
        >
          <ChevronLeft className="size-4" />
          <span className="sr-only sm:not-sr-only">Previous</span>
        </Link>
      ) : null}

      {pageWindow(current, totalPages).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={catalogHref(filters, { page: item })}
            aria-current={item === current ? "page" : undefined}
            className={cn(
              linkClass,
              item === current
                ? "bg-foreground text-background"
                : "hover:bg-muted"
            )}
          >
            {item}
          </Link>
        )
      )}

      {current < totalPages ? (
        <Link
          href={catalogHref(filters, { page: current + 1 })}
          className={cn(linkClass, "hover:bg-muted")}
          rel="next"
        >
          <span className="sr-only sm:not-sr-only">Next</span>
          <ChevronRight className="size-4" />
        </Link>
      ) : null}
    </nav>
  )
}
