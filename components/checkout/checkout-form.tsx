"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Banknote,
  Check,
  CircleAlert,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Tag,
  Truck,
  X,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import { placeOrderAction, quoteAction } from "@/actions/order.actions"
import type { Address, OrderQuote } from "@/lib/backend-commerce"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart/cart-provider"
import { LineThumb } from "@/components/cart/cart-drawer"
import { AddressForm } from "./address-form"

// ── Pieces ──────────────────────────────────────────────────────────────────

function Step({
  number,
  title,
  description,
  action,
  children,
}: {
  number: number
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="flex items-start gap-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
            {number}
          </span>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {description && <p className="text-[15px] text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function AddressCard({
  address,
  selected,
  onSelect,
}: {
  address: Address
  selected: boolean
  onSelect: () => void
}) {
  return (
    <label
      className={cn(
        "relative flex cursor-pointer gap-3.5 rounded-2xl border p-4 transition-[border-color,box-shadow] duration-150",
        selected
          ? "border-foreground shadow-[0_0_0_1px_var(--foreground)]"
          : "border-border hover:border-foreground/40"
      )}
    >
      <input
        type="radio"
        name="address"
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-foreground bg-foreground" : "border-border"
        )}
        aria-hidden="true"
      >
        {selected && <Check className="size-3 text-background" strokeWidth={3} />}
      </span>
      <span className="min-w-0 space-y-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-foreground">{address.recipientName ?? "Recipient"}</span>
          {address.isDefault && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              Default
            </span>
          )}
        </span>
        <span className="block text-sm text-muted-foreground">
          {[address.addressLine1, address.addressLine2].filter(Boolean).join(", ")}
        </span>
        <span className="block text-sm text-muted-foreground">
          {address.city} {address.postalCode} · {address.phone ?? "No phone"}
        </span>
      </span>
    </label>
  )
}

function PaymentOption({
  icon: Icon,
  title,
  description,
  selected,
  disabled,
}: {
  icon: LucideIcon
  title: string
  description: string
  selected?: boolean
  disabled?: boolean
}) {
  return (
    <div
      aria-disabled={disabled}
      className={cn(
        "flex items-center gap-4 rounded-2xl border p-4",
        selected ? "border-foreground shadow-[0_0_0_1px_var(--foreground)]" : "border-border",
        disabled && "opacity-55"
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
        <Icon className="size-5 text-foreground" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-foreground">{title}</span>
        <span className="block text-sm text-muted-foreground">{description}</span>
      </span>
      {selected ? (
        <span className="flex size-5 items-center justify-center rounded-full bg-foreground">
          <Check className="size-3 text-background" strokeWidth={3} />
        </span>
      ) : (
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          Coming soon
        </span>
      )}
    </div>
  )
}

function SummaryRow({
  label,
  value,
  muted,
  accent,
}: {
  label: React.ReactNode
  value: React.ReactNode
  muted?: boolean
  accent?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[15px]">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "tabular-nums",
          muted ? "text-muted-foreground" : "font-medium text-foreground",
          accent && "text-emerald-700 dark:text-emerald-400"
        )}
      >
        {value}
      </span>
    </div>
  )
}

// ── Checkout ────────────────────────────────────────────────────────────────

