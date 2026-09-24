"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, MailCheck } from "lucide-react"
import { forgotPasswordAction } from "@/actions/auth.actions"
import { useActionErrorToast } from "@/hooks/use-action-toast"
import {
  AuthHeading,
  SubmitButton,
  TextField,
} from "@/components/auth/auth-fields"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(forgotPasswordAction, undefined)
  const [email, setEmail] = useState("")
  const [editing, setEditing] = useState(false)
  useActionErrorToast(state, "Couldn't send the reset link")

  const backToSignIn = (
    <Link
      href="/login"
      className="inline-flex items-center gap-2 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Back to sign in
    </Link>
  )

  // Success: replace the form with a clear "check your inbox" confirmation.
  if (state?.success && !editing) {
    return (
      <div className="space-y-8">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MailCheck className="size-7" />
        </span>
        <AuthHeading
          title="Check your email"
          description={`If an account exists for ${email || "that address"}, we've sent a link to reset your password. It expires shortly, so use it soon.`}
        />
        <div className="space-y-3">
          <Button
            asChild
            className="h-12 w-full rounded-xl text-base font-semibold"
          >
            <Link href="/login">Return to sign in</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditing(true)}
            className="h-12 w-full rounded-xl text-base font-medium"
          >
            Use a different email
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Didn&apos;t get it? Check your spam folder, or try again in a minute.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {backToSignIn}
      <AuthHeading
        title="Forgot your password?"
        description="Enter the email you signed up with and we'll send you a secure reset link."
      />

      <form
        action={(formData) => {
          setEmail(String(formData.get("email") ?? ""))
          setEditing(false)
          action(formData)
        }}
        className="space-y-5"
      >
        <TextField
          id="email"
          label="Email"
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          defaultValue={email}
          autoFocus
          required
        />

        <SubmitButton pendingLabel="Sending link…">
          Send reset link
        </SubmitButton>
      </form>
    </div>
  )
}
