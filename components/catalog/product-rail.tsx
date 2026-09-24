"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductRailProps {
  title: string
  description?: string
  action?: React.ReactNode
  /** Server-rendered cards, one per child element. */
  children: React.ReactNode
}

/**
 * Horizontal, scroll-snapping product row. Native scrolling means touch,
 * trackpad and keyboard all work with momentum; the arrow buttons page by
 * the visible width and hide at either end.
 */
export function ProductRail({
  title,
  description,
  action,
  children,
}: ProductRailProps) {
  const scroller = React.useRef<HTMLUListElement>(null)
  const [edges, setEdges] = React.useState({ start: true, end: false })

  const measure = React.useCallback(() => {
    const el = scroller.current
    if (!el) return
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    })
  }, [])

  React.useEffect(() => {
    const el = scroller.current
    if (!el) return
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [measure])

  const page = (direction: 1 | -1) => {
    const el = scroller.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h2>
          {description && (
            <p className="text-base text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {action}
          <div className="hidden gap-2 sm:flex">
            {(
              [
                [-1, "Scroll left", ChevronLeft, edges.start],
                [1, "Scroll right", ChevronRight, edges.end],
              ] as const
            ).map(([direction, label, Icon, disabled]) => (
              <button
                key={label}
                type="button"
                onClick={() => page(direction)}
                disabled={disabled}
                aria-label={label}
                className="flex size-11 items-center justify-center rounded-full border border-border text-foreground transition-all duration-200 hover:border-foreground/40 hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
              >
                <Icon className="size-5" />
              </button>
            ))}
          </div>
        </div>
      </div>
      <ul
        ref={scroller}
        onScroll={measure}
        className={cn(
          "-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-2",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {React.Children.map(children, (child) => (
          <li className="w-[70%] shrink-0 snap-start sm:w-[42%] md:w-[30%] lg:w-[23%] 2xl:w-[18.5%]">
            {child}
          </li>
        ))}
      </ul>
    </div>
  )
}
