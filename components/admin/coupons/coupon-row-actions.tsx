"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CopyPlus, Loader2, MoreHorizontal, Pencil, Power, PowerOff, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteCouponAction, setCouponActiveAction } from "@/actions/coupon.actions"
import type { Coupon } from "@/lib/backend-coupons"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function CouponRowActions({ coupon }: { coupon: Pick<Coupon, "id" | "code" | "isActive" | "orderCount"> }) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const used = coupon.orderCount > 0

  const toggle = () =>
    startTransition(async () => {
      const next = !coupon.isActive
      const result = await setCouponActiveAction(coupon.id, next)
      if ("error" in result) {
        toast.error(next ? "Couldn't switch on" : "Couldn't switch off", { description: result.error })
        return
      }
      toast.success(next ? "Coupon switched on" : "Coupon switched off", {
        description: next
          ? `${coupon.code} works at checkout again.`
          : `${coupon.code} no longer works at checkout.`,
      })
      router.refresh()
    })

  const remove = () =>
    startTransition(async () => {
      const result = await deleteCouponAction(coupon.id)
      setConfirmDelete(false)
      if ("error" in result) {
        toast.error("Couldn't delete coupon", { description: result.error })
        return
      }
      toast.success("Coupon deleted", { description: `${coupon.code} was removed.` })
      router.refresh()
    })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative z-10 size-9 rounded-lg"
            aria-label={`Actions for ${coupon.code}`}
            disabled={pending}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5">
          <DropdownMenuItem asChild className="h-9 rounded-lg">
            <Link href={`/admin/coupons/${coupon.id}`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="h-9 rounded-lg">
            <Link href={`/admin/coupons/new?from=${coupon.id}`}>
              <CopyPlus className="size-4" />
              Duplicate
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="h-9 rounded-lg" onSelect={toggle}>
            {coupon.isActive ? <PowerOff className="size-4" /> : <Power className="size-4" />}
            {coupon.isActive ? "Switch off" : "Switch on"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="h-auto rounded-lg py-2"
            disabled={used}
            onSelect={() => setConfirmDelete(true)}
          >
            <Trash2 className="size-4" />
            <span className="flex flex-col">
              Delete
              {used && <span className="text-xs font-normal text-muted-foreground">Used on orders — switch off instead</span>}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {coupon.code}?</AlertDialogTitle>
            <AlertDialogDescription className="text-[15px]">
              The code stops working straight away and can&apos;t be brought back. It hasn&apos;t been used on any
              order, so no history is lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10 rounded-xl">Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="h-10 rounded-xl bg-destructive text-white hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault()
                remove()
              }}
              disabled={pending}
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Delete coupon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
