"use client"

import * as React from "react"
import { toast, type ExternalToast } from "sonner"

type ActionState = { error?: string; success?: boolean } | undefined

/**
 * Surfaces a server action's `{ error }` result as a toast. `useActionState`
 * hands back a fresh object per submission, so a repeated error re-announces.
 */
export function useActionErrorToast(
  state: ActionState,
  title: string,
  options?: Omit<ExternalToast, "description" | "id">
) {
  const optionsRef = React.useRef(options)
  React.useEffect(() => {
    optionsRef.current = options
  })

  React.useEffect(() => {
    if (!state?.error) return
    toast.error(title, {
      ...optionsRef.current,
      id: `action-error-${title}`,
      description: state.error,
    })
  }, [state, title])
}
