import type { Metadata } from "next"
import { AccessDenied } from "@/components/admin/access-denied"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { RolesManager } from "@/components/admin/roles/roles-manager"
import { getAdminAccess } from "@/lib/admin-access"
import { getPermissionCatalog, getStaffRoles } from "@/lib/backend-access"

export const metadata: Metadata = { title: "Roles & permissions · Admin" }

export default async function AdminRolesPage() {
  const access = await getAdminAccess()
  if (!access.can("owner")) return <AccessDenied area="roles & permissions" ownerOnly />

  const [roles, catalog] = await Promise.all([
    getStaffRoles(access.accessToken),
    getPermissionCatalog(access.accessToken),
  ])

  return (
    <>
      <AdminPageHeader
        title="Roles & permissions"
        description="Decide what each kind of staff member can do. Changes apply to everyone with the role on their very next click."
      />
      <RolesManager initialRoles={roles} catalog={catalog} />
    </>
  )
}
