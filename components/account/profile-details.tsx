"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { Camera, Loader2, Lock } from "lucide-react"
import { toast } from "sonner"
import { updateProfileAction, uploadAvatarAction } from "@/actions/profile.actions"
import type { UserProfile } from "@/lib/backend-auth"
import { cn, getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Field, INPUT_CLASS, Section } from "@/components/admin/products/form-primitives"
import { checkImage, formatBytes, IMAGE_ACCEPT, IMAGE_TYPES_LABEL, UPLOAD_LIMITS } from "@/lib/upload-rules"

export function ProfileDetails({ profile }: { profile: UserProfile }) {
  const { update } = useSession()
  const [avatarUrl, setAvatarUrl] = React.useState(profile.avatarUrl)
  const [name, setName] = React.useState(profile.name ?? "")
  const [phone, setPhone] = React.useState(profile.phone ?? "")
  const [saved, setSaved] = React.useState({ name: profile.name ?? "", phone: profile.phone ?? "" })
  const [uploading, startUpload] = React.useTransition()
  const [saving, startSave] = React.useTransition()
  const fileRef = React.useRef<HTMLInputElement>(null)

  const dirty = name.trim() !== saved.name || phone.trim() !== saved.phone

  const upload = (file: File) => {
    const problem = checkImage(file, "avatar")
    if (problem) {
      toast.error(problem.title, { description: problem.description })
      return
    }
    startUpload(async () => {
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadAvatarAction(formData)
      if ("error" in result) {
        toast.error("Photo upload failed", { description: result.error })
        return
      }
      setAvatarUrl(result.profile.avatarUrl)
      // Header avatar follows without a reload.
      await update({ name: result.profile.name, avatarUrl: result.profile.avatarUrl })
      toast.success("Profile photo updated")
    })
  }

  const save = () =>
    startSave(async () => {
      const formData = new FormData()
      formData.set("name", name)
      formData.set("phone", phone)
      const result = await updateProfileAction(undefined, formData)
      if (result.error || !result.profile) {
        toast.error("Couldn't save your details", { description: result.error })
        return
      }
      const next = { name: result.profile.name ?? "", phone: result.profile.phone ?? "" }
      setSaved(next)
      setName(next.name)
      setPhone(next.phone)
      await update({ name: result.profile.name, avatarUrl: result.profile.avatarUrl })
      toast.success("Details saved")
    })

  return (
    <Section title="Personal information" description="How we address you and reach you about orders.">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (dirty) save()
        }}
        className="space-y-7"
      >
        <div className="flex flex-wrap items-center gap-5">
          <div className="relative">
            <Avatar className="size-24">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
              <AvatarFallback className="text-2xl">{getInitials(profile.name, profile.email)}</AvatarFallback>
            </Avatar>
            {uploading && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
                <Loader2 className="size-6 animate-spin" />
              </span>
            )}
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">Profile photo</p>
            <p className="text-sm text-muted-foreground">
              {IMAGE_TYPES_LABEL}, up to {formatBytes(UPLOAD_LIMITS.avatar)}. Saved as soon as you pick it.
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-lg"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Camera className="size-4" />
              {avatarUrl ? "Change photo" : "Upload photo"}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept={IMAGE_ACCEPT}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ""
                if (file) upload(file)
              }}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="profile-name" label="Full name">
            <input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              maxLength={150}
              className={INPUT_CLASS}
            />
          </Field>
          <Field id="profile-phone" label="Mobile number" optional hint="Used to prefill new delivery addresses.">
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              placeholder="01712345678"
              maxLength={20}
              className={cn(INPUT_CLASS, "tabular-nums")}
            />
          </Field>
          <Field id="profile-email" label="Email" hint="Your sign-in email can't be changed here.">
            <div className="relative">
              <input id="profile-email" value={profile.email} disabled className={cn(INPUT_CLASS, "pr-10")} />
              <Lock className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            </div>
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" className="h-11 rounded-xl px-6 font-semibold" disabled={!dirty || saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save changes
          </Button>
          {dirty && (
            <Button
              type="button"
              variant="ghost"
              className="h-11 rounded-xl"
              disabled={saving}
              onClick={() => {
                setName(saved.name)
                setPhone(saved.phone)
              }}
            >
              Discard
            </Button>
          )}
        </div>
      </form>
    </Section>
  )
}
