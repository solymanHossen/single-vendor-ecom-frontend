import type { Metadata } from "next"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import { BadgeCheck, RotateCcw, Truck, Wallet } from "lucide-react"
import { Breadcrumbs } from "@/components/catalog/breadcrumbs"
import { ProductCard } from "@/components/catalog/product-card"
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
    <div className="page-container py-6 lg:py-8">
      <script
        type="application/ld+json"
        // Structured data must be raw JSON; it is escaped in structuredData().
        dangerouslySetInnerHTML={{ __html: structuredData(product) }}
      />

      <Breadcrumbs items={crumbs} />

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery name={product.name} images={product.images} />

        <div className="space-y-6">
          <div className="space-y-3">
            <Link
              href={categoryHref(product.category.slug)}
              className="text-xs font-semibold tracking-wider text-primary uppercase hover:underline"
            >
              {product.category.name}
            </Link>
            <h1 className="text-2xl leading-tight font-bold tracking-tight text-foreground sm:text-3xl">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {product.rating.count > 0 ? (
                <a
                  href="#reviews"
                  className="flex items-center gap-1.5 hover:text-foreground"
                >
                  <StarRating value={product.rating.average} />
                  <span>
                    {product.rating.average.toFixed(1)} · {product.rating.count}{" "}
                    {product.rating.count === 1 ? "review" : "reviews"}
                  </span>
                </a>
              ) : (
                <span>No reviews yet</span>
              )}
              {product.recentlySold > 0 && (
                <span>{product.recentlySold} sold recently</span>
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

          <ul className="grid grid-cols-2 gap-3 border-t border-border/60 pt-6">
            {SERVICE_PROMISES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-2.5">
                <Icon className="mt-0.5 size-4.5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section
        aria-labelledby="details-heading"
        className="mt-14 grid gap-10 lg:grid-cols-[1fr_320px]"
      >
        <div className="space-y-4">
          <h2
            id="details-heading"
            className="text-lg font-bold text-foreground"
          >
            Product details
          </h2>
          <ProductDescription description={product.description} />
        </div>
        <dl className="h-fit space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-5 text-sm">
          <h3 className="text-sm font-bold text-foreground">Specifications</h3>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">SKU</dt>
            <dd className="font-medium text-foreground">{product.sku}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Category</dt>
            <dd className="font-medium text-foreground">
              {product.category.name}
            </dd>
          </div>
          {product.optionGroups.map((group) => (
            <div key={group.attributeId} className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{group.name}</dt>
              <dd className="text-right font-medium text-foreground">
                {group.values.map((value) => value.value).join(", ")}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        id="reviews"
        aria-labelledby="reviews-heading"
        className="mt-14 scroll-mt-32 border-t border-border/60 pt-10"
      >
        <h2
          id="reviews-heading"
          className="mb-6 text-lg font-bold text-foreground"
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
          aria-labelledby="related-heading"
          className="mt-14 border-t border-border/60 pt-10"
        >
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2
              id="related-heading"
              className="text-lg font-bold text-foreground"
            >
              You may also like
            </h2>
            <Link
              href={categoryHref(product.category.slug)}
              className="text-sm font-medium text-primary hover:underline"
            >
              More in {product.category.name}
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {product.related.slice(0, 8).map((related) => (
              <li key={related.id}>
                <ProductCard product={related} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
