'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Truck, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';

export interface CartTriggerProps {
  cartCount?: number;
  onCartClick?: () => void;
}

export function CartTrigger({ cartCount = 0, onCartClick }: CartTriggerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClick = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      setIsOpen(true);
    }
  };

  const freeShippingThreshold = 100;
  const dummySubtotal = cartCount > 0 ? cartCount * 43.85 : 0;
  const shippingProgress = Math.min(100, (dummySubtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - dummySubtotal);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          className="relative size-10 rounded-full hover:bg-muted/70 transition-colors"
          aria-label="Open Shopping Cart"
        >
          <ShoppingBag className="size-5 text-foreground" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground font-mono text-[10px] font-bold size-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col justify-between p-6">
        <SheetHeader className="space-y-2 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-serif text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="size-5 text-primary" />
              Shopping Bag
            </SheetTitle>
            <Badge variant="secondary" className="font-mono text-xs">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </Badge>
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Review your eco-friendly items before checkout.
          </SheetDescription>

          {/* Free Shipping Progress */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
              <span className="flex items-center gap-1">
                <Truck className="size-3.5 text-primary" />
                {remainingForFreeShipping > 0
                  ? `Add $${remainingForFreeShipping.toFixed(2)} for FREE shipping`
                  : '🎉 You earned FREE shipping!'}
              </span>
              <span className="font-mono">{Math.round(shippingProgress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        </SheetHeader>

        {/* Cart Drawer Items Area */}
        <div className="flex-1 overflow-y-auto py-6 flex flex-col justify-center">
          {cartCount === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="size-16 rounded-full bg-muted/60 text-muted-foreground mx-auto flex items-center justify-center">
                <ShoppingBag className="size-8" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Your bag is empty</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  Explore our sustainable collection of cookware, drinkware, and appliances.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="mt-2 rounded-full text-xs"
                asChild
              >
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Cart Items Preview
              </p>
              {/* Dummy Item preview */}
              <div className="flex gap-3 p-3 rounded-xl border border-border/60 bg-card">
                <div className="size-16 rounded-lg bg-muted shrink-0 flex items-center justify-center font-serif text-lg font-bold text-muted-foreground">
                  ECO
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-foreground">Eco-Loop Thermal Flask</p>
                      <p className="text-[10px] text-muted-foreground">Forest Moss • 750ml</p>
                    </div>
                    <span className="text-xs font-bold text-primary">$43.85</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-muted-foreground">Qty: {cartCount}</span>
                    <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer & Checkout Action */}
        <SheetFooter className="border-t border-border pt-4 flex-col gap-3">
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-mono text-foreground">${dummySubtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Shipping</span>
              <span>{dummySubtotal >= freeShippingThreshold ? 'FREE' : 'Calculated at checkout'}</span>
            </div>
            <Separator className="my-1" />
            <div className="flex items-center justify-between text-sm font-bold text-foreground">
              <span>Total</span>
              <span className="font-mono text-primary text-base">${dummySubtotal.toFixed(2)}</span>
            </div>
          </div>

          <Button
            className="w-full rounded-full gap-2 font-semibold text-xs shadow-md"
            disabled={cartCount === 0}
            onClick={() => setIsOpen(false)}
            asChild
          >
            <Link href="/checkout">
              Proceed to Checkout
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
