import Link from "next/link"
import { catalogHref, type CatalogFilters } from "@/lib/catalog-params"
import { formatPrice } from "@/lib/format"
import { PRODUCTS_PATH } from "@/lib/routes"
import type { CatalogPage, CollectionKey } from "@/lib/storefront-types"
import { cn } from "@/lib/utils"
import { LinkPending } from "./link-pending"

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
    <section className="space-y-3.5 border-b border-border/60 pb-6 last:border-0 last:pb-0">
      <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  )
}

const rowClass =
  "flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-[15px] transition-colors duration-200"

/**
 * Server-rendered filter sidebar. Every option is a real link (or a GET
 * form), so filtering works with JavaScript disabled, is crawlable, and each
 * state has a shareable URL. <LinkPending> gives instant click feedback.
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
    <div className="space-y-6">
      <FilterSection title="Category">
        <ul className="-mx-3 space-y-0.5">
          <li>
            <Link
              href={catalogHref(filters, { category: undefined })}
              className={cn(
                rowClass,
                !filters.category
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              All categories
              <LinkPending />
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
                    rowClass,
                    isParentActive
                      ? "bg-muted font-semibold text-foreground"
                      : isExpanded
                        ? "font-medium text-foreground hover:bg-muted/60"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <span className="truncate">{parent.name}</span>
                  <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                    <LinkPending>{parent.productCount}</LinkPending>
                  </span>
                </Link>
                {isExpanded && parent.children.length > 0 && (
                  <ul className="mt-0.5 mb-1 ml-3 space-y-0.5 border-l-2 border-border/70 pl-2">
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
                              rowClass,
                              "py-1.5 text-sm",
                              isChildActive
                                ? "bg-primary/10 font-semibold text-primary"
                                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                            )}
                          >
                            <span className="truncate">{child.name}</span>
                            <span className="shrink-0 text-xs tabular-nums">
                              <LinkPending>{child.productCount}</LinkPending>
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
        <div className="flex flex-wrap gap-2">
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
                  "inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-all duration-200",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-foreground hover:border-foreground/40"
                )}
              >
                {COLLECTION_LABELS[key]}
                <LinkPending className="size-3.5 text-current" />
              </Link>
            )
          })}
        </div>
      </FilterSection>

      <FilterSection title="Price">
        {facets.priceRange && (
          <p className="text-sm text-muted-foreground">
            Available: {formatPrice(facets.priceRange.min)} –{" "}
            {formatPrice(facets.priceRange.max)}
          </p>
        )}
        {/* A plain GET form: carries the other filters as hidden fields. */}
        <form action={PRODUCTS_PATH} method="get" className="space-y-3">
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
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["minPrice", "Min", filters.minPrice],
                ["maxPrice", "Max", filters.maxPrice],
              ] as const
            ).map(([name, label, value]) => (
              <label key={name} className="group relative block">
                <span className="sr-only">{label} price</span>
                <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-muted-foreground">
                  ৳
                </span>
                <input
                  name={name}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder={label}
                  defaultValue={value}
                  className="h-11 w-full rounded-xl border border-input bg-background pr-3 pl-8 text-[15px] transition-shadow outline-none placeholder:text-muted-foreground focus-visible:border-foreground/40 focus-visible:ring-4 focus-visible:ring-ring/15"
                />
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="h-11 w-full rounded-xl border border-foreground/15 text-[15px] font-medium text-foreground transition-colors hover:border-foreground/40 hover:bg-muted"
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
          role="switch"
          aria-checked={Boolean(filters.inStock)}
          className="flex items-center justify-between gap-3 text-[15px] text-foreground"
        >
          <span className="flex items-center gap-2">
            In stock only
            <LinkPending />
          </span>
          <span
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
              filters.inStock ? "bg-foreground" : "bg-muted-foreground/25"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 size-5 rounded-full bg-background shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                filters.inStock && "translate-x-5"
              )}
            />
          </span>
        </Link>
      </FilterSection>
    </div>
  )
}
