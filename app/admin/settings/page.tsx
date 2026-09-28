import type { Metadata } from "next"
import { SettingsForm } from "@/components/admin/settings/settings-form"
import { getStoreSettingsFresh } from "@/lib/backend-settings"
import { AccessDenied } from "@/components/admin/access-denied"
import { getAdminAccess } from "@/lib/admin-access"

export const metadata: Metadata = { title: "Settings · Admin" }

export default async function AdminSettingsPage() {
  const access = await getAdminAccess()
  if (!access.can("settings.manage")) return <AccessDenied area="store settings" />

  const settings = await getStoreSettingsFresh(access.accessToken)
  return <SettingsForm initial={settings} />
}
