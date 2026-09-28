"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart/cart-provider"
import { CartIcon } from "@/components/icons/cart-icon"

export function CartTrigger() {
  const { cart, setOpen } = useCart()
  const count = cart.totalItems

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setOpen(true)}
      className="group relative size-10 rounded-full transition-colors hover:bg-muted/80"
      aria-label={count > 0 ? `Open cart, ${count} ${count === 1 ? "item" : "items"}` : "Open cart"}
    >
      <CartIcon
        filled={count > 0}
        className="size-[22px] text-foreground transition-transform duration-200 ease-out group-hover:-translate-y-px group-active:scale-95"
      />
      {count > 0 && (
        <span
          // Re-keyed so the badge "pops" each time the count changes.
          key={count}
          className="absolute top-0.5 right-0 flex h-[18px] min-w-[18px] animate-in items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-none font-bold text-primary-foreground tabular-nums ring-2 ring-background duration-300 zoom-in-50"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Button>
  )
}
