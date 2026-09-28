import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AccountNav } from "@/components/account/account-nav"
import { fetchMe } from "@/lib/backend-auth"

const memberSince = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "Asia/Dhaka",
})

/** Shared frame for every customer account page: identity + menu, then content. */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")
  const profile = await fetchMe(session.accessToken)
  if (!profile) redirect("/login")

  return (
    <div className="page-container py-8 lg:py-12">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:gap-12">
        <AccountNav
          user={{
            name: profile.name,
            email: profile.email,
            avatarUrl: profile.avatarUrl,
            memberSince: memberSince.format(new Date(profile.createdAt)),
          }}
        />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
