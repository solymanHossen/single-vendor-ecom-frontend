import { Check, CircleX, Package, RotateCcw, Truck, House, type LucideIcon } from "lucide-react"
import type { OrderStatus } from "@/lib/backend-commerce"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

interface Stage {
  status: OrderStatus
  label: string
  icon: LucideIcon
}

const FULFILMENT: readonly Stage[] = [
  { status: "PENDING", label: "Order placed", icon: Check },
  { status: "PROCESSING", label: "Preparing", icon: Package },
  { status: "SHIPPED", label: "On the way", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: House },
]

function stagesFor(status: OrderStatus): readonly Stage[] {
  if (status === "CANCELLED")
    return [FULFILMENT[0]!, { status: "CANCELLED", label: "Cancelled", icon: CircleX }]
  if (status === "RETURNED")
    return [...FULFILMENT, { status: "RETURNED", label: "Returned", icon: RotateCcw }]
  return FULFILMENT
}

/** Horizontal progress of an order through fulfilment. */
export function OrderTimeline({
  status,
  placedAt,
  updatedAt,
}: {
  status: OrderStatus
  placedAt: string
  updatedAt: string
}) {
  const stages = stagesFor(status)
  const current = stages.findIndex((stage) => stage.status === status)
  const stopped = status === "CANCELLED"

  return (
    <ol className="grid gap-y-6" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>
      {stages.map((stage, index) => {
        const done = index <= current
        const isCurrent = index === current
        const Icon = stage.icon
        return (
          <li key={stage.status} className="relative flex flex-col items-center text-center">
            {index > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-5 right-1/2 h-0.5 w-full -translate-y-1/2",
                  done ? (stopped ? "bg-destructive/60" : "bg-foreground") : "bg-border"
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-10 items-center justify-center rounded-full border-2 bg-card",
                done
                  ? stopped && isCurrent
                    ? "border-destructive bg-destructive text-white"
                    : "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground",
                isCurrent && !stopped && "ring-4 ring-foreground/10"
              )}
            >
              <Icon className="size-[18px]" aria-hidden="true" />
            </span>
            <span
              className={cn(
                "mt-3 text-sm font-medium",
                done ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {stage.label}
            </span>
            <span className="mt-0.5 text-xs text-muted-foreground">
              {index === 0 ? formatDate(placedAt) : isCurrent ? formatDate(updatedAt) : " "}
            </span>
            <span className="sr-only">{done ? (isCurrent ? "current step" : "completed") : "upcoming"}</span>
          </li>
        )
      })}
    </ol>
  )
}
