import type { Metadata } from "next"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import { BadgeCheck, RotateCcw, Truck, Wallet } from "lucide-react"
import { Breadcrumbs } from "@/components/catalog/breadcrumbs"
import { ProductCard } from "@/components/catalog/product-card"
import { ProductRail } from "@/components/catalog/product-rail"
import { StarRating } from "@/components/catalog/star-rating"
import { ProductDescription } from "@/components/product/product-description"
import { ProductGallery } from "@/components/product/product-gallery"
import { PurchasePanel } from "@/components/product/purchase-panel"
import { ReviewsSection } from "@/components/product/reviews-section"
import { getProductDetail, getProductReviews } from "@/lib/backend-storefront"
import { categoryHref, productHref, PRODUCTS_PATH } from "@/lib/routes"
import type { ProductDetail } from "@/lib/storefront-types"

type ProductPageProps = PageProps<"/products/[id]">

const SITE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3001"

const firstParam = (
  value: string | string[] | undefined
): string | undefined => (Array.isArray(value) ? value[0] : value)

function positiveInt(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null
  const parsed = Number(value)
  return parsed > 0 && parsed <= 2_147_483_647 ? parsed : null
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProductDetail(id)
  if (!product) return { title: "Product not found | AURA" }

  const title = product.metaTitle ?? `${product.name} | AURA`
  const description = product.metaDesc ?? product.description.slice(0, 160)
  const image = product.images[0]?.url

  return {
    title,
    description,
    alternates: { canonical: productHref(product.id) },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: productHref(product.id),
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
  }
}

/** schema.org Product + BreadcrumbList, for rich results (price, stock, stars). */
function structuredData(product: ProductDetail): string {
  const url = `${SITE_URL}${productHref(product.id)}`
  const inStock =
    product.variants.length > 0
      ? product.variants.some((variant) => variant.stockQuantity > 0)
      : product.stockQuantity > 0
  const breadcrumbs = [
    { name: "Products", url: `${SITE_URL}${PRODUCTS_PATH}` },
    ...(product.category.parent
      ? [
          {
            name: product.category.parent.name,
            url: `${SITE_URL}${categoryHref(product.category.parent.slug)}`,
          },
        ]
      : []),
    {
      name: product.category.name,
      url: `${SITE_URL}${categoryHref(product.category.slug)}`,
    },
    { name: product.name, url },
  ]

  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      sku: product.sku,
      description: product.metaDesc ?? product.description,
      image: product.images.map((image) => image.url),
      category: product.category.name,
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "BDT",
        price: product.discountPrice ?? product.basePrice,
        availability: inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      },
      ...(product.rating.count > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.rating.average,
          reviewCount: product.rating.count,
        },
      }),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    },
  ]
  // Escape "<" so product text can never close the <script> tag early.
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

