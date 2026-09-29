import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowUpRight, CalendarDays, MonitorSmartphone, ShieldCheck } from "lucide-react"
import { auth } from "@/auth"
import { hasRole, ADMIN_ROLES } from "@/auth.config"
import { PasswordForm } from "@/components/account/password-form"
import { ProfileDetails } from "@/components/account/profile-details"
import { ThemeSettings } from "@/components/account/theme-settings"
import { Section } from "@/components/admin/products/form-primitives"
import { SignOutAllButton } from "@/components/sign-out-all-button"
import { Button } from "@/components/ui/button"
import * as backendAuth from "@/lib/backend-auth"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = { title: "Profile & security" }

const ROLE_LABELS: Record<string, string> = {
  USER: "Customer",
  ADMIN: "Store admin",
  SUPER_ADMIN: "Super admin",
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")

  // Fresh from the backend, not the (up to 5-minute-stale) session token.
  const profile = await backendAuth.fetchMe(session.accessToken)
  if (!profile) redirect("/login")
  const isStaff = hasRole(profile.role, ADMIN_ROLES)

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Profile & security</h1>
        <p className="text-base text-muted-foreground">Keep your details up to date and your account safe.</p>
      </div>

      <ProfileDetails profile={profile} />
      <ThemeSettings />
      <PasswordForm />

      <div className="grid items-start gap-6 md:grid-cols-2">
        <Section title="Signed-in devices" description="Lost a phone or used a shared computer?">
          <div className="space-y-4">
            <p className="flex gap-3 text-[15px] text-muted-foreground">
              <MonitorSmartphone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Sign out everywhere, including this browser. You&apos;ll need your password to sign in again.
            </p>
            <SignOutAllButton />
          </div>
        </Section>

        <Section title="Account">
          <dl className="space-y-3 text-[15px]">
            <div className="flex items-center justify-between gap-4">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="size-4" aria-hidden="true" />
                Member since
              </dt>
              <dd className="font-medium text-foreground">{formatDate(profile.createdAt)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Account type
              </dt>
              <dd className="font-medium text-foreground">{ROLE_LABELS[profile.role] ?? profile.role}</dd>
            </div>
          </dl>
          {isStaff && (
            <Button asChild variant="outline" className="mt-5 h-10 w-full rounded-xl">
              <Link href="/admin">
                Open admin console
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          )}
        </Section>
      </div>
    </div>
  )
}
