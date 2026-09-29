import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react"
import { Breadcrumbs } from "@/components/catalog/breadcrumbs"
import { ProductCard } from "@/components/catalog/product-card"
import { SortSelect } from "@/components/catalog/sort-select"
import { CampaignHero } from "@/components/campaigns/campaign-hero"
import { getCampaignProducts, getPublicCampaign } from "@/lib/backend-campaigns"
import { SORT_LABELS } from "@/lib/catalog-params"
import type { CatalogSort } from "@/lib/storefront-types"

type CampaignPageProps = PageProps<"/campaigns/[slug]">

const SORTS = Object.keys(SORT_LABELS) as CatalogSort[]

export async function generateMetadata({ params }: CampaignPageProps): Promise<Metadata> {
  const campaign = await getPublicCampaign((await params).slug)
  if (!campaign) return { title: "Sale not found" }
  const description = campaign.tagline ?? `${campaign.label} — for a limited time.`
  return {
    title: `${campaign.name} — ${campaign.label}`,
    description,
    openGraph: {
      title: campaign.name,
      description,
      images: campaign.bannerUrl ? [{ url: campaign.bannerUrl }] : undefined,
    },
  }
}

export default async function CampaignPage({ params, searchParams }: CampaignPageProps) {
  const { slug } = await params
  const query = await searchParams
  const campaign = await getPublicCampaign(slug)
  if (!campaign) notFound()

  const sort: CatalogSort = SORTS.includes(query.sort as CatalogSort) ? (query.sort as CatalogSort) : "best-selling"
  const page = Math.max(1, Number(query.page) || 1)
  const products = await getCampaignProducts(slug, { page, sort })
  // eslint-disable-next-line react-hooks/purity -- request time, seeds the countdown
  const now = Date.now()

  const href = (next: { sort?: CatalogSort; page?: number }) => {
    const search = new URLSearchParams()
    const nextSort = next.sort ?? sort
    if (nextSort !== "best-selling") search.set("sort", nextSort)
    if (next.page && next.page > 1) search.set("page", String(next.page))
    const qs = search.toString()
    return `/campaigns/${slug}${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="page-container space-y-10 pt-6 pb-20 lg:pt-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Sales" }, { label: campaign.name }]} />

      <CampaignHero campaign={campaign} productCount={products.meta.total} serverNow={now} />

      {campaign.description && (
        <p className="max-w-3xl text-[15px] leading-relaxed whitespace-pre-line text-muted-foreground">
          {campaign.description}
        </p>
      )}

      <section aria-labelledby="campaign-products" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="campaign-products" className="text-2xl font-semibold tracking-tight text-foreground">
            {campaign.status === "LIVE" ? "Shop the sale" : campaign.status === "SCHEDULED" ? "On sale soon" : "Products from this sale"}
            <span className="ml-2 text-base font-normal text-muted-foreground tabular-nums">{products.meta.total}</span>
          </h2>
          {products.meta.total > 1 && (
            <SortSelect
              value={sort}
              options={SORTS.map((value) => ({ value, label: SORT_LABELS[value], href: href({ sort: value }) }))}
            />
          )}
        </div>

        {campaign.status === "SCHEDULED" && (
          <p className="rounded-2xl bg-muted/60 px-5 py-4 text-[15px] text-muted-foreground">
            Sale prices appear here when the countdown hits zero. Add favourites to your wishlist so you&apos;re ready.
          </p>
        )}

        {products.items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border px-6 py-16 text-center">
            <PackageSearch className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium text-foreground">Products are being added to this sale</p>
            <Link href="/products" className="text-sm font-medium text-foreground underline underline-offset-4">
              Browse all products
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
            {products.items.map((product, index) => (
              <li key={product.id}>
                <ProductCard product={product} priority={index < 4} />
              </li>
            ))}
          </ul>
        )}

        {products.meta.totalPages > 1 && (
          <nav aria-label="Pagination" className="flex items-center justify-center gap-3 pt-4">
            {page > 1 ? (
              <Link href={href({ page: page - 1 })} className="flex h-11 items-center gap-1 rounded-full border border-border px-4 text-[15px] font-medium hover:border-foreground/40">
                <ChevronLeft className="size-4" /> Previous
              </Link>
            ) : null}
            <span className="text-sm text-muted-foreground tabular-nums">
              Page {page} of {products.meta.totalPages}
            </span>
            {page < products.meta.totalPages ? (
              <Link href={href({ page: page + 1 })} className="flex h-11 items-center gap-1 rounded-full border border-border px-4 text-[15px] font-medium hover:border-foreground/40">
                Next <ChevronRight className="size-4" />
              </Link>
            ) : null}
          </nav>
        )}
      </section>
    </div>
  )
}
