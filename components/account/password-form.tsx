"use client"

import * as React from "react"
import { KeyRound, Loader2, Lock } from "lucide-react"
import { toast } from "sonner"
import { changePasswordAction } from "@/actions/security.actions"
import { PasswordField } from "@/components/auth/auth-fields"
import { Button } from "@/components/ui/button"
import { Section } from "@/components/admin/products/form-primitives"

/** Same policy as the API's PasswordSchema. */
const STRONG = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/

export function PasswordForm() {
  const [current, setCurrent] = React.useState("")
  const [next, setNext] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [formKey, setFormKey] = React.useState(0)
  const [pending, startTransition] = React.useTransition()

  const matchStatus =
    confirm.length === 0
      ? null
      : confirm === next
        ? { tone: "success" as const, text: "Passwords match" }
        : { tone: "error" as const, text: "Passwords don't match yet" }
  const ready = current.length > 0 && STRONG.test(next) && next === confirm

  const submit = () =>
    startTransition(async () => {
      const result = await changePasswordAction({ currentPassword: current, newPassword: next })
      if ("error" in result) {
        toast.error("Password not changed", { description: result.error })
        return
      }
      setCurrent("")
      setNext("")
      setConfirm("")
      setFormKey((key) => key + 1) // resets the fields' internal state too
      toast.success("Password changed", {
        description: "Use it next time you sign in. You stay signed in here.",
      })
    })

  return (
    <Section title="Password" description="Use at least 8 characters with upper- and lower-case letters and a number.">
      <form
        key={formKey}
        onSubmit={(event) => {
          event.preventDefault()
          if (ready) submit()
        }}
        className="max-w-xl space-y-5"
      >
        <PasswordField
          id="currentPassword"
          label="Current password"
          icon={Lock}
          autoComplete="current-password"
          onValueChange={setCurrent}
          required
        />
        <PasswordField
          id="newPassword"
          label="New password"
          icon={KeyRound}
          autoComplete="new-password"
          showStrength
          onValueChange={setNext}
          required
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm new password"
          icon={KeyRound}
          autoComplete="new-password"
          onValueChange={setConfirm}
          status={matchStatus}
          required
        />
        <Button type="submit" className="h-11 rounded-xl px-6 font-semibold" disabled={!ready || pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Update password
        </Button>
      </form>
    </Section>
  )
}
