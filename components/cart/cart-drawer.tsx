"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  ArrowRight,
  CircleAlert,
  ImageOff,
  Lock,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from "lucide-react"
import {
  FREE_SHIPPING_THRESHOLD,
  MAX_CART_LINE_QUANTITY,
  type CartLine,
} from "@/lib/backend-commerce"
import { formatPrice } from "@/lib/format"
import { isOptimizableImage } from "@/lib/images"
import { productHref } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCart } from "./cart-provider"

const ISSUE_TEXT: Record<NonNullable<CartLine["issue"]>, (line: CartLine) => string> = {
  UNAVAILABLE: () => "No longer available — remove it to check out.",
  OUT_OF_STOCK: () => "Sold out — remove it to check out.",
  INSUFFICIENT_STOCK: (line) => `Only ${line.availableStock} left — lower the quantity.`,
}

export function LineThumb({ url, size }: { url: string | null; size: number }) {
  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted"
      style={{ width: size, height: size }}
    >
      {url ? (
        <Image
          src={url}
          alt=""
          fill
          sizes={`${size}px`}
          unoptimized={!isOptimizableImage(url)}
          className="object-cover"
        />
      ) : (
        <ImageOff className="size-5 text-muted-foreground" aria-hidden="true" />
      )}
    </span>
  )
}

