"use client"

import * as React from "react"
import { House, Loader2, Package, RotateCcw, Truck, XCircle, type LucideIcon } from "lucide-react"
import { toast } from "sonner"
import { updateOrderStatusAction } from "@/actions/order.actions"
import type { OrderStatus } from "@/lib/backend-commerce"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

const ACTIONS: Record<
  OrderStatus,
  {
    label: string
    done: string
    icon: LucideIcon
    confirm?: string
    destructive?: boolean
    secondary?: boolean
  }
> = {
  PENDING: { label: "Reopen", done: "Order reopened", icon: Package },
  PROCESSING: { label: "Start preparing", done: "Order is being prepared", icon: Package },
  SHIPPED: { label: "Mark as shipped", done: "Order marked as shipped", icon: Truck },
  DELIVERED: {
    label: "Mark as delivered",
    done: "Order delivered",
    icon: House,
    confirm: "Cash-on-delivery orders are marked as paid when delivered.",
  },
  CANCELLED: {
    label: "Cancel order",
    done: "Order cancelled",
    icon: XCircle,
    destructive: true,
    confirm:
      "Items go back into stock and the coupon is released. Paid orders are marked refunded. This can't be undone.",
  },
  RETURNED: {
    label: "Mark as returned",
    done: "Order marked as returned",
    icon: RotateCcw,
    secondary: true,
    confirm: "Use this once the parcel is back with you. This can't be undone.",
  },
}

export function OrderStatusActions({
  orderId,
  nextStatuses,
}: {
  orderId: number
  nextStatuses: OrderStatus[]
}) {
  const [confirming, setConfirming] = React.useState<OrderStatus | null>(null)
  const [pending, setPending] = React.useState<OrderStatus | null>(null)
  const [, startTransition] = React.useTransition()

  const run = (status: OrderStatus) => {
    setPending(status)
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, status)
      setPending(null)
      setConfirming(null)
      if ("error" in result) {
        toast.error("Couldn't update the order", { description: result.error })
        return
      }
      toast.success(ACTIONS[status].done, { description: `Order #${orderId}` })
    })
  }

  if (nextStatuses.length === 0) {
    return <p className="text-sm text-muted-foreground">This order is closed — no further steps.</p>
  }

  const confirmAction = confirming ? ACTIONS[confirming] : null

  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        {nextStatuses.map((status) => {
          const action = ACTIONS[status]
          const Icon = action.icon
          return (
            <Button
              key={status}
              variant={action.destructive || action.secondary ? "outline" : "default"}
              className={
                action.destructive
                  ? "h-11 rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  : action.secondary
                    ? "h-11 rounded-xl px-5"
                    : "h-11 rounded-xl px-5 font-semibold"
              }
              disabled={pending !== null}
              onClick={() => (action.confirm ? setConfirming(status) : run(status))}
            >
              {pending === status ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" />}
              {action.label}
            </Button>
          )
        })}
      </div>

      <AlertDialog
        open={confirming !== null}
        onOpenChange={(open) => !open && pending === null && setConfirming(null)}
      >
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.label} for #{orderId}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px]">{confirmAction?.confirm}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" disabled={pending !== null}>
              Back
            </AlertDialogCancel>
            <AlertDialogAction
              variant={confirmAction?.destructive ? "destructive" : "default"}
              className="rounded-xl"
              disabled={pending !== null}
              onClick={(event) => {
                event.preventDefault()
                if (confirming) run(confirming)
              }}
            >
              {pending !== null && <Loader2 className="size-4 animate-spin" />}
              {confirmAction?.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
