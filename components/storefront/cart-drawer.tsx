import type * as React from 'react';
import Image from 'next/image';
import { ArrowRight, Check, ChevronLeft, ShoppingBag, X } from 'lucide-react';
import { QuantityStepper } from './shared';
import type { CartItem, CheckoutStep, ShippingDetails } from './data';

export function CartDrawer({
  cart,
  checkoutStep,
  shippingDetails,
  orderReference,
  subtotal,
  shippingProgress,
  remainingForFreeShipping,
  onClose,
  onUpdateQuantity,
  onRemove,
  onStartCheckout,
  onBackToCart,
  onShippingDetailsChange,
  onShippingSubmit,
  onFinishCheckout,
}: {
  cart: CartItem[];
  checkoutStep: CheckoutStep;
  shippingDetails: ShippingDetails;
  orderReference: string;
  subtotal: number;
  shippingProgress: number;
  remainingForFreeShipping: number;
  onClose: () => void;
  onUpdateQuantity: (id: string, colorName: string, delta: number) => void;
  onRemove: (id: string, colorName: string) => void;
  onStartCheckout: () => void;
  onBackToCart: () => void;
  onShippingDetailsChange: (details: ShippingDetails) => void;
  onShippingSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onFinishCheckout: () => void;
}) {
  const field = (key: keyof ShippingDetails, label: string, type = 'text') => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground">{label}</label>
      <input
        required
        type={type}
        value={shippingDetails[key]}
        onChange={(e) => onShippingDetailsChange({ ...shippingDetails, [key]: e.target.value })}
        className="w-full bg-background text-sm text-foreground px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-background shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-medium text-foreground">
            {checkoutStep === 'shipping' && 'Shipping details'}
            {checkoutStep === 'success' && 'Order confirmed'}
            {checkoutStep === null && `Your Cart (${cart.reduce((n, i) => n + i.quantity, 0)})`}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {checkoutStep === null && (
          <>
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Your cart is empty.</p>
                <button
                  onClick={onClose}
                  className="mt-2 inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="p-5 border-b border-border">
                  {remainingForFreeShipping > 0 ? (
                    <p className="text-xs text-muted-foreground mb-2">
                      Add <span className="font-semibold text-foreground">${remainingForFreeShipping.toFixed(2)}</span>{' '}
                      more for free shipping
                    </p>
                  ) : (
                    <p className="text-xs font-medium text-secondary mb-2">
                      🎉 You&apos;ve unlocked free shipping!
                    </p>
                  )}
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${shippingProgress}%` }}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.selectedColor.name}`} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                        <Image
                          src={item.selectedColor.img || item.mainImage}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-contain mix-blend-multiply p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                          <button
                            onClick={() => onRemove(item.id, item.selectedColor.name)}
                            className="text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.selectedColor.name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <QuantityStepper
                            quantity={item.quantity}
                            onDecrease={() => onUpdateQuantity(item.id, item.selectedColor.name, -1)}
                            onIncrease={() => onUpdateQuantity(item.id, item.selectedColor.name, 1)}
                          />
                          <span className="text-sm font-semibold text-foreground">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-5 border-t border-border space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={onStartCheckout}
                    className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3 rounded-full text-sm font-semibold tracking-wide transition-all active:scale-95 shadow-sm"
                  >
                    Checkout
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {checkoutStep === 'shipping' && (
          <form onSubmit={onShippingSubmit} className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex-1 p-5 space-y-4">
              <button
                type="button"
                onClick={onBackToCart}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back to cart
              </button>

              {field('fullName', 'Full name')}
              {field('email', 'Email', 'email')}
              {field('address', 'Address')}
              <div className="grid grid-cols-2 gap-3">
                {field('city', 'City')}
                {field('postalCode', 'Postal code')}
              </div>
              {field('country', 'Country')}
            </div>

            <div className="p-5 border-t border-border space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3 rounded-full text-sm font-semibold tracking-wide transition-all active:scale-95 shadow-sm"
              >
                Place Order
              </button>
            </div>
          </form>
        )}

        {checkoutStep === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary/15 flex items-center justify-center">
              <Check className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-medium text-foreground">Thank you!</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your order <span className="font-semibold text-foreground">#{orderReference}</span> has been placed for{' '}
              <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>. A confirmation email is on
              its way.
            </p>
            <button
              onClick={onFinishCheckout}
              className="mt-2 inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
