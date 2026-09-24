"use client"

import { Suspense, useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Lock, Mail } from "lucide-react"
import {
  AuthHeading,
  FormMessage,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/auth/auth-fields"
import { Skeleton } from "@/components/ui/skeleton"

/** Notices other flows send here via ?registered / ?reset / ?error. */
const NOTICES: Record<string, { tone: "success" | "error"; text: string }> = {
  registered: {
    tone: "success",
    text: "Your account is ready — sign in to continue.",
  },
  reset: {
    tone: "success",
    text: "Password updated. Sign in with your new password.",
  },
  AccountDisabled: {
    tone: "error",
    text: "This account has been deactivated. Contact support for help.",
  },
  SessionExpired: {
    tone: "error",
    text: "Your session expired. Please sign in again.",
  },
}

/** NextAuth reports generic codes for some failures; show people a sentence. */
function friendlyError(error: string): string {
  if (error === "CredentialsSignin" || /invalid credentials/i.test(error)) {
    return "Incorrect email or password."
  }
  return error
}

function LoginForm() {
  const params = useSearchParams()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const noticeKey = params.get("registered")
    ? "registered"
    : params.get("reset")
      ? "reset"
      : (params.get("error") ?? "")
  const notice = NOTICES[noticeKey]

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: params.get("callbackUrl") ?? "/dashboard",
      })

      if (result?.error) {
        setError(friendlyError(result.error))
        return
      }

      window.location.href = result?.url ?? "/dashboard"
    })
  }

  return (
    <div className="space-y-8">
      <AuthHeading
        title="Welcome back"
        description="Sign in to your AURA account to continue."
      />

      <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
        {notice && <FormMessage tone={notice.tone}>{notice.text}</FormMessage>}
        {error && <FormMessage tone="error">{error}</FormMessage>}

        <TextField
          id="email"
          label="Email"
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
          required
        />

        <PasswordField
          id="password"
          label="Password"
          icon={Lock}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          labelAction={
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          }
        />

        <SubmitButton pending={isPending} pendingLabel="Signing in…">
          Sign in
        </SubmitButton>
      </form>

      <p className="text-center text-[15px] text-muted-foreground">
        New to AURA?{" "}
        <Link
          href="/register"
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  )
}

function LoginSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true">
      <div className="space-y-3">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-full" />
      </div>
      <div className="space-y-5">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}
