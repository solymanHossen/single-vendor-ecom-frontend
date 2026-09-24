import Link from "next/link"
import { X } from "lucide-react"
import {
  catalogHref,
  hasActiveFilters,
  type CatalogFilters,
} from "@/lib/catalog-params"
import { formatPrice } from "@/lib/format"
import { PRODUCTS_PATH } from "@/lib/routes"
import type { CatalogAppliedCategory } from "@/lib/storefront-types"
import { COLLECTION_LABELS } from "./catalog-filters"

interface ActiveFiltersProps {
  filters: CatalogFilters
  category: CatalogAppliedCategory | null
}

export function ActiveFilters({ filters, category }: ActiveFiltersProps) {
  if (!hasActiveFilters(filters)) return null

  const chips: Array<{ label: string; href: string }> = []
  if (filters.q)
    chips.push({
      label: `“${filters.q}”`,
      href: catalogHref(filters, { q: undefined }),
    })
  if (category)
    chips.push({
      label: category.name,
      href: catalogHref(filters, { category: undefined }),
    })
  if (filters.collection) {
    chips.push({
      label: COLLECTION_LABELS[filters.collection],
      href: catalogHref(filters, { collection: undefined }),
    })
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const label =
      filters.minPrice !== undefined && filters.maxPrice !== undefined
        ? `${formatPrice(filters.minPrice)} – ${formatPrice(filters.maxPrice)}`
        : filters.minPrice !== undefined
          ? `From ${formatPrice(filters.minPrice)}`
          : `Up to ${formatPrice(filters.maxPrice ?? 0)}`
    chips.push({
      label,
      href: catalogHref(filters, { minPrice: undefined, maxPrice: undefined }),
    })
  }
  if (filters.inStock)
    chips.push({
      label: "In stock",
      href: catalogHref(filters, { inStock: undefined }),
    })

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 py-1 pr-2 pl-3 text-xs font-medium transition-colors hover:border-foreground/30 hover:bg-muted"
          aria-label={`Remove filter ${chip.label}`}
        >
          {chip.label}
          <X className="size-3" />
        </Link>
      ))}
      <Link
        href={PRODUCTS_PATH}
        className="px-2 text-xs font-medium text-primary hover:underline"
      >
        Clear all
      </Link>
    </div>
  )
}
