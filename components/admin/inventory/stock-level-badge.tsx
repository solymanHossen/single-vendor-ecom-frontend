import { CircleAlert, CircleCheck, CircleX } from "lucide-react"
import type { StockLevel } from "@/lib/backend-inventory"
import { cn } from "@/lib/utils"

const META: Record<StockLevel, { label: string; icon: typeof CircleCheck; className: string }> = {
  out: { label: "Out of stock", icon: CircleX, className: "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300" },
  low: { label: "Low", icon: CircleAlert, className: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300" },
  ok: { label: "Healthy", icon: CircleCheck, className: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" },
}

/** Icon + label, never colour alone. */
export function StockLevelBadge({ level, className }: { level: StockLevel; className?: string }) {
  const meta = META[level]
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", meta.className, className)}>
      <meta.icon className="size-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  )
}