const SERVICE_PROMISES = [
  {
    icon: BadgeCheck,
    title: "100% authentic",
    body: "Sourced from authorised distributors",
  },
  {
    icon: Wallet,
    title: "Cash on delivery",
    body: "Pay when it arrives, nationwide",
  },
  {
    icon: RotateCcw,
    title: "7-day easy returns",
    body: "Hassle-free pickup and refund",
  },
  {
    icon: Truck,
    title: "Fast delivery",
    body: "Tracked shipping across Bangladesh",
  },
] as const

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { id } = await params
  const query = await searchParams

  const product = await getProductDetail(id)
  if (!product) notFound()

  // Slugs and legacy /product/:slug links resolve here, then settle on the
  // canonical numeric URL (keeping ?variant= etc.) so there is one URL per product.
  if (id !== String(product.id)) {
    const rest = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      const single = firstParam(value)
      if (single !== undefined) rest.set(key, single)
    }
    const suffix = rest.toString()
    permanentRedirect(`${productHref(product.id)}${suffix ? `?${suffix}` : ""}`)
  }

  const reviewsPage = positiveInt(firstParam(query.reviews)) ?? 1
  const requestedVariant = positiveInt(firstParam(query.variant))
  const reviews = await getProductReviews(product.id, reviewsPage)

  const reviewsHref = (page: number): string => {
    const next = new URLSearchParams()
    if (requestedVariant !== null) next.set("variant", String(requestedVariant))
    if (page > 1) next.set("reviews", String(page))
    const suffix = next.toString()
    return `${productHref(product.id)}${suffix ? `?${suffix}` : ""}#reviews`
  }

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Products", href: PRODUCTS_PATH },
    ...(product.category.parent
      ? [
          {
            label: product.category.parent.name,
            href: categoryHref(product.category.parent.slug),
          },
        ]
      : []),
    { label: product.category.name, href: categoryHref(product.category.slug) },
    { label: product.name },
  ]

  return (
    <div className="page-container pt-6 pb-20 lg:pt-8">
      <script
        type="application/ld+json"
        // Structured data must be raw JSON; it is escaped in structuredData().
        dangerouslySetInnerHTML={{ __html: structuredData(product) }}
      />

      <Breadcrumbs items={crumbs} />

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14 xl:gap-20">
        {/* Gallery stays in view while the buyer works through the options */}
        <div className="self-start lg:sticky lg:top-20">
          <ProductGallery name={product.name} images={product.images} />
        </div>

        <div className="space-y-8 lg:py-2">
          <div className="space-y-4">
            <Link
              href={categoryHref(product.category.slug)}
              className="inline-flex h-8 items-center rounded-full bg-muted px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
            >
              {product.category.name}
            </Link>
            <h1 className="text-3xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px] text-muted-foreground">
              {product.rating.count > 0 ? (
                <a
                  href="#reviews"
                  className="flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <StarRating value={product.rating.average} size="md" />
                  <span className="font-medium text-foreground">
                    {product.rating.average.toFixed(1)}
                  </span>
                  <span className="underline-offset-4 hover:underline">
                    {product.rating.count}{" "}
                    {product.rating.count === 1 ? "review" : "reviews"}
                  </span>
                </a>
              ) : (
                <span>No reviews yet</span>
              )}
              {product.recentlySold > 0 && (
                <span className="flex items-center gap-2">
                  <span
                    className="size-1 rounded-full bg-muted-foreground/50"
                    aria-hidden="true"
                  />
                  {product.recentlySold} sold recently
                </span>
              )}
            </div>
          </div>

          <PurchasePanel
            basePrice={product.basePrice}
            discountPrice={product.discountPrice}
            stockQuantity={product.stockQuantity}
            optionGroups={product.optionGroups}
            variants={product.variants}
            initialVariantId={requestedVariant}
          />

          <ul className="grid gap-3 sm:grid-cols-2">
            {SERVICE_PROMISES.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="flex gap-3.5 rounded-2xl bg-muted/50 p-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-foreground shadow-xs">
                  <Icon className="size-5" />
                </span>
                <div className="space-y-0.5">
                  <p className="text-[15px] font-semibold text-foreground">
                    {title}
                  </p>
                  <p className="text-sm text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section
        aria-labelledby="details-heading"
        className="mt-20 grid gap-10 border-t border-border/60 pt-14 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16"
      >
        <div className="space-y-6">
          <h2
            id="details-heading"
            className="text-2xl font-semibold tracking-tight text-foreground"
          >
            Product details
          </h2>
          <ProductDescription description={product.description} />
        </div>
        <div className="h-fit space-y-5 rounded-3xl bg-muted/50 p-7">
          <h3 className="text-lg font-semibold text-foreground">
            Specifications
          </h3>
          <dl className="divide-y divide-border/70 text-[15px]">
            {[
              ["SKU", product.sku],
              ["Category", product.category.name],
              ...product.optionGroups.map(
                (group) =>
                  [
                    group.name,
                    group.values.map((value) => value.value).join(", "),
                  ] as const
              ),
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-6 py-3 first:pt-0 last:pb-0"
              >
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium text-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        id="reviews"
        aria-labelledby="reviews-heading"
        className="mt-20 scroll-mt-20 border-t border-border/60 pt-14"
      >
        <h2
          id="reviews-heading"
          className="mb-8 text-2xl font-semibold tracking-tight text-foreground"
        >
          Customer reviews
        </h2>
        <ReviewsSection
          rating={product.rating}
          reviews={reviews}
          pageHref={reviewsHref}
        />
      </section>

      {product.related.length > 0 && (
        <section
          aria-label="Related products"
          className="mt-20 border-t border-border/60 pt-14"
        >
          <ProductRail
            title="You may also like"
            action={
              <Link
                href={categoryHref(product.category.slug)}
                className="text-[15px] font-medium text-foreground underline-offset-4 hover:underline"
              >
                More in {product.category.name}
              </Link>
            }
          >
            {product.related.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </ProductRail>
        </section>
      )}
    </div>
  )
}
