"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ALL = "__all__"

/** A filter dropdown that writes ?<param>= and resets paging. */
export function UrlSelect({
  param,
  value,
  label,
  allLabel,
  options,
}: {
  param: string
  value: string | undefined
  label: string
  allLabel: string
  options: ReadonlyArray<{ value: string; label: string }>
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = React.useTransition()

  return (
    <Select
      value={value ?? ALL}
      onValueChange={(next) => {
        const params = new URLSearchParams(searchParams.toString())
        if (next === ALL) params.delete(param)
        else params.set(param, next)
        params.delete("page")
        const qs = params.toString()
        startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname))
      }}
    >
      <SelectTrigger aria-label={label} className="h-11 min-w-40 rounded-xl text-[15px]">
        {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
