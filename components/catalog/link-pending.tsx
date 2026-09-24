"use client"

import { useLinkStatus } from "next/link"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Place inside a <Link>: shows a spinner while that link's navigation is in
 * flight. Catalog pages have no loading.js (it would break real 404/redirect
 * status codes), so this is the instant "your click registered" feedback.
 */
export function LinkPending({
  children,
  className,
}: {
  /** Shown when idle (e.g. a product count); swapped for the spinner while pending. */
  children?: React.ReactNode
  className?: string
}) {
  const { pending } = useLinkStatus()
  return pending ? (
    <Loader2
      className={cn("size-4 animate-spin text-primary", className)}
      aria-label="Loading"
    />
  ) : (
    <>{children}</>
  )
}
