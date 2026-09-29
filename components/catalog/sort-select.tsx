"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowUpDown, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SortSelectProps<T extends string> {
  value: T
  /** Pre-built hrefs from the server, so this component never parses the URL. */
  options: Array<{ value: T; label: string; href: string }>
  /** Accessible name, e.g. "Sort products". */
  label?: string
}

export function SortSelect<T extends string>({ value, options, label = "Sort products" }: SortSelectProps<T>) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        const option = options.find((item) => item.value === nextValue)
        if (option) startTransition(() => router.push(option.href, { scroll: false }))
      }}
    >
      <SelectTrigger
        aria-label={label}
        aria-busy={isPending}
        className="h-10 gap-2 rounded-full border-border bg-background pr-3 pl-3.5 text-[15px] font-medium shadow-xs transition-colors hover:bg-muted data-[state=open]:border-foreground/30 data-[state=open]:bg-muted"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
        ) : (
          <ArrowUpDown className="size-4 text-muted-foreground" aria-hidden="true" />
        )}
        <span className="text-muted-foreground">Sort:</span>
        <SelectValue />
      </SelectTrigger>
      {/* A real dropdown under the button, not a list laid over it. */}
      <SelectContent
        position="popper"
        align="end"
        sideOffset={8}
        className="min-w-56 rounded-2xl p-1.5 shadow-lg ring-foreground/8"
      >
        <SelectGroup>
          <SelectLabel className="px-3 pt-1.5 pb-1 text-xs font-medium">Sort by</SelectLabel>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="h-10 rounded-xl pr-9 pl-3 text-[15px] focus:bg-muted focus:text-foreground not-data-[variant=destructive]:focus:**:text-foreground data-[state=checked]:font-semibold"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