export function CheckoutForm({
  addresses: initialAddresses,
  initialQuote,
  contact,
}: {
  addresses: Address[]
  initialQuote: OrderQuote
  contact: { name: string | null; phone: string | null }
}) {
  const router = useRouter()
  const { cart, ready, setOpen, refresh } = useCart()

  const [addresses, setAddresses] = React.useState(initialAddresses)
  const [addressId, setAddressId] = React.useState<number | null>(initialAddresses[0]?.id ?? null)
  const [addingAddress, setAddingAddress] = React.useState(initialAddresses.length === 0)
  const [quote, setQuote] = React.useState(initialQuote)
  const [couponInput, setCouponInput] = React.useState("")
  const [couponCode, setCouponCode] = React.useState<string | null>(null)
  const [couponError, setCouponError] = React.useState<string | null>(null)
  const [note, setNote] = React.useState("")
  const [quoting, startQuote] = React.useTransition()
  const [placing, startPlacing] = React.useTransition()
  const [placed, setPlaced] = React.useState(false)

  const requote = React.useCallback(
    (next: { addressId: number | null; couponCode: string | null }) =>
      new Promise<OrderQuote | null>((resolve) => {
        startQuote(async () => {
          const result = await quoteAction({
            addressId: next.addressId ?? undefined,
            couponCode: next.couponCode ?? undefined,
          })
          if ("error" in result) {
            toast.error("Couldn't update the totals", { description: result.error })
            resolve(null)
            return
          }
          setQuote(result.quote)
          resolve(result.quote)
        })
      }),
    []
  )

  // Editing the cart in the drawer changes the totals — keep them in step.
  const cartSignature = cart.items.map((line) => `${line.key}x${line.quantity}`).join(",")
  const lastSignature = React.useRef(cartSignature)
  React.useEffect(() => {
    if (!ready || placed || cartSignature === lastSignature.current) return
    lastSignature.current = cartSignature
    void quoteAction({
      addressId: addressId ?? undefined,
      couponCode: couponCode ?? undefined,
    }).then((result) => {
      if (!("error" in result)) setQuote(result.quote)
    })
  }, [cartSignature, ready, placed, addressId, couponCode])

  const chooseAddress = (id: number) => {
    setAddressId(id)
    void requote({ addressId: id, couponCode })
  }

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    const next = await requote({ addressId, couponCode: code })
    if (!next) return
    if (next.coupon) {
      setCouponCode(next.coupon.code)
      setCouponError(null)
      setCouponInput("")
      toast.success("Coupon applied", {
        description: `${next.coupon.code} saves you ${formatPrice(next.discountAmount)}.`,
      })
    } else {
      setCouponError(next.couponError ?? "This coupon can't be used.")
    }
  }

  const removeCoupon = () => {
    setCouponCode(null)
    setCouponError(null)
    void requote({ addressId, couponCode: null })
  }

  const placeOrder = () => {
    if (!addressId) {
      toast.warning("Add a delivery address", {
        description: "Tell us where to deliver before placing the order.",
      })
      return
    }
    startPlacing(async () => {
      const result = await placeOrderAction({
        addressId,
        couponCode: couponCode ?? undefined,
        note: note.trim() || undefined,
      })
      if ("error" in result) {
        toast.error("Couldn't place your order", { description: result.error })
        // Stock or coupon may have changed underneath us — show the truth.
        await refresh()
        void requote({ addressId, couponCode })
        return
      }
      setPlaced(true)
      // The API already emptied the cart; sync the badge before leaving.
      await refresh()
      router.replace(`/orders/${result.order.id}?placed=1`)
    })
  }

  const blocked = quote.problems.length > 0 || cart.hasIssues
  const shippingLabel =
    quote.shippingFee === null
      ? "Add address"
      : Number(quote.shippingFee) === 0
        ? "Free"
        : formatPrice(quote.shippingFee)

  if (ready && cart.items.length === 0 && !placed && !placing) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 py-24 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="size-9 text-muted-foreground" />
        </span>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold text-foreground">Your cart is empty</h1>
          <p className="text-[15px] text-muted-foreground">Add something to your cart to check out.</p>
        </div>
        <Button asChild className="h-12 rounded-full px-7 font-semibold">
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-8 pb-28 lg:grid-cols-[minmax(0,1fr)_420px] lg:pb-0 xl:grid-cols-[minmax(0,1fr)_460px] xl:gap-10">
      <div className="min-w-0 space-y-6">
        <Step
          number={1}
          title="Delivery address"
          description="Where should we bring your order?"
          action={
            !addingAddress && addresses.length > 0 ? (
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl"
                onClick={() => setAddingAddress(true)}
              >
                <Plus className="size-4" />
                New address
              </Button>
            ) : undefined
          }
        >
          {addingAddress ? (
            <AddressForm
              defaults={contact}
              isFirst={addresses.length === 0}
              onCancel={addresses.length > 0 ? () => setAddingAddress(false) : undefined}
              onSaved={(address) => {
                setAddresses((prev) => [
                  address,
                  ...prev.map((a) => (address.isDefault ? { ...a, isDefault: false } : a)),
                ])
                setAddingAddress(false)
                chooseAddress(address.id)
              }}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  selected={address.id === addressId}
                  onSelect={() => chooseAddress(address.id)}
                />
              ))}
            </div>
          )}
          {quote.insideDhaka !== null && !addingAddress && (
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="size-4 shrink-0" aria-hidden="true" />
              {quote.insideDhaka
                ? "Inside Dhaka · usually delivered in 1–2 days"
                : "Outside Dhaka · usually delivered in 3–5 days"}
            </p>
          )}
        </Step>

        <Step number={2} title="Payment" description="Pay when your order arrives.">
          <div className="space-y-3">
            <PaymentOption
              icon={Banknote}
              title="Cash on delivery"
              description="Pay the courier in cash or by mobile banking at your door."
              selected
            />
            <PaymentOption
              icon={Smartphone}
              title="bKash"
              description="Instant payment from your bKash account."
              disabled
            />
            <PaymentOption
              icon={CreditCard}
              title="Card"
              description="Visa, Mastercard and Amex via SSLCommerz."
              disabled
            />
          </div>
        </Step>

        <Step number={3} title="Delivery note" description="Anything the courier should know? (optional)">
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value.slice(0, 500))}
            rows={3}
            placeholder="e.g. Please call when you arrive · Leave with the building guard"
            className="w-full resize-y rounded-xl border border-input bg-background px-3.5 py-3 text-[15px] leading-relaxed shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
          />
          <p className="mt-2 text-right text-[13px] text-muted-foreground tabular-nums">
            {note.length}/500
          </p>
        </Step>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <section className="rounded-3xl border border-border/70 bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-6 py-5">
            <h2 className="text-lg font-semibold text-foreground">
              Order summary
              <span className="ml-2 text-[15px] font-normal text-muted-foreground tabular-nums">
                {cart.totalItems} {cart.totalItems === 1 ? "item" : "items"}
              </span>
            </h2>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Pencil className="size-3.5" />
              Edit
            </button>
          </div>

          <ul className="max-h-80 space-y-4 overflow-y-auto px-6 py-5">
            {cart.items.map((line) => (
              <li key={line.key} className="flex items-center gap-4">
                <span className="relative">
                  <LineThumb url={line.imageUrl} size={60} />
                  <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-xs font-semibold text-background tabular-nums">
                    {line.quantity}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-[15px] font-medium text-foreground">{line.name}</span>
                  {line.variantLabel && (
                    <span className="block text-sm text-muted-foreground">{line.variantLabel}</span>
                  )}
                  {line.issue && (
                    <span className="mt-0.5 flex items-center gap-1 text-sm text-destructive">
                      <CircleAlert className="size-3.5" aria-hidden="true" />
                      Needs attention
                    </span>
                  )}
                </span>
                <span className="text-[15px] font-medium text-foreground tabular-nums">
                  {formatPrice(line.subtotal)}
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-border/70 px-6 py-5">
            {couponCode ? (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="flex items-center gap-2 text-[15px] font-medium">
                  <Tag className="size-4" aria-hidden="true" />
                  {couponCode}
                </span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  aria-label={`Remove coupon ${couponCode}`}
                  className="flex size-7 items-center justify-center rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  void applyCoupon()
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <Tag
                    className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    value={couponInput}
                    onChange={(event) => {
                      setCouponInput(event.target.value)
                      setCouponError(null)
                    }}
                    placeholder="Coupon code"
                    aria-label="Coupon code"
                    aria-invalid={!!couponError}
                    className="h-11 w-full rounded-xl border border-input bg-background pr-3 pl-10 text-[15px] uppercase shadow-xs outline-none placeholder:normal-case placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15 aria-invalid:border-destructive"
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="h-11 rounded-xl px-5"
                  disabled={!couponInput.trim() || quoting}
                >
                  Apply
                </Button>
              </form>
            )}
            {couponError && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
                {couponError}
              </p>
            )}
          </div>

          <div
            className={cn(
              "space-y-3 border-t border-border/70 px-6 py-5 transition-opacity",
              quoting && "opacity-60"
            )}
            aria-busy={quoting}
          >
            <SummaryRow label="Subtotal" value={formatPrice(quote.subtotal)} />
            {Number(quote.discountAmount) > 0 && (
              <SummaryRow
                label={`Discount${couponCode ? ` (${couponCode})` : ""}`}
                value={`−${formatPrice(quote.discountAmount)}`}
                accent
              />
            )}
            <SummaryRow
              label="Delivery"
              value={shippingLabel}
              muted={quote.shippingFee === null}
              accent={quote.shippingFee !== null && Number(quote.shippingFee) === 0}
            />
            {Number(quote.amountToFreeShipping) > 0 && (
              <p className="text-sm text-muted-foreground">
                Add {formatPrice(quote.amountToFreeShipping)} more for free delivery.
              </p>
            )}
            <div className="flex items-baseline justify-between gap-4 border-t border-border/70 pt-4">
              <span className="text-base font-semibold text-foreground">Total</span>
              <span className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {quoting && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
                {formatPrice(quote.totalAmount)}
              </span>
            </div>
          </div>

          <div className="space-y-4 border-t border-border/70 px-6 py-5">
            {blocked && (
              <ul className="space-y-1.5 rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive">
                {(quote.problems.length > 0 ? quote.problems : ["Fix the items in your cart to continue."]).map(
                  (problem) => (
                    <li key={problem} className="flex items-start gap-2">
                      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      {problem}
                    </li>
                  )
                )}
              </ul>
            )}
            <Button
              type="button"
              onClick={placeOrder}
              disabled={placing || blocked || addingAddress || !addressId}
              className="hidden h-13 w-full rounded-full text-base font-semibold lg:inline-flex"
            >
              {placing ? <Loader2 className="size-5 animate-spin" /> : <Lock className="size-4" />}
              Place order · {formatPrice(quote.totalAmount)}
            </Button>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
                Pay only when you receive your order
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                Cancel free of charge until it ships
              </li>
            </ul>
          </div>
        </section>
      </aside>

      {/* Mobile: the total and the action stay within thumb reach. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <Button
          type="button"
          onClick={placeOrder}
          disabled={placing || blocked || addingAddress || !addressId}
          className="h-12 w-full rounded-full text-base font-semibold"
        >
          {placing ? <Loader2 className="size-5 animate-spin" /> : <Lock className="size-4" />}
          Place order · {formatPrice(quote.totalAmount)}
        </Button>
      </div>
    </div>
  )
}
