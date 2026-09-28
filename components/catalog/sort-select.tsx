"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowUpDown } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
      <Select
        value={value}
        onValueChange={(nextValue) => {
          const option = options.find((item) => item.value === nextValue)
          if (option)
            startTransition(() => router.push(option.href, { scroll: false }))
        }}
      >
        <SelectTrigger
          aria-label="Sort products"
          aria-busy={isPending}
          className="h-10 rounded-full border-border bg-background pr-9 pl-9 text-[15px] font-medium hover:bg-muted data-[pending=true]:opacity-60"
          data-pending={isPending}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
        </SelectContent>
      </Select>
    </label>
  )
}
