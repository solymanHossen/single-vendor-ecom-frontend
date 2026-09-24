import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/storefront/footer"
import { HeroSection } from "@/components/home/hero-section"
import { DepartmentGrid } from "@/components/home/department-grid"
import { CollectionsShowcase } from "@/components/home/collections-showcase"
import { PromoBanner } from "@/components/home/promo-banner"
import { SectionHeader } from "@/components/home/section-header"
import { ProductCard } from "@/components/catalog/product-card"
import { ProductRail } from "@/components/catalog/product-rail"
import { getHeroBanners, type HeroBanner } from "@/lib/backend-hero"
import { getCatalogPage, getNavigation } from "@/lib/backend-storefront"
import { collectionHref } from "@/lib/routes"
import type { CatalogPage } from "@/lib/storefront-types"

function toBannerSlide(banner: HeroBanner) {
  return {
    id: String(banner.id),
    title: banner.title,
    image: banner.imageUrl,
    href: banner.href,
  }
}

/** Home-page rails degrade to "section hidden" if the catalog is unavailable. */
async function safeCatalog(
  request: Promise<CatalogPage | null>
): Promise<CatalogPage["items"]> {
  try {
    return (await request)?.items ?? []
  } catch (error: unknown) {
    console.error("[home] catalog rail unavailable:", error)
    return []
  }
}

function RailLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-[15px] font-medium text-foreground underline-offset-4 hover:underline"
    >
      {label}
    </Link>
  )
}

/**
 * Home page flow: hero → departments → deals → collections → new arrivals →
 * live offer → best sellers. Every section is server-rendered from live
 * catalog data (cached 60s), so the page is fast, crawlable and never shows
 * placeholder products.
 */
export default async function Page() {
  const [
    mainBanners,
    sideBanners,
    navigation,
    deals,
    newArrivals,
    bestSellers,
  ] = await Promise.all([
    getHeroBanners("MAIN"),
    getHeroBanners("SIDE"),
    getNavigation(),
    safeCatalog(
      getCatalogPage(
        { sort: "best-selling", page: 1, collection: "on-sale" },
        { limit: 12 }
      )
    ),
    safeCatalog(getCatalogPage({ sort: "newest", page: 1 }, { limit: 12 })),
    safeCatalog(
      getCatalogPage({ sort: "best-selling", page: 1 }, { limit: 8 })
    ),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      <Header />
      <main className="flex flex-1 flex-col">
        <HeroSection
          mainSlides={mainBanners.map(toBannerSlide)}
          sideCards={sideBanners.map(toBannerSlide)}
        />

        <div className="page-container space-y-24 pt-12 pb-24 lg:space-y-28 lg:pt-16">
          <DepartmentGrid categories={navigation.categories} />

          {deals.length > 0 && (
            <ProductRail
              title="Top deals"
              description="The biggest price drops, updated live."
              action={
                <RailLink
                  href={collectionHref("on-sale")}
                  label="View all deals"
                />
              }
            >
              {deals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductRail>
          )}

          <CollectionsShowcase collections={navigation.collections} />

          {newArrivals.length > 0 && (
            <ProductRail
              title="New arrivals"
              description="Fresh in this season."
              action={
                <RailLink
                  href={collectionHref("new-arrivals")}
                  label="Shop new arrivals"
                />
              }
            >
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductRail>
          )}

          <PromoBanner
            promotion={navigation.promotion}
            spotlight={navigation.spotlight}
          />

          {bestSellers.length > 0 && (
            <section aria-label="Best sellers">
              <SectionHeader
                title="Best sellers"
                description="What customers are buying most right now."
                action={{
                  label: "View all best sellers",
                  href: collectionHref("best-sellers"),
                }}
              />
              <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
                {bestSellers.map((product) => (
                  <li key={product.id}>
                    <ProductCard product={product} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
