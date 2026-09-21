'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  ArrowRight,
  Truck,
  Trash2,
  Plus,
  Minus,
  Lock,
  Tag,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export interface CartItemType {
  id: string;
  name: string;
  category?: string;
  variant?: {
    size?: string;
    color?: string;
  };
  price: number;
  originalPrice?: number;
  quantity: number;
  image?: string;
}

export interface CartSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  items?: CartItemType[];
  onUpdateQuantity?: (id: string, delta: number) => void;
  onRemoveItem?: (id: string) => void;
  onApplyPromo?: (code: string) => void;
  onCheckout?: () => void;
  isPending?: boolean;
  freeShippingThreshold?: number;
  currencySymbol?: string;
}

const DEFAULT_SAMPLE_ITEMS: CartItemType[] = [
  {
    id: 'prod-1',
    name: 'AuraSonic Studio ANC',
    category: 'Audio',
    variant: { color: 'Phantom Black' },
    price: 149.00,
    originalPrice: 199.00,
    quantity: 1,
  },
  {
    id: 'prod-2',
    name: 'NeoTech Modular Parka',
    category: 'Fashion',
    variant: { size: 'Size M', color: 'Charcoal' },
    price: 189.00,
    originalPrice: 220.00,
    quantity: 1,
  },
];

export function CartSheet({
  open,
  onOpenChange,
  trigger,
  items: userItems,
  onUpdateQuantity,
  onRemoveItem,
  onApplyPromo,
  onCheckout,
  isPending = false,
  freeShippingThreshold = 500,
  currencySymbol = '$',
}: CartSheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [promoCode, setPromoCode] = React.useState('');
  const [appliedPromo, setAppliedPromo] = React.useState<string | null>(null);
  const [showPromoInput, setShowPromoInput] = React.useState(false);

  // Controlled vs Uncontrolled state
  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  // Items fallback for demonstration if user items array is not provided
  const [localItems, setLocalItems] = React.useState<CartItemType[]>(DEFAULT_SAMPLE_ITEMS);
  const items = userItems !== undefined ? userItems : localItems;

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = appliedPromo ? subtotal * 0.15 : 0; // 15% promo discount
  const shippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 15;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleUpdateQty = (id: string, delta: number) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(id, delta);
    } else {
      setLocalItems((prev) =>
        prev
          .map((item) => {
            if (item.id === id) {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          })
          .filter((item): item is CartItemType => item !== null)
      );
    }
  };

  const handleRemove = (id: string) => {
    if (onRemoveItem) {
      onRemoveItem(id);
    } else {
      setLocalItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleApplyPromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setAppliedPromo(promoCode.trim().toUpperCase());
    onApplyPromo?.(promoCode.trim());
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}

      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col justify-between p-0 gap-0 shadow-2xl border-l border-border">
        {/* Sheet Header */}
        <SheetHeader className="p-6 pb-4 border-b border-border/80 space-y-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <ShoppingCart className="size-4.5" />
              </div>
              <div>
                <SheetTitle className="font-sans text-lg font-bold text-foreground flex items-center gap-2">
                  Your Bag
                  <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5 rounded-full">
                    {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
                  </Badge>
                </SheetTitle>
              </div>
            </div>
          </div>
          <SheetDescription className="sr-only">
            Review and adjust items in your shopping bag before proceeding to checkout.
          </SheetDescription>

          {/* Free Shipping Progress Indicator */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Truck className="size-3.5 text-primary shrink-0" />
                {remainingForFreeShipping > 0 ? (
                  <>
                    Add <strong className="text-primary font-bold">{currencySymbol}{remainingForFreeShipping.toFixed(2)}</strong> more for FREE Shipping
                  </>
                ) : (
                  <span className="text-primary font-bold flex items-center gap-1">
                    <Sparkles className="size-3 text-accent" />
                    Unlocked FREE Express Delivery!
                  </span>
                )}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">{Math.round(shippingProgress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        </SheetHeader>

        {/* Sheet Body (Item List) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            /* Zero-Clutter Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="size-20 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center border border-border/60 shadow-2xs">
                <ShoppingCart className="size-9 stroke-[1.5]" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h3 className="font-bold text-base text-foreground">Your bag is empty</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Discover our curated collection of smart electronics and urban streetwear.
                </p>
              </div>
              <Button
                onClick={() => setOpen(false)}
                className="rounded-full px-6 text-xs font-semibold shadow-sm mt-2"
                asChild
              >
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            /* Item Rows */
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                <span>Selected Items</span>
                <span>Subtotal</span>
              </div>

              {items.map((item) => {
                const itemTotal = item.price * item.quantity;
                return (
                  <div
                    key={item.id}
                    className="group flex items-center gap-3.5 p-3.5 rounded-2xl border border-border/80 bg-card hover:border-border transition-all shadow-2xs"
                  >
                    {/* Item Thumbnail */}
                    <div className="size-16 rounded-xl bg-muted/70 shrink-0 flex items-center justify-center font-bold text-xs text-muted-foreground border border-border/40">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="size-full object-cover rounded-xl" />
                      ) : (
                        <span>{item.category?.slice(0, 4).toUpperCase() || 'ITEM'}</span>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-foreground truncate">{item.name}</h4>
                        <span className="font-mono text-xs font-bold text-foreground shrink-0">
                          {currencySymbol}{itemTotal.toFixed(2)}
                        </span>
                      </div>

                      {/* Variants */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.variant?.color && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal text-muted-foreground border-border/60">
                            {item.variant.color}
                          </Badge>
                        )}
                        {item.variant?.size && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal text-muted-foreground border-border/60">
                            {item.variant.size}
                          </Badge>
                        )}
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {currencySymbol}{item.price.toFixed(2)} ea
                        </span>
                      </div>

                      {/* Quantity Stepper & Remove Action */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="inline-flex items-center gap-1 bg-muted/60 rounded-lg p-0.5 border border-border/40">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateQty(item.id, -1)}
                            className="size-5 rounded-md text-muted-foreground hover:text-foreground"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="font-mono text-xs font-bold text-foreground px-2">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateQty(item.id, 1)}
                            className="size-5 rounded-md text-muted-foreground hover:text-foreground"
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(item.id)}
                          className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sheet Footer (Sticky Bottom Summary & CTA) */}
        {items.length > 0 && (
          <SheetFooter className="p-6 border-t border-border/80 bg-muted/20 flex-col gap-4">
            {/* Promo Code Collapsible */}
            <div className="w-full space-y-2">
              <button
                type="button"
                onClick={() => setShowPromoInput((v) => !v)}
                className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Tag className="size-3.5 text-primary" />
                  {appliedPromo ? `Promo applied: ${appliedPromo}` : 'Have a promo code?'}
                </span>
                {showPromoInput ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              </button>

              {showPromoInput && (
                <form onSubmit={handleApplyPromoSubmit} className="flex items-center gap-2 pt-1 animate-in fade-in-50">
                  <Input
                    placeholder="Enter code (e.g. AURA20)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="h-8 text-xs bg-background rounded-lg border-border"
                  />
                  <Button type="submit" size="sm" className="h-8 px-3 text-xs font-semibold shrink-0">
                    Apply
                  </Button>
                </form>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="w-full space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono text-foreground font-semibold">{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              {appliedPromo && (
                <div className="flex items-center justify-between text-primary font-medium">
                  <span>Promo Discount (15%)</span>
                  <span className="font-mono">-{currencySymbol}{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Express Shipping</span>
                <span>{shippingCost === 0 ? <strong className="text-primary">FREE</strong> : `${currencySymbol}${shippingCost.toFixed(2)}`}</span>
              </div>
              <Separator className="my-1.5" />
              <div className="flex items-center justify-between text-sm font-bold text-foreground">
                <span>Estimated Total</span>
                <span className="font-mono text-base text-primary">{currencySymbol}{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Primary Checkout CTA */}
            <Button
              onClick={() => {
                setOpen(false);
                onCheckout?.();
              }}
              disabled={isPending}
              className="w-full h-11 rounded-full font-bold text-xs gap-2 shadow-md hover:shadow-lg transition-all"
              asChild={!onCheckout}
            >
              {onCheckout ? (
                <>
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : 'Proceed to Checkout'}
                  <ArrowRight className="size-4" />
                </>
              ) : (
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="size-4" />
                </Link>
              )}
            </Button>

            {/* Security Micro-Text Badges */}
            <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <Lock className="size-3 text-primary shrink-0" />
                256-Bit Encrypted
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Check className="size-3 text-primary shrink-0" />
                30-Day Easy Returns
              </span>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
