import { CircleAlert, CircleCheck, CircleX } from "lucide-react"
import { cn } from "@/lib/utils"

type Level = "in" | "low" | "out"

// Status colour is always paired with an icon and a label, never alone.
const LEVELS = {
  in: {
    label: "In stock",
    icon: CircleCheck,
    className:
      "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  low: {
    label: "Low stock",
    icon: CircleAlert,
    className:
      "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  },
  out: {
    label: "Out of stock",
    icon: CircleX,
    className: "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300",
  },
} as const

export function stockLevel(quantity: number, lowThreshold: number): Level {
  if (quantity <= 0) return "out"
  return quantity <= lowThreshold ? "low" : "in"
}

export function StockBadge({
  quantity,
  lowThreshold,
}: {
  quantity: number
  lowThreshold: number
}) {
  const level = LEVELS[stockLevel(quantity, lowThreshold)]
  const Icon = level.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-medium whitespace-nowrap",
        level.className
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {level.label}
    </span>
  )
}
