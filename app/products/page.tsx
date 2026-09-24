import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PackageSearch } from "lucide-react"
import { ActiveFilters } from "@/components/catalog/active-filters"
import { Breadcrumbs, type Crumb } from "@/components/catalog/breadcrumbs"
import {
  CatalogFiltersPanel,
  COLLECTION_LABELS,
} from "@/components/catalog/catalog-filters"
import { MobileFilters } from "@/components/catalog/mobile-filters"
import { Pagination } from "@/components/catalog/pagination"
import { ProductCard } from "@/components/catalog/product-card"
import { SortSelect } from "@/components/catalog/sort-select"
import { LinkPending } from "@/components/catalog/link-pending"
import { cn } from "@/lib/utils"
import { getCatalogPage } from "@/lib/backend-storefront"
import {
  catalogHref,
  parseCatalogParams,
  SORT_LABELS,
  type CatalogFilters,
} from "@/lib/catalog-params"
import { categoryHref, PRODUCTS_PATH } from "@/lib/routes"
import { CATALOG_SORTS, type CatalogPage } from "@/lib/storefront-types"

type ProductsPageProps = PageProps<"/products">

function headingFor(filters: CatalogFilters, page: CatalogPage): string {
  if (page.category) return page.category.name
  if (filters.collection) return COLLECTION_LABELS[filters.collection]
  if (filters.q) return `Results for “${filters.q}”`
  return "All products"
}

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const filters = parseCatalogParams(await searchParams)
  const page = await getCatalogPage(filters)
  if (!page) return { title: "Category not found | AURA" }

  const heading = headingFor(filters, page)
  // Only category/collection landing pages are canonical and indexable;
  // search results, price ranges and deep pages would otherwise flood the
  // index with near-duplicate URLs.
  const isLanding =
    !filters.q &&
    filters.minPrice === undefined &&
    filters.maxPrice === undefined &&
    !filters.inStock &&
    filters.page === 1
  const canonical = page.category
    ? categoryHref(page.category.slug)
    : filters.collection
      ? catalogHref({
          sort: "featured",
          page: 1,
          collection: filters.collection,
        })
      : PRODUCTS_PATH

  return {
    title: `${heading} | AURA`,
    description:
      page.category?.description ??
      `Shop ${page.meta.total} products — authentic brands, cash on delivery nationwide and 7-day easy returns.`,
    alternates: { canonical },
    robots: isLanding ? undefined : { index: false, follow: true },
  }
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const filters = parseCatalogParams(await searchParams)
  const page = await getCatalogPage(filters)
  if (!page) notFound()

  const heading = headingFor(filters, page)
  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    { label: "Products", href: PRODUCTS_PATH },
  ]
  if (page.category?.parent) {
    crumbs.push({
      label: page.category.parent.name,
      href: categoryHref(page.category.parent.slug),
    })
  }
  if (page.category) crumbs.push({ label: page.category.name })

  const activeCount = [
    filters.q,
    filters.category,
    filters.collection,
    filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? "price"
      : undefined,
    filters.inStock ? "stock" : undefined,
  ].filter(Boolean).length

  const sortOptions = CATALOG_SORTS.map((sort) => ({
    value: sort,
    label: SORT_LABELS[sort],
    href: catalogHref(filters, { sort }),
  }))

  const firstItem =
    page.meta.total === 0 ? 0 : (page.meta.page - 1) * page.meta.limit + 1
  const lastItem = Math.min(page.meta.page * page.meta.limit, page.meta.total)
  const filtersPanel = (
    <CatalogFiltersPanel filters={filters} facets={page.facets} />
  )

  // Quick-jump chips: sub-categories of the current department, siblings
  // of the current sub-category, or the top-level departments.
  const parentFacet = page.facets.categories.find(
    (parent) =>
      parent.slug === filters.category ||
      parent.children.some((child) => child.slug === filters.category)
  )
  const quickLinks = parentFacet ? parentFacet.children : page.facets.categories

  return (
    <div className="page-container pt-6 pb-16 lg:pt-8">
      <Breadcrumbs items={crumbs} />

      {/* The breadcrumb names the page visually; the h1 stays for screen
          readers and search engines. */}
      <h1 className="sr-only">{heading}</h1>

      <header className="mt-6 mb-8">
        {quickLinks.length > 1 && (
          <nav
            aria-label="Browse categories"
            className="-mx-1 overflow-x-auto pb-1"
          >
            <ul className="flex w-max gap-2 px-1">
              {parentFacet && (
                <li>
                  <QuickChip
                    href={catalogHref(filters, { category: parentFacet.slug })}
                    active={filters.category === parentFacet.slug}
                    label={`All ${parentFacet.name}`}
                    count={parentFacet.productCount}
                  />
                </li>
              )}
              {quickLinks.map((category) => (
                <li key={category.id}>
                  <QuickChip
                    href={catalogHref(filters, { category: category.slug })}
                    active={filters.category === category.slug}
                    label={category.name}
                    count={category.productCount}
                  />
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <div className="grid gap-10 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block" aria-label="Product filters">
          <div className="sticky top-24">{filtersPanel}</div>
        </aside>

        <section aria-label="Products" className="min-w-0">
          {/* Toolbar sticks under the slim header while browsing */}
          <div className="sticky top-14 z-20 -mx-2 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-background/85 px-2 py-2.5 backdrop-blur-xl">
            <p className="text-[15px] text-muted-foreground" aria-live="polite">
              {page.meta.total === 0 ? (
                "No products found"
              ) : (
                <>
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {firstItem}–{lastItem}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {page.meta.total}
                  </span>
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <MobileFilters activeCount={activeCount}>
                {filtersPanel}
              </MobileFilters>
              <SortSelect value={filters.sort} options={sortOptions} />
            </div>
          </div>

          <div className="mb-6 empty:hidden">
            <ActiveFilters filters={filters} category={page.category} />
          </div>

          {page.items.length > 0 ? (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
              {page.items.map((product, index) => (
                <li key={product.id}>
                  <ProductCard product={product} priority={index < 4} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-3xl bg-muted/40 px-6 py-20 text-center">
              <PackageSearch className="size-12 text-muted-foreground" />
              <div className="space-y-1.5">
                <p className="text-lg font-semibold text-foreground">
                  No products match these filters
                </p>
                <p className="text-[15px] text-muted-foreground">
                  Try removing a filter or searching for something broader.
                </p>
              </div>
              <Link
                href={PRODUCTS_PATH}
                className="mt-2 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-[15px] font-medium text-background transition-opacity hover:opacity-90"
              >
                Browse all products
              </Link>
            </div>
          )}

          <div className="pt-14">
            <Pagination filters={filters} totalPages={page.meta.totalPages} />
          </div>
        </section>
      </div>
    </div>
  )
}

function QuickChip({
  href,
  active,
  label,
  count,
}: {
  href: string
  active: boolean
  label: string
  count: number
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-all duration-200",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-foreground hover:border-foreground/40"
      )}
    >
      {label}
      <span
        className={cn(
          "text-xs tabular-nums",
          active ? "text-background/70" : "text-muted-foreground"
        )}
      >
        <LinkPending className="size-3.5 text-current">{count}</LinkPending>
      </span>
    </Link>
  )
}
