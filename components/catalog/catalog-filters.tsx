import Link from "next/link"
import { Check } from "lucide-react"
import { catalogHref, type CatalogFilters } from "@/lib/catalog-params"
import { formatPrice } from "@/lib/format"
import { PRODUCTS_PATH } from "@/lib/routes"
import type { CatalogPage, CollectionKey } from "@/lib/storefront-types"
import { cn } from "@/lib/utils"

export const COLLECTION_LABELS: Readonly<Record<CollectionKey, string>> = {
  "new-arrivals": "New Arrivals",
  "on-sale": "On Sale",
  "best-sellers": "Best Sellers",
  "top-rated": "Top Rated",
}

interface CatalogFiltersPanelProps {
  filters: CatalogFilters
  facets: CatalogPage["facets"]
}

function FilterSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3 border-b border-border/60 pb-5 last:border-0">
      <h2 className="text-xs font-bold tracking-wider text-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}

/**
 * Server-rendered filter sidebar. Every option is a real link (or a GET
 * form), so filtering works with JavaScript disabled, is crawlable, and each
 * state has a shareable URL.
 */
export function CatalogFiltersPanel({
  filters,
  facets,
}: CatalogFiltersPanelProps) {
  const activeParent = facets.categories.find(
    (parent) =>
      parent.slug === filters.category ||
      parent.children.some((child) => child.slug === filters.category)
  )

  return (
    <div className="space-y-5">
      <FilterSection title="Category">
        <ul className="space-y-0.5 text-sm">
          <li>
            <Link
              href={catalogHref(filters, { category: undefined })}
              className={cn(
                "flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-muted",
                !filters.category && "font-semibold text-primary"
              )}
            >
              All categories
            </Link>
          </li>
          {facets.categories.map((parent) => {
            const isParentActive = parent.slug === filters.category
            const isExpanded = activeParent?.id === parent.id
            return (
              <li key={parent.id}>
                <Link
                  href={catalogHref(filters, { category: parent.slug })}
                  aria-current={isParentActive ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-muted",
                    isParentActive && "bg-primary/10 font-semibold text-primary"
                  )}
                >
                  <span>{parent.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {parent.productCount}
                  </span>
                </Link>
                {isExpanded && parent.children.length > 0 && (
                  <ul className="mt-0.5 ml-3 space-y-0.5 border-l border-border/60 pl-2">
                    {parent.children.map((child) => {
                      const isChildActive = child.slug === filters.category
                      return (
                        <li key={child.id}>
                          <Link
                            href={catalogHref(filters, {
                              category: child.slug,
                            })}
                            aria-current={isChildActive ? "page" : undefined}
                            className={cn(
                              "flex items-center justify-between rounded-lg px-2 py-1 text-[13px] transition-colors hover:bg-muted",
                              isChildActive &&
                                "bg-primary/10 font-semibold text-primary"
                            )}
                          >
                            <span>{child.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {child.productCount}
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </FilterSection>

      <FilterSection title="Collections">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(COLLECTION_LABELS) as CollectionKey[]).map((key) => {
            const active = filters.collection === key
            return (
              <Link
                key={key}
                href={catalogHref(filters, {
                  collection: active ? undefined : key,
                })}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-foreground/30 hover:bg-muted"
                )}
              >
                {COLLECTION_LABELS[key]}
              </Link>
            )
          })}
        </div>
      </FilterSection>

      <FilterSection title="Price">
        {facets.priceRange && (
          <p className="text-xs text-muted-foreground">
            {formatPrice(facets.priceRange.min)} –{" "}
            {formatPrice(facets.priceRange.max)}
          </p>
        )}
        {/* A plain GET form: carries the other filters as hidden fields. */}
        <form action={PRODUCTS_PATH} method="get" className="space-y-2">
          {filters.q && <input type="hidden" name="q" value={filters.q} />}
          {filters.category && (
            <input type="hidden" name="category" value={filters.category} />
          )}
          {filters.collection && (
            <input type="hidden" name="collection" value={filters.collection} />
          )}
          {filters.inStock && (
            <input type="hidden" name="inStock" value="true" />
          )}
          {filters.sort !== "featured" && (
            <input type="hidden" name="sort" value={filters.sort} />
          )}
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="minPrice">
              Minimum price
            </label>
            <input
              id="minPrice"
              name="minPrice"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Min ৳"
              defaultValue={filters.minPrice}
              className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span className="text-muted-foreground">–</span>
            <label className="sr-only" htmlFor="maxPrice">
              Maximum price
            </label>
            <input
              id="maxPrice"
              name="maxPrice"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Max ৳"
              defaultValue={filters.maxPrice}
              className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="h-9 w-full rounded-lg bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Apply price
          </button>
        </form>
      </FilterSection>

      <FilterSection title="Availability">
        <Link
          href={catalogHref(filters, {
            inStock: filters.inStock ? undefined : true,
          })}
          role="checkbox"
          aria-checked={Boolean(filters.inStock)}
          className="flex items-center gap-2.5 text-sm"
        >
          <span
            className={cn(
              "flex size-4.5 items-center justify-center rounded border transition-colors",
              filters.inStock
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input"
            )}
          >
            {filters.inStock && <Check className="size-3" />}
          </span>
          In stock only
        </Link>
      </FilterSection>
    </div>
  )
}
