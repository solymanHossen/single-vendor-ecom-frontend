"use client"

import * as React from "react"
import { Loader2, LockOpen, LogOut, Power, PowerOff, type LucideIcon } from "lucide-react"
import { toast } from "sonner"
import {
  revokeUserSessionsAction,
  setUserStatusAction,
  unlockUserAction,
} from "@/actions/access.actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type ActionKey = "deactivate" | "reactivate" | "unlock" | "signout"

interface ActionSpec {
  label: string
  icon: LucideIcon
  title: string
  description: string
  done: string
  destructive?: boolean
  run: (id: number) => ReturnType<typeof setUserStatusAction>
}

export function UserAccountActions({
  userId,
  email,
  isActive,
  isLocked,
  activeSessions,
}: {
  userId: number
  email: string
  isActive: boolean
  isLocked: boolean
  activeSessions: number
}) {
  const [confirming, setConfirming] = React.useState<ActionKey | null>(null)
  const [pending, startTransition] = React.useTransition()

  const specs: Record<ActionKey, ActionSpec> = {
    deactivate: {
      label: "Deactivate",
      icon: PowerOff,
      title: `Deactivate ${email}?`,
      description:
        "They're signed out everywhere right away and can't sign in again until you reactivate the account. Orders and history are kept.",
      done: "Account deactivated",
      destructive: true,
      run: (id) => setUserStatusAction(id, false),
    },
    reactivate: {
      label: "Reactivate",
      icon: Power,
      title: `Reactivate ${email}?`,
      description: "They'll be able to sign in again with their existing password or Google account.",
      done: "Account reactivated",
      run: (id) => setUserStatusAction(id, true),
    },
    unlock: {
      label: "Unlock sign-in",
      icon: LockOpen,
      title: `Unlock ${email}?`,
      description: "The account was locked after too many wrong passwords. Unlocking lets them try again now.",
      done: "Sign-in unlocked",
      run: (id) => unlockUserAction(id),
    },
    signout: {
      label: "Sign out everywhere",
      icon: LogOut,
      title: `Sign ${email} out of every device?`,
      description: `Ends all ${activeSessions} active ${activeSessions === 1 ? "session" : "sessions"}. They can sign straight back in — use this if a device was lost or shared.`,
      done: "Signed out everywhere",
      run: (id) => revokeUserSessionsAction(id),
    },
  }

  const available: ActionKey[] = [
    ...(isLocked && isActive ? (["unlock"] as const) : []),
    ...(isActive && activeSessions > 0 ? (["signout"] as const) : []),
    isActive ? "deactivate" : "reactivate",
  ]

  const confirm = () => {
    if (!confirming) return
    const spec = specs[confirming]
    startTransition(async () => {
      const result = await spec.run(userId)
      if ("error" in result) {
        toast.error(`Couldn't ${spec.label.toLowerCase()}`, { description: result.error })
        return
      }
      setConfirming(null)
      toast.success(spec.done, { description: email })
    })
  }

  const active = confirming ? specs[confirming] : null

  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        {available.map((key) => {
          const spec = specs[key]
          const Icon = spec.icon
          return (
            <Button
              key={key}
              variant="outline"
              className={
                spec.destructive
                  ? "h-10 rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  : "h-10 rounded-xl"
              }
              onClick={() => setConfirming(key)}
            >
              <Icon className="size-4" />
              {spec.label}
            </Button>
          )
        })}
      </div>

      <AlertDialog open={active !== null} onOpenChange={(open) => !open && !pending && setConfirming(null)}>
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{active?.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-[15px]">{active?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" disabled={pending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant={active?.destructive ? "destructive" : "default"}
              className="rounded-xl"
              disabled={pending}
              onClick={(event) => {
                event.preventDefault()
                confirm()
              }}
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              {active?.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
