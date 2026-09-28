import * as React from "react"
import { cn } from "@/lib/utils"

interface CartIconProps extends React.SVGProps<SVGSVGElement> {
  /** Softly fills the basket — used when the cart has items. */
  filled?: boolean
}

/**
 * The store's cart mark: a shopping trolley drawn on the same 24px grid,
 * 1.75 stroke and round joins as the Lucide icons beside it, so it sits
 * naturally in the header next to search and wishlist.
 */
export function CartIcon({ filled = false, className, ...props }: CartIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("size-6 shrink-0", className)}
      {...props}
    >
      {/* Basket fill (items inside) */}
      <path
        d="M6.35 7.5h13.1a.9.9 0 0 1 .87 1.1l-1.35 5.9a1.9 1.9 0 0 1-1.85 1.5H9.4"
        fill="currentColor"
        fillOpacity={filled ? 0.16 : 0}
        stroke="none"
        className="transition-[fill-opacity] duration-300"
      />
      {/* Handle and basket */}
      <path d="M2.75 3.75h1.9c.47 0 .88.33.98.79l2.06 9.85a1.9 1.9 0 0 0 1.86 1.51h7.57a1.9 1.9 0 0 0 1.85-1.47l1.35-5.9a.9.9 0 0 0-.87-1.1H6.35" />
      {/* Basket ribs */}
      <path d="M10.5 10.75h6.5" opacity={0.55} />
      {/* Wheels */}
      <circle cx="9.75" cy="20" r="1.35" />
      <circle cx="17" cy="20" r="1.35" />
    </svg>
  )
}
