"use client"

import { useActionState, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { KeyRound, Lock } from "lucide-react"
import { resetPasswordAction } from "@/actions/auth.actions"
import { useActionErrorToast } from "@/hooks/use-action-toast"
import {
  AuthHeading,
  PasswordField,
  SubmitButton,
} from "@/components/auth/auth-fields"

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  // Bind the token so the server action receives it alongside the form.
  const [state, action] = useActionState(
    resetPasswordAction.bind(null, token),
    undefined
  )
  const router = useRouter()
  useActionErrorToast(state, "Couldn't update your password", {
    action: {
      label: "New link",
      onClick: () => router.push("/forgot-password"),
    },
  })
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  const matchStatus =
    confirm.length === 0
      ? null
      : confirm === password
        ? { tone: "success" as const, text: "Passwords match" }
        : { tone: "error" as const, text: "Passwords don't match yet" }

  return (
    <div className="space-y-8">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <KeyRound className="size-7" />
      </span>
      <AuthHeading
        title="Set a new password"
        description="Choose a strong password you haven't used before."
      />

      <form action={action} className="space-y-5">

        <PasswordField
          id="password"
          label="New password"
          icon={Lock}
          placeholder="Create a password"
          autoComplete="new-password"
          showStrength
          onValueChange={setPassword}
          autoFocus
          required
        />

        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          icon={Lock}
          placeholder="Repeat your password"
          autoComplete="new-password"
          onValueChange={setConfirm}
          status={matchStatus}
          required
        />

        <SubmitButton pendingLabel="Updating password…">
          Update password
        </SubmitButton>
      </form>
    </div>
  )
}
