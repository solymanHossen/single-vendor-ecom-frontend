"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Lock, Mail, User } from "lucide-react"
import { registerAction } from "@/actions/auth.actions"
import { useActionErrorToast } from "@/hooks/use-action-toast"
import {
  AuthHeading,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/auth/auth-fields"

export default function RegisterPage() {
  const [state, action] = useActionState(registerAction, undefined)
  useActionErrorToast(state, "Couldn't create your account")

  return (
    <div className="space-y-8">
      <AuthHeading
        title="Create your account"
        description="Join AURA for faster checkout, order tracking and saved wishlists."
      />

      <form action={action} className="space-y-5">
        <TextField
          id="name"
          label="Full name"
          icon={User}
          placeholder="Your name"
          autoComplete="name"
          autoFocus
          required
        />

        <TextField
          id="email"
          label="Email"
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <PasswordField
          id="password"
          label="Password"
          icon={Lock}
          placeholder="Create a password"
          autoComplete="new-password"
          showStrength
          required
        />

        <SubmitButton pendingLabel="Creating account…">
          Create account
        </SubmitButton>

        <p className="text-center text-sm text-muted-foreground">
          By creating an account you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <p className="text-center text-[15px] text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
