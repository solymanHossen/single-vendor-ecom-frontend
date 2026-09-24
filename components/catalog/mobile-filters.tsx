"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface MobileFiltersProps {
  activeCount: number
  /** The server-rendered filter panel, passed through as children. */
  children: React.ReactNode
}

export function MobileFilters({ activeCount, children }: MobileFiltersProps) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const location = `${pathname}?${searchParams.toString()}`
  const [openedAt, setOpenedAt] = React.useState(location)

  // Close the drawer once a filter link has navigated to a new URL
  // (adjusting state during render instead of in an effect).
  if (open && location !== openedAt) {
    setOpen(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setOpenedAt(location)
      }}
    >
      <SheetTrigger asChild>
        <Button variant="outline" className="h-9 rounded-full px-3.5 lg:hidden">
          <SlidersHorizontal className="size-3.5" />
          Filters
          {activeCount > 0 && (
            <span className="ml-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] overflow-y-auto p-5">
        <SheetHeader className="mb-4 p-0">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  )
}
