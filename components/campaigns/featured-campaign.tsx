import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/catalog/product-card"
import { ProductRail } from "@/components/catalog/product-rail"
import { CampaignHero } from "@/components/campaigns/campaign-hero"
import type { FeaturedCampaign } from "@/lib/backend-campaigns"

/** Homepage: the featured live sale — compact hero with countdown, then its best sellers. */
export function FeaturedCampaignSection({ featured, serverNow }: { featured: FeaturedCampaign; serverNow: number }) {
  const href = `/campaigns/${featured.campaign.slug}`
  return (
    <section aria-label={featured.campaign.name} className="space-y-8">
      <Link href={href} className="block rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-ring/30">
        <CampaignHero campaign={featured.campaign} productCount={featured.productCount} serverNow={serverNow} compact />
      </Link>
      <ProductRail
        title="Best of the sale"
        description={`${featured.productCount} ${featured.productCount === 1 ? "product" : "products"} at sale prices — while it lasts.`}
        action={
          <Link href={href} className="inline-flex items-center gap-1 text-[15px] font-medium text-foreground underline-offset-4 hover:underline">
            Shop the sale
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        }
      >
        {featured.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ProductRail>
    </section>
  )
}