function FreeShippingMeter({ subtotal }: { subtotal: number }) {
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  return (
    <div className="space-y-2.5 rounded-2xl bg-muted/60 px-4 py-3.5">
      <p className="flex items-center gap-2 text-sm text-foreground">
        <Truck className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        {remaining > 0 ? (
          <span>
            Add <span className="font-semibold tabular-nums">{formatPrice(remaining)}</span> more
            for <span className="font-semibold">free delivery</span>
          </span>
        ) : (
          <span className="font-medium">You&apos;ve unlocked free delivery</span>
        )}
      </p>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-label="Progress to free delivery"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div
          className="h-full rounded-full bg-foreground transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function QuantityStepper({ line }: { line: CartLine }) {
  const { setQuantity } = useCart()
  const max = Math.max(1, Math.min(line.availableStock, MAX_CART_LINE_QUANTITY))
  return (
    <div className="inline-flex h-9 items-center rounded-full border border-border">
      <button
        type="button"
        onClick={() => setQuantity(line.key, line.quantity - 1)}
        disabled={line.quantity <= 1}
        aria-label={`Decrease quantity of ${line.name}`}
        className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-35"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {line.quantity}
      </span>
      <button
        type="button"
        onClick={() => setQuantity(line.key, line.quantity + 1)}
        disabled={line.quantity >= max}
        aria-label={`Increase quantity of ${line.name}`}
        className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-35"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}

function CartLineRow({ line, highlighted }: { line: CartLine; highlighted: boolean }) {
  const { remove, setOpen } = useCart()
  const href = productHref(line.productId) + (line.variantId ? `?variant=${line.variantId}` : "")
  return (
    <li
      className={cn(
        "flex gap-4 rounded-2xl p-3 transition-colors duration-700",
        highlighted ? "bg-muted" : "bg-transparent"
      )}
    >
      <Link href={href} onClick={() => setOpen(false)} className="shrink-0">
        <LineThumb url={line.imageUrl} size={84} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={href}
              onClick={() => setOpen(false)}
              className="line-clamp-2 text-[15px] leading-snug font-medium text-foreground hover:underline hover:underline-offset-4"
            >
              {line.name}
            </Link>
            {line.variantLabel && (
              <p className="mt-0.5 text-sm text-muted-foreground">{line.variantLabel}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => remove(line)}
            aria-label={`Remove ${line.name}`}
            className="-mt-1 -mr-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        {line.issue && (
          <p className="flex items-start gap-1.5 text-sm text-destructive">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {ISSUE_TEXT[line.issue](line)}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          {line.issue === "UNAVAILABLE" || line.issue === "OUT_OF_STOCK" ? (
            <span />
          ) : (
            <QuantityStepper line={line} />
          )}
          <div className="text-right">
            <p className="text-[15px] font-semibold text-foreground tabular-nums">
              {formatPrice(line.subtotal)}
            </p>
            {line.quantity > 1 ? (
              <p className="text-xs text-muted-foreground tabular-nums">
                {formatPrice(line.unitPrice)} each
              </p>
            ) : (
              line.compareAtPrice && (
                <p className="text-xs text-muted-foreground tabular-nums line-through">
                  {formatPrice(line.compareAtPrice)}
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

export function CartDrawer() {
  const { cart, open, setOpen, lastAddedKey } = useCart()
  const { status } = useSession()
  const subtotal = Number(cart.totalPrice)
  const savings = cart.items.reduce(
    (sum, line) =>
      sum +
      (line.compareAtPrice ? (Number(line.compareAtPrice) - Number(line.unitPrice)) * line.quantity : 0),
    0
  )
  const checkoutHref =
    status === "authenticated" ? "/checkout" : `/login?callbackUrl=${encodeURIComponent("/checkout")}`

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        showCloseButton={false}
        // Clicking a toast (e.g. "Undo") mustn't count as clicking away.
        onInteractOutside={(event) => {
          if ((event.target as Element | null)?.closest("[data-sonner-toaster]")) {
            event.preventDefault()
          }
        }}
        className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[460px]"
      >
        <SheetHeader className="flex-row items-center justify-between gap-3 border-b border-border/70 px-6 py-5">
          <div className="space-y-0.5">
            <SheetTitle className="flex items-center gap-2.5 text-xl font-semibold">
              Your cart
              {cart.totalItems > 0 && (
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium tabular-nums">
                  {cart.totalItems}
                </span>
              )}
            </SheetTitle>
            <SheetDescription className="sr-only">
              Review items, change quantities and continue to checkout.
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="size-10 rounded-full" aria-label="Close cart">
              <X className="size-5" />
            </Button>
          </SheetClose>
        </SheetHeader>

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="size-9 text-muted-foreground" />
            </span>
            <div className="space-y-1.5">
              <p className="text-lg font-semibold text-foreground">Your cart is empty</p>
              <p className="text-[15px] text-muted-foreground">
                Find something you love — it&apos;ll wait for you here.
              </p>
            </div>
            <Button asChild className="h-12 rounded-full px-7 text-[15px] font-semibold">
              <Link href="/products" onClick={() => setOpen(false)}>
                Start shopping
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
              <div className="px-3 pb-3">
                <FreeShippingMeter subtotal={subtotal} />
              </div>
              <ul className="space-y-1">
                {cart.items.map((line) => (
                  <CartLineRow key={line.key} line={line} highlighted={line.key === lastAddedKey} />
                ))}
              </ul>
            </div>

            <div className="space-y-4 border-t border-border/70 bg-background px-6 pt-5 pb-6">
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[15px] text-muted-foreground">Subtotal</span>
                  <span className="text-xl font-semibold text-foreground tabular-nums">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                {savings > 0 && (
                  <p className="flex justify-between text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    <span>You save</span>
                    <span className="tabular-nums">{formatPrice(savings)}</span>
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Delivery and coupons are applied at checkout.
                </p>
              </div>

              {cart.hasIssues ? (
                <p className="flex items-start gap-2 rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive">
                  <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  Fix the highlighted items to continue to checkout.
                </p>
              ) : (
                <Button asChild className="h-13 w-full rounded-full text-base font-semibold">
                  <Link href={checkoutHref} onClick={() => setOpen(false)}>
                    <Lock className="size-4" />
                    {status === "authenticated" ? "Checkout" : "Sign in to checkout"}
                  </Link>
                </Button>
              )}
              <SheetClose asChild>
                <button
                  type="button"
                  className="w-full text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Continue shopping
                </button>
              </SheetClose>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
