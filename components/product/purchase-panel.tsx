"use client"

import * as React from "react"
import { Minus, Plus, ShoppingBag } from "lucide-react"
import { Price } from "@/components/catalog/price"
import type { ProductOptionGroup, ProductVariant } from "@/lib/storefront-types"
import { cn } from "@/lib/utils"

const MAX_QUANTITY = 10
const LOW_STOCK_THRESHOLD = 5

interface PurchasePanelProps {
  basePrice: string
  discountPrice: string | null
  stockQuantity: number
  optionGroups: ProductOptionGroup[]
  variants: ProductVariant[]
  /** Variant preselected from the ?variant= URL param, if valid. */
  initialVariantId: number | null
}

type Selection = Record<number, number>

function selectionOf(
  variant: ProductVariant,
  groups: ProductOptionGroup[]
): Selection {
  const selection: Selection = {}
  for (const group of groups) {
    const match = group.values.find((value) =>
      variant.optionIds.includes(value.id)
    )
    if (match) selection[group.attributeId] = match.id
  }
  return selection
}

function findVariant(
  variants: ProductVariant[],
  groups: ProductOptionGroup[],
  selection: Selection
): ProductVariant | undefined {
  return variants.find((variant) =>
    groups.every((group) => {
      const chosen = selection[group.attributeId]
      return chosen !== undefined && variant.optionIds.includes(chosen)
    })
  )
}

export function PurchasePanel({
  basePrice,
  discountPrice,
  stockQuantity,
  optionGroups,
  variants,
  initialVariantId,
}: PurchasePanelProps) {
  const hasVariants = variants.length > 0 && optionGroups.length > 0

  // Default: the URL's variant, else the first variant that is in stock.
  const [selection, setSelection] = React.useState<Selection>(() => {
    const initial =
      variants.find((variant) => variant.id === initialVariantId) ??
      variants.find((variant) => variant.stockQuantity > 0) ??
      variants[0]
    return initial ? selectionOf(initial, optionGroups) : {}
  })
  const [quantity, setQuantity] = React.useState(1)

  const selected = hasVariants
    ? findVariant(variants, optionGroups, selection)
    : undefined
  const available = hasVariants ? (selected?.stockQuantity ?? 0) : stockQuantity
  const maxQuantity = Math.max(1, Math.min(MAX_QUANTITY, available))

  // Variant prices already include the sale price; derive the matching
  // "was" price by applying the same option surcharge to the base price.
  const sellingPrice = Number.parseFloat(discountPrice ?? basePrice)
  const variantPrice = selected
    ? Number.parseFloat(selected.price)
    : sellingPrice
  const surcharge = variantPrice - sellingPrice
  const displayBase = String(Number.parseFloat(basePrice) + surcharge)
  const displaySale = discountPrice !== null ? String(variantPrice) : null
  const displayRegular =
    discountPrice === null ? String(variantPrice) : displayBase

  const choose = (attributeId: number, optionId: number) => {
    const next = { ...selection, [attributeId]: optionId }
    setSelection(next)
    setQuantity(1)
    const variant = findVariant(variants, optionGroups, next)
    // Shareable URL for the exact configuration, without a server round trip.
    const url = new URL(window.location.href)
    if (variant) url.searchParams.set("variant", String(variant.id))
    else url.searchParams.delete("variant")
    window.history.replaceState(null, "", url)
  }

  /** For each option: does picking it (keeping the other choices) reach a real, in-stock variant? */
  const optionState = (
    group: ProductOptionGroup,
    optionId: number
  ): "available" | "sold-out" | "unavailable" => {
    const candidate = findVariant(variants, optionGroups, {
      ...selection,
      [group.attributeId]: optionId,
    })
    if (!candidate) return "unavailable"
    return candidate.stockQuantity > 0 ? "available" : "sold-out"
  }

  return (
    <div className="space-y-6">
      <Price basePrice={displayRegular} discountPrice={displaySale} size="lg" />

      {hasVariants &&
        optionGroups.map((group) => {
          const chosen = group.values.find(
            (value) => value.id === selection[group.attributeId]
          )
          return (
            <fieldset key={group.attributeId} className="space-y-2.5">
              <legend className="text-sm">
                <span className="font-semibold text-foreground">
                  {group.name}:
                </span>{" "}
                <span className="text-muted-foreground">
                  {chosen?.value ?? "Select"}
                </span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {group.values.map((value) => {
                  const state = optionState(group, value.id)
                  const isChosen = selection[group.attributeId] === value.id
                  return (
                    <button
                      key={value.id}
                      type="button"
                      onClick={() => choose(group.attributeId, value.id)}
                      disabled={state === "unavailable"}
                      aria-pressed={isChosen}
                      title={
                        state === "sold-out"
                          ? `${value.value} — sold out`
                          : value.value
                      }
                      className={cn(
                        "min-w-12 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all",
                        isChosen
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground/40",
                        state === "sold-out" &&
                          !isChosen &&
                          "text-muted-foreground line-through decoration-1",
                        state === "unavailable" &&
                          "cursor-not-allowed opacity-40"
                      )}
                    >
                      {value.value}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )
        })}

      <p
        className={cn(
          "flex items-center gap-2 text-sm font-medium",
          available <= 0
            ? "text-destructive"
            : available <= LOW_STOCK_THRESHOLD
              ? "text-amber-600 dark:text-amber-400"
              : "text-emerald-600 dark:text-emerald-400"
        )}
        aria-live="polite"
      >
        <span className="size-2 rounded-full bg-current" aria-hidden="true" />
        {available <= 0
          ? hasVariants && !selected
            ? "This combination is not available"
            : "Out of stock"
          : available <= LOW_STOCK_THRESHOLD
            ? `Only ${available} left — order soon`
            : "In stock, ready to ship"}
      </p>

      <div className="flex flex-wrap items-stretch gap-3">
        <div className="flex items-center rounded-full border border-border">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="flex size-11 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <span
            className="w-8 text-center text-sm font-semibold"
            aria-live="polite"
            aria-label={`Quantity ${quantity}`}
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              setQuantity((value) => Math.min(maxQuantity, value + 1))
            }
            disabled={quantity >= maxQuantity || available <= 0}
            aria-label="Increase quantity"
            className="flex size-11 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>

        {/* Cart integration is the next milestone: the backend cart is not
            variant-aware yet, so adding here would price the wrong variant. */}
        <button
          type="button"
          disabled
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingBag className="size-4" />
          {available <= 0 ? "Sold out" : "Add to cart"}
        </button>
      </div>
      {available > 0 && (
        <p className="-mt-3 text-xs text-muted-foreground">
          Online checkout is coming soon.
        </p>
      )}

      {selected && (
        <p className="text-xs text-muted-foreground">SKU: {selected.sku}</p>
      )}
    </div>
  )
}
