import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { AccessDenied } from "@/components/admin/access-denied"
import { CampaignActions } from "@/components/admin/campaigns/campaign-actions"
import { CampaignEditor } from "@/components/admin/campaigns/campaign-editor"
import { Section } from "@/components/admin/products/form-primitives"
import { getAdminAccess } from "@/lib/admin-access"
import { getCategoryTree } from "@/lib/backend-admin-products"
import { getAdminCampaign } from "@/lib/backend-campaigns"
import { formatPrice } from "@/lib/format"

export const metadata: Metadata = { title: "Campaign · Admin" }

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/50 px-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-xl font-semibold text-foreground tabular-nums">{value}</dd>
    </div>
  )
}

export default async function CampaignPage({ params }: PageProps<"/admin/campaigns/[id]">) {
  const access = await getAdminAccess()
  if (!access.can("campaigns.manage")) return <AccessDenied area="campaigns" />

  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) notFound()
  const [campaign, categories] = await Promise.all([getAdminCampaign(access.accessToken, id), getCategoryTree()])
  if (!campaign) notFound()
  // eslint-disable-next-line react-hooks/purity -- request time, seeds the preview countdown
  const now = Date.now()

  const performance = (
    <Section
      title="Performance"
      description="From orders that weren't cancelled."
      action={<CampaignActions campaign={campaign} afterDelete="list" />}
    >
      <dl className="grid grid-cols-2 gap-3">
        <Stat label="Revenue" value={formatPrice(campaign.stats.revenue)} />
        <Stat label="Items sold" value={campaign.stats.units.toLocaleString("en-US")} />
        <Stat label="Orders" value={campaign.stats.orders.toLocaleString("en-US")} />
        <Stat label="Products covered" value={campaign.coveredProductCount.toLocaleString("en-US")} />
      </dl>
      {campaign.isActive && (
        <Link href={`/campaigns/${campaign.slug}`} target="_blank" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline">
          View sale page <ExternalLink className="size-3.5" aria-hidden="true" />
        </Link>
      )}
    </Section>
  )

  return (
    <CampaignEditor
      key={campaign.updatedAt}
      campaign={campaign}
      categories={categories}
      defaults={{ startsAt: campaign.startsAt, endsAt: campaign.endsAt }}
      serverNow={now}
      aside={performance}
    />
  )
}
