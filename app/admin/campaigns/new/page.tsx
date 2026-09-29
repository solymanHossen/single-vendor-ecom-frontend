import type { Metadata } from "next"
import { AccessDenied } from "@/components/admin/access-denied"
import { CampaignEditor } from "@/components/admin/campaigns/campaign-editor"
import { getAdminAccess } from "@/lib/admin-access"
import { getCategoryTree } from "@/lib/backend-admin-products"

export const metadata: Metadata = { title: "New campaign · Admin" }

export default async function NewCampaignPage() {
  const access = await getAdminAccess()
  if (!access.can("campaigns.manage")) return <AccessDenied area="campaigns" />
  const categories = await getCategoryTree()

  // eslint-disable-next-line react-hooks/purity -- request-time defaults
  const now = Date.now()
  // Tomorrow 00:00 → one week later 23:59, Dhaka time.
  const dhakaToday = new Date(now + 6 * 3_600_000).toISOString().slice(0, 10)
  const start = new Date(`${dhakaToday}T00:00:00+06:00`).getTime() + 86_400_000
  const defaults = {
    startsAt: new Date(start).toISOString(),
    endsAt: new Date(start + 7 * 86_400_000 - 60_000).toISOString(),
  }

  return <CampaignEditor campaign={null} categories={categories} defaults={defaults} serverNow={now} />
}
