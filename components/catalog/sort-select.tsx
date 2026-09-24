"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowUpDown } from "lucide-react"
import type { CatalogSort } from "@/lib/storefront-types"

interface SortSelectProps {
  value: CatalogSort
  /** Pre-built hrefs from the server, so this component never parses the URL. */
  options: Array<{ value: CatalogSort; label: string; href: string }>
}

export function SortSelect({ value, options }: SortSelectProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  return (
    <label className="relative inline-flex items-center gap-2 text-sm">
      <ArrowUpDown className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground" />
      <span className="sr-only">Sort products</span>
      <select
        value={value}
        onChange={(event) => {
          const option = options.find(
            (item) => item.value === event.target.value
          )
          if (option)
            startTransition(() => router.push(option.href, { scroll: false }))
        }}
        aria-busy={isPending}
        className="h-9 appearance-none rounded-full border border-border bg-background pr-8 pl-8 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 data-[pending=true]:opacity-60"
        data-pending={isPending}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-[10px] text-muted-foreground">
        ▼
      </span>
    </label>
  )
}
