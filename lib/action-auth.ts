import { auth } from "@/auth"
import { fetchMe } from "@/lib/backend-auth"
import { can, type Requirement } from "@/lib/permissions"

/**
 * For Server Actions: the caller's access token if they currently have the
 * requirement, else null. Reads live permissions (not the up-to-5-minute-old
 * session), because actions are callable directly, whatever page rendered
 * them. The API enforces the same rule again.
 */
export async function tokenIfPermitted(requirement: Requirement): Promise<string | null> {
  const session = await auth()
  if (!session?.accessToken) return null
  const profile = await fetchMe(session.accessToken)
  return profile && can(profile, requirement) ? session.accessToken : null
}
