"use client"

import * as React from "react"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartSheet, type CartItemType } from "@/components/cart/CartSheet"

export interface CartTriggerProps {
  cartCount?: number
  onCartClick?: () => void
  items?: CartItemType[]
  onUpdateQuantity?: (id: string, delta: number) => void
  onRemoveItem?: (id: string) => void
  currencySymbol?: string
}

export function CartTrigger({
  cartCount = 0,
  onCartClick,
  items,
  onUpdateQuantity,
  onRemoveItem,
  currencySymbol = "৳",
}: CartTriggerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  const handleClick = () => {
    if (onCartClick) {
      onCartClick()
    } else {
      setIsOpen(true)
    }
  }

  const sampleSubtotal = cartCount > 0 ? cartCount * 149.0 : 0

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      aria-haspopup="dialog"
    >
      <CartSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        items={items}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
        currencySymbol={currencySymbol}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            className="relative size-9 rounded-full transition-colors hover:bg-muted/80"
            aria-label="Open Shopping Cart"
          >
            <ShoppingCart className="size-[18px] text-foreground" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 animate-in items-center justify-center rounded-full bg-primary font-mono text-[10px] font-bold text-primary-foreground shadow-xs zoom-in-50">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Button>
        }
      />

      {/* Subtotal Hover Preview Card (Desktop) */}
      {isHovered && cartCount > 0 && !isOpen && (
        <div className="pointer-events-none absolute top-full right-0 z-50 mt-2 hidden w-48 animate-in space-y-1 rounded-xl border border-border bg-popover p-3 text-xs text-popover-foreground shadow-md fade-in-50 slide-in-from-top-1 lg:block">
          <div className="flex items-center justify-between font-medium">
            <span>Cart Subtotal</span>
            <span className="font-mono font-bold text-primary">
              {currencySymbol}
              {sampleSubtotal.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Click to view bag & checkout
          </p>
        </div>
      )}
    </div>
  )
}
