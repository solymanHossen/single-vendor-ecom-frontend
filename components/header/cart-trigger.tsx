"use client"

import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart/cart-provider"

export function CartTrigger() {
  const { cart, setOpen } = useCart()
  const count = cart.totalItems

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setOpen(true)}
      className="relative size-9 rounded-full transition-colors hover:bg-muted/80"
      aria-label={count > 0 ? `Open cart, ${count} ${count === 1 ? "item" : "items"}` : "Open cart"}
    >
      <ShoppingBag className="size-[18px] text-foreground" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background tabular-nums ring-2 ring-background">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Button>
  )
}
