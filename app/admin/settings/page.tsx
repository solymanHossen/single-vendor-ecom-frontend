import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { hasRole, SUPER_ADMIN_ROLES } from "@/auth.config"
import { SettingsForm } from "@/components/admin/settings/settings-form"
import { getStoreSettingsFresh } from "@/lib/backend-settings"

export const metadata: Metadata = { title: "Settings · Admin" }

export default async function AdminSettingsPage() {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")
  // Layout lets any ADMIN in; store-wide settings are SUPER_ADMIN only.
  if (!hasRole(session.user.role, SUPER_ADMIN_ROLES)) redirect("/admin")

  const settings = await getStoreSettingsFresh(session.accessToken)
  return <SettingsForm initial={settings} />
}
