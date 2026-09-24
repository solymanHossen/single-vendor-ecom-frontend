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

  return (
    <div className="page-container py-6 lg:py-8">
      <Breadcrumbs items={crumbs} />

      <div className="mt-4 mb-6 space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {heading}
        </h1>
        {page.category?.description && (
          <p className="max-w-2xl text-sm text-muted-foreground">
            {page.category.description}
          </p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block" aria-label="Product filters">
          <div className="sticky top-32">{filtersPanel}</div>
        </aside>

        <section aria-label="Products" className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {page.meta.total === 0
                ? "No products found"
                : `Showing ${firstItem}–${lastItem} of ${page.meta.total} products`}
            </p>
            <div className="flex items-center gap-2">
              <MobileFilters activeCount={activeCount}>
                {filtersPanel}
              </MobileFilters>
              <SortSelect value={filters.sort} options={sortOptions} />
            </div>
          </div>

          <ActiveFilters filters={filters} category={page.category} />

          {page.items.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {page.items.map((product, index) => (
                <li key={product.id}>
                  <ProductCard product={product} priority={index < 4} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
              <PackageSearch className="size-10 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-semibold text-foreground">
                  No products match these filters
                </p>
                <p className="text-sm text-muted-foreground">
                  Try removing a filter or searching for something broader.
                </p>
              </div>
              <Link
                href={PRODUCTS_PATH}
                className="mt-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
              >
                Browse all products
              </Link>
            </div>
          )}

          <div className="pt-4">
            <Pagination filters={filters} totalPages={page.meta.totalPages} />
          </div>
        </section>
      </div>
    </div>
  )
}
