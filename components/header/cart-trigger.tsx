'use client';

import * as React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartSheet, type CartItemType } from '@/components/cart/CartSheet';

export interface CartTriggerProps {
  cartCount?: number;
  onCartClick?: () => void;
  items?: CartItemType[];
  onUpdateQuantity?: (id: string, delta: number) => void;
  onRemoveItem?: (id: string) => void;
  currencySymbol?: string;
}

export function CartTrigger({
  cartCount = 2,
  onCartClick,
  items,
  onUpdateQuantity,
  onRemoveItem,
  currencySymbol = '$',
}: CartTriggerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      setIsOpen(true);
    }
  };

  const sampleSubtotal = cartCount > 0 ? cartCount * 149.00 : 0;

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
            className="relative size-11 rounded-full hover:bg-muted/80 transition-colors"
            aria-label="Open Shopping Cart"
          >
            <ShoppingCart className="size-5 text-foreground" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground font-mono text-[10px] font-bold size-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Button>
        }
      />

      {/* Subtotal Hover Preview Card (Desktop) */}
      {isHovered && cartCount > 0 && !isOpen && (
        <div className="hidden lg:block absolute right-0 top-full mt-2 w-48 p-3 rounded-xl bg-popover text-popover-foreground border border-border shadow-md text-xs space-y-1 z-50 pointer-events-none animate-in fade-in-50 slide-in-from-top-1">
          <div className="flex items-center justify-between font-medium">
            <span>Cart Subtotal</span>
            <span className="font-mono font-bold text-primary">
              {currencySymbol}{sampleSubtotal.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">Click to view bag & checkout</p>
        </div>
      )}
    </div>
  );
}
