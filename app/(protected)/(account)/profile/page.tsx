import { redirect } from "next/navigation"
import { auth } from "@/auth"
import * as backendAuth from "@/lib/backend-auth"
import { getInitials } from "@/lib/utils"
import { ProfileForm } from "@/components/profile-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")

  // Fresh from the backend, not the (up to 5-minute-stale) session token.
  const profile = await backendAuth.fetchMe(session.accessToken)
  if (!profile) redirect("/login")

  return (
    <div className="page-container py-6 lg:py-8">
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account details.
          </p>
        </div>

        <Card>
          <CardHeader className="flex-row items-center gap-4">
            <Avatar size="lg">
              {profile.avatarUrl && (
                <AvatarImage src={profile.avatarUrl} alt="" />
              )}
              <AvatarFallback>
                {getInitials(profile.name, profile.email)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <CardTitle>{profile.name || "Unnamed"}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
              <div className="flex items-center gap-2 pt-1">
                <Badge variant="secondary">
                  {profile.role.replace("_", " ")}
                </Badge>
                <Badge variant={profile.isActive ? "outline" : "destructive"}>
                  {profile.isActive ? "Active" : "Deactivated"}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit details</CardTitle>
            <CardDescription>
              Update your name, phone, and profile photo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
