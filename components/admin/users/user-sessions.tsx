"use client"

import * as React from "react"
import { Loader2, Monitor, Smartphone, X } from "lucide-react"
import { toast } from "sonner"
import { revokeUserSessionAction } from "@/actions/access.actions"
import type { AdminUserSession } from "@/lib/backend-access"
import { describeDevice } from "@/lib/user-agent"
import { Button } from "@/components/ui/button"

/** Most recent first; the rest are one click away. */
const COLLAPSED = 5

export function UserSessions({
  userId,
  sessions,
  canManage,
  formatted,
}: {
  userId: number
  sessions: AdminUserSession[]
  canManage: boolean
  /** Server-formatted times, keyed by session id (avoids clock mismatches). */
  formatted: Record<number, { signedIn: string; expires: string }>
}) {
  const [endingId, setEndingId] = React.useState<number | null>(null)
  const [expanded, setExpanded] = React.useState(false)
  const [, startTransition] = React.useTransition()

  if (sessions.length === 0) {
    return (
      <p className="text-[15px] text-muted-foreground">
        Not signed in anywhere right now.
      </p>
    )
  }

  const end = (sessionId: number) => {
    setEndingId(sessionId)
    startTransition(async () => {
      const result = await revokeUserSessionAction(userId, sessionId)
      setEndingId(null)
      if ("error" in result) {
        toast.error("Couldn't end the session", { description: result.error })
        return
      }
      toast.success("Session ended", {
        description: "That device is signed out.",
      })
    })
  }

  const visible = expanded ? sessions : sessions.slice(0, COLLAPSED)

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-border/70">
        {visible.map((session) => {
          const device = describeDevice(session.deviceInfo)
          const Icon = device.mobile ? Smartphone : Monitor
          return (
            <li
              key={session.id}
              className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Icon className="size-5 text-foreground" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate font-medium text-foreground"
                  title={session.deviceInfo ?? undefined}
                >
                  {device.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  Signed in {formatted[session.id]?.signedIn} · expires{" "}
                  {formatted[session.id]?.expires}
                </p>
              </div>
              {canManage && (
                <Button
                  variant="ghost"
                  className="h-9 rounded-lg text-muted-foreground hover:text-destructive"
                  disabled={endingId !== null}
                  onClick={() => end(session.id)}
                  aria-label={`End session on ${device.label}`}
                >
                  {endingId === session.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <X className="size-4" />
                  )}
                  End
                </Button>
              )}
            </li>
          )
        })}
      </ul>
      {sessions.length > COLLAPSED && (
        <Button
          variant="ghost"
          className="h-9 w-full rounded-lg text-muted-foreground"
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? "Show fewer" : `Show all ${sessions.length}`}
        </Button>
      )}
    </div>
  )
}
