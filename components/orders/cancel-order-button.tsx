"use client"

import * as React from "react"
import { Loader2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { cancelOrderAction } from "@/actions/order.actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export function CancelOrderButton({ orderId }: { orderId: number }) {
  const [open, setOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  const confirm = () =>
    startTransition(async () => {
      const result = await cancelOrderAction(orderId)
      if ("error" in result) {
        toast.error("Couldn't cancel the order", { description: result.error })
        return
      }
      setOpen(false)
      toast.success("Order cancelled", {
        description: `Order #${orderId} is cancelled. Nothing is due.`,
      })
    })

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="h-11 rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive">
          <XCircle className="size-4" />
          Cancel order
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel order #{orderId}?</AlertDialogTitle>
          <AlertDialogDescription className="text-[15px]">
            We&apos;ll stop preparing it straight away. You won&apos;t be charged, and any coupon you
            used becomes available again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl" disabled={pending}>
            Keep order
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="rounded-xl"
            disabled={pending}
            onClick={(event) => {
              event.preventDefault()
              confirm()
            }}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Cancel order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
