import { cache } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { fetchMe, type UserProfile } from "@/lib/backend-auth"
import { can, type Requirement } from "@/lib/permissions"

export interface AdminAccess {
  accessToken: string
  profile: UserProfile
  can: (requirement: Requirement) => boolean
}

/**
 * The signed-in staff member and what they may do, fresh from the API.
 * Cached per request, so the layout and the page share one lookup.
 */
export const getAdminAccess = cache(async (): Promise<AdminAccess> => {
  const session = await auth()
  if (!session?.accessToken) redirect("/login?callbackUrl=/admin")
  const profile = await fetchMe(session.accessToken)
  if (!profile) redirect("/login?error=SessionExpired")
  if (profile.role === "USER") redirect("/dashboard")
  return {
    accessToken: session.accessToken,
    profile,
    can: (requirement) => can(profile, requirement),
  }
})
