"use client"

import * as React from "react"
import { useFormStatus } from "react-dom"
import {
  Check,
  CircleAlert,
  CircleCheck,
  Eye,
  EyeOff,
  Loader2,
  type LucideIcon,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const INPUT_CLASS =
  "h-12 rounded-xl bg-background pl-11 text-base shadow-xs transition-[border-color,box-shadow] duration-150 focus-visible:ring-4 focus-visible:ring-ring/15 md:text-base"

// ── Headings & messages ─────────────────────────────────────────────────────

export function AuthHeading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="text-base text-muted-foreground">{description}</p>
    </div>
  )
}


// ── Fields ──────────────────────────────────────────────────────────────────

interface FieldProps extends Omit<
  React.ComponentProps<"input">,
  "id" | "name"
> {
  id: string
  label: string
  icon: LucideIcon
  /** Right-aligned element on the label row, e.g. "Forgot password?". */
  labelAction?: React.ReactNode
  hint?: string
}

export function TextField({
  id,
  label,
  icon: Icon,
  labelAction,
  hint,
  className,
  ...props
}: FieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-[15px] font-medium">
          {label}
        </Label>
        {labelAction}
      </div>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={id}
          name={id}
          className={cn(INPUT_CLASS, className)}
          {...props}
        />
      </div>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
  )
}

// Mirrors the backend password policy (see lib/validators.ts).
const PASSWORD_RULES = [
  { label: "8+ characters", test: (value: string) => value.length >= 8 },
  { label: "Uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "Lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "Number", test: (value: string) => /\d/.test(value) },
] as const

const STRENGTH_LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"] as const
const STRENGTH_COLORS = [
  "bg-muted-foreground/30",
  "bg-destructive",
  "bg-amber-500",
  "bg-lime-500",
  "bg-emerald-500",
] as const

interface PasswordFieldProps extends Omit<FieldProps, "type"> {
  /** Show the live strength meter and policy checklist (sign-up / reset). */
  showStrength?: boolean
  /** Called with the current value, e.g. so a confirm field can compare. */
  onValueChange?: (value: string) => void
  /** Optional status shown under the field (e.g. "Passwords match"). */
  status?: { tone: "success" | "error"; text: string } | null
}

export function PasswordField({
  showStrength = false,
  onValueChange,
  status,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = React.useState(false)
  const [value, setValue] = React.useState("")
  const passed = PASSWORD_RULES.filter((rule) => rule.test(value)).length

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <TextField
          {...props}
          type={visible ? "text" : "password"}
          className="pr-12"
          onChange={(event) => {
            setValue(event.target.value)
            onValueChange?.(event.target.value)
          }}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {visible ? (
            <EyeOff className="size-4.5" />
          ) : (
            <Eye className="size-4.5" />
          )}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="space-y-2.5" aria-live="polite">
          <div className="flex items-center gap-3">
            <div className="grid flex-1 grid-cols-4 gap-1.5">
              {PASSWORD_RULES.map((rule, index) => (
                <span
                  key={rule.label}
                  className={cn(
                    "h-1.5 rounded-full transition-colors duration-300",
                    index < passed ? STRENGTH_COLORS[passed] : "bg-muted"
                  )}
                />
              ))}
            </div>
            <span className="w-16 text-right text-sm font-medium text-muted-foreground">
              {STRENGTH_LABELS[passed]}
            </span>
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(value)
              return (
                <li
                  key={rule.label}
                  className={cn(
                    "flex items-center gap-2 text-sm transition-colors",
                    ok ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full transition-colors",
                      ok ? "bg-emerald-500 text-white" : "bg-muted"
                    )}
                  >
                    {ok && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  {rule.label}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {status && (
        <p
          className={cn(
            "flex items-center gap-2 text-sm font-medium",
            status.tone === "success"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive"
          )}
          aria-live="polite"
        >
          {status.tone === "success" ? (
            <CircleCheck className="size-4" />
          ) : (
            <CircleAlert className="size-4" />
          )}
          {status.text}
        </p>
      )}
    </div>
  )
}

// ── Submit ──────────────────────────────────────────────────────────────────

/**
 * Submit button with a spinner. Works both with server actions (reads
 * useFormStatus) and with client handlers (pass `pending` explicitly).
 */
export function SubmitButton({
  children,
  pendingLabel,
  pending,
}: {
  children: React.ReactNode
  pendingLabel: string
  pending?: boolean
}) {
  const status = useFormStatus()
  const isPending = pending ?? status.pending

  return (
    <Button
      type="submit"
      disabled={isPending}
      className="h-12 w-full rounded-xl text-base font-semibold shadow-sm"
    >
      {isPending ? (
        <>
          <Loader2 className="size-5 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
