"use client"

import * as React from "react"
import Link from "next/link"
import { Check, Loader2, ShieldCheck, User } from "lucide-react"
import { toast } from "sonner"
import { setUserAccessAction } from "@/actions/access.actions"
import type { PermissionGroup, StaffRole } from "@/lib/backend-access"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type Choice = "customer" | number

export function UserAccessEditor({
  userId,
  email,
  current,
  roles,
  catalog,
}: {
  userId: number
  email: string
  /** "customer" or the staff role id (null = staff without a role). */
  current: Choice | null
  roles: StaffRole[]
  catalog: PermissionGroup[]
}) {
  const [choice, setChoice] = React.useState<Choice | null>(current)
  const [saved, setSaved] = React.useState<Choice | null>(current)
  const [pending, startTransition] = React.useTransition()

  const labels = new Map(catalog.flatMap((group) => group.permissions.map((p) => [p.key, p.label] as const)))
  const selectedRole = typeof choice === "number" ? roles.find((role) => role.id === choice) : undefined

  const save = () => {
    if (choice === null) return
    startTransition(async () => {
      const result = await setUserAccessAction(
        userId,
        choice === "customer" ? { role: "USER", staffRoleId: null } : { role: "ADMIN", staffRoleId: choice },
      )
      if ("error" in result) {
        toast.error("Couldn't change access", { description: result.error })
        return
      }
      setSaved(choice)
      toast.success("Access updated", {
        description:
          choice === "customer"
            ? `${email} is a customer again and can't open the admin console.`
            : `${email} now has the “${result.user.staffRole?.name}” role. It applies immediately.`,
      })
    })
  }

  const options: Array<{ key: Choice; title: string; detail: string; icon: typeof User }> = [
    { key: "customer", title: "Customer", detail: "No admin console access.", icon: User },
    ...roles.map((role) => ({
      key: role.id as Choice,
      title: role.name,
      detail: `${role.permissions.length} permissions${role.description ? ` · ${role.description}` : ""}`,
      icon: ShieldCheck,
    })),
  ]

  return (
    <div className="space-y-5">
      <div className="grid gap-2.5" role="radiogroup" aria-label="Access">
        {options.map((option) => {
          const selected = option.key === choice
          const Icon = option.icon
          return (
            <button
              key={String(option.key)}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setChoice(option.key)}
              className={cn(
                "flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-[border-color,box-shadow]",
                selected ? "border-foreground shadow-[0_0_0_1px_var(--foreground)]" : "border-border hover:border-foreground/40"
              )}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2 font-medium text-foreground">
                  {option.title}
                  {option.key === saved && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Current</span>
                  )}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">{option.detail}</span>
              </span>
              <span
                className={cn(
                  "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                  selected ? "border-foreground bg-foreground" : "border-border"
                )}
                aria-hidden="true"
              >
                {selected && <Check className="size-3 text-background" strokeWidth={3} />}
              </span>
            </button>
          )
        })}
      </div>

      {selectedRole && (
        <div className="rounded-2xl bg-muted/50 p-4">
          <p className="mb-2.5 text-sm font-medium text-foreground">“{selectedRole.name}” can:</p>
          <ul className="flex flex-wrap gap-1.5">
            {selectedRole.permissions.map((key) => (
              <li key={key} className="rounded-lg bg-background px-2.5 py-1 text-[13px] text-foreground">
                {labels.get(key) ?? key}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/roles" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Manage roles →
        </Link>
        <Button className="h-10 rounded-xl px-5 font-semibold" disabled={pending || choice === null || choice === saved} onClick={save}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Save access
        </Button>
      </div>
    </div>
  )
}
