"use client"

import * as React from "react"
import { Layers, Loader2, Pencil, Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import {
  createVariantAction,
  deleteVariantAction,
  updateVariantAction,
} from "@/actions/product.actions"
import type { Attribute, ProductVariant } from "@/lib/backend-admin-products"
import { formatPrice } from "@/lib/format"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AffixInput, Field, INPUT_CLASS } from "./form-primitives"
import { StockBadge } from "./stock-badge"

interface Draft {
  sku: string
  price: string
  stock: string
  /** attributeId → optionId ("" while unchosen). */
  options: Array<{ attributeId: number; optionId: string }>
}

type DraftErrors = Partial<Record<"sku" | "price" | "stock" | "options", string>>

function skuPart(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 8)
}

function VariantDialog({
  open,
  onOpenChange,
  productId,
  productSku,
  defaultPrice,
  attributes,
  attributesInUse,
  variant,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: number
  productSku: string
  defaultPrice: string
  attributes: Attribute[]
  attributesInUse: number[]
  variant: ProductVariant | null
}) {
  const initial = React.useCallback(
    (): Draft =>
      variant
        ? {
            sku: variant.sku,
            price: String(Number(variant.price)),
            stock: String(variant.stockQuantity),
            options: variant.options.map((option) => ({
              attributeId: option.attributeId,
              optionId: String(option.attributeOptionId),
            })),
          }
        : {
            sku: "",
            price: defaultPrice,
            stock: "0",
            // Siblings share attributes; the first variant starts empty so the
            // admin picks what actually varies (colour, size…).
            options: attributesInUse.map((attributeId) => ({ attributeId, optionId: "" })),
          },
    [variant, defaultPrice, attributesInUse]
  )

  const [draft, setDraft] = React.useState<Draft>(initial)
  const [errors, setErrors] = React.useState<DraftErrors>({})
  const [skuTouched, setSkuTouched] = React.useState(false)
  const [isSaving, startSave] = React.useTransition()

  // Re-seed whenever the dialog opens for a different variant (or "new").
  const openKey = open ? (variant ? `edit-${variant.id}` : "new") : null
  const [lastKey, setLastKey] = React.useState<string | null>(null)
  if (openKey && openKey !== lastKey) {
    setLastKey(openKey)
    setDraft(initial())
    setErrors({})
    setSkuTouched(!!variant)
  }
  if (!openKey && lastKey) setLastKey(null)

  const attributeById = new Map(attributes.map((attribute) => [attribute.id, attribute]))
  const unusedAttributes = attributes.filter(
    (attribute) => !draft.options.some((option) => option.attributeId === attribute.id)
  )

  // Suggest a SKU from the chosen options until the admin types their own.
  const suggestedSku = [
    productSku,
    ...draft.options.map((option) => {
      const value = attributeById
        .get(option.attributeId)
        ?.options.find((o) => String(o.id) === option.optionId)?.value
      return value ? skuPart(value) : ""
    }),
  ]
    .filter(Boolean)
    .join("-")
  const sku = skuTouched ? draft.sku : suggestedSku

  const setOption = (index: number, patch: Partial<Draft["options"][number]>) =>
    setDraft((prev) => ({
      ...prev,
      options: prev.options.map((option, i) => (i === index ? { ...option, ...patch } : option)),
    }))

  const submit = () => {
    const next: DraftErrors = {}
    const price = Number(draft.price)
    const stock = Number(draft.stock)
    if (!sku.trim()) next.sku = "Enter a SKU"
    if (!(price > 0)) next.price = "Enter a price above 0"
    if (!Number.isInteger(stock) || stock < 0) next.stock = "Use a whole number, 0 or more"
    const chosen = draft.options.filter((option) => option.optionId)
    if (draft.options.length === 0) next.options = "Add at least one attribute, like Colour or Size"
    else if (chosen.length !== draft.options.length)
      next.options = "Choose a value for every attribute"
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const payload = {
      sku: sku.trim(),
      price,
      stockQuantity: stock,
      attributeOptionIds: chosen.map((option) => Number(option.optionId)),
    }
    startSave(async () => {
      const result = variant
        ? await updateVariantAction(productId, variant.id, payload)
        : await createVariantAction(productId, payload)
      if ("error" in result) {
        toast.error(variant ? "Couldn't save variant" : "Couldn't add variant", {
          description: result.error,
        })
        return
      }
      toast.success(variant ? "Variant updated" : "Variant added", {
        description: `${result.variant.options.map((o) => o.value).join(" · ")} — ${result.variant.stockQuantity} in stock.`,
      })
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent className="gap-6 rounded-3xl p-7 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{variant ? "Edit variant" : "Add variant"}</DialogTitle>
          <DialogDescription className="text-[15px]">
            A variant is one buyable combination, like “Black · 256GB”, with its own SKU, price and stock.
          </DialogDescription>
        </DialogHeader>

        <form
          id="variant-form"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
          className="space-y-5"
        >
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Options</p>
            <div className="space-y-2.5">
              {draft.options.map((option, index) => {
                const attribute = attributeById.get(option.attributeId)
                return (
                  <div key={option.attributeId} className="flex items-center gap-2.5">
                    <span className="w-28 shrink-0 truncate text-[15px] text-muted-foreground">
                      {attribute?.name ?? "Attribute"}
                    </span>
                    <Select
                      value={option.optionId}
                      onValueChange={(optionId) => setOption(index, { optionId })}
                    >
                      <SelectTrigger
                        className="h-11! flex-1 rounded-xl text-[15px]"
                        aria-label={`${attribute?.name ?? "Attribute"} value`}
                        aria-invalid={!!errors.options && !option.optionId}
                      >
                        <SelectValue placeholder={`Choose ${attribute?.name.toLowerCase() ?? "value"}`} />
                      </SelectTrigger>
                      <SelectContent position="popper" className="max-h-72 rounded-xl">
                        {attribute?.options.map((o) => (
                          <SelectItem key={o.id} value={String(o.id)}>
                            {o.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {draft.options.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-10 rounded-xl"
                        aria-label={`Remove ${attribute?.name ?? "attribute"}`}
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            options: prev.options.filter((_, i) => i !== index),
                          }))
                        }
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
            {unusedAttributes.length > 0 && draft.options.length < 10 && (
              <Select
                value=""
                onValueChange={(attributeId) =>
                  setDraft((prev) => ({
                    ...prev,
                    options: [...prev.options, { attributeId: Number(attributeId), optionId: "" }],
                  }))
                }
              >
                <SelectTrigger
                  className={
                    draft.options.length === 0
                      ? "h-11! w-full gap-2 rounded-xl border-dashed text-[15px] text-muted-foreground shadow-none"
                      : "h-9! w-auto gap-1.5 rounded-lg border-dashed text-sm text-muted-foreground shadow-none"
                  }
                  aria-invalid={!!errors.options && draft.options.length === 0}
                >
                  <Plus className="size-4" />
                  <SelectValue
                    placeholder={draft.options.length === 0 ? "Choose an attribute (Colour, Size…)" : "Add attribute"}
                  />
                </SelectTrigger>
                <SelectContent position="popper" className="rounded-xl">
                  {unusedAttributes.map((attribute) => (
                    <SelectItem key={attribute.id} value={String(attribute.id)}>
                      {attribute.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.options && <p className="text-sm text-destructive">{errors.options}</p>}
          </div>

          <Field id="variant-sku" label="SKU" error={errors.sku} hint="Suggested from the options — edit if you use your own codes.">
            <input
              id="variant-sku"
              value={sku}
              onChange={(event) => {
                setSkuTouched(true)
                setDraft((prev) => ({ ...prev, sku: event.target.value }))
              }}
              aria-invalid={!!errors.sku}
              className={`${INPUT_CLASS} font-mono`}
              maxLength={100}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="variant-price" label="Price" error={errors.price}>
              <AffixInput
                id="variant-price"
                prefix="৳"
                inputMode="decimal"
                value={draft.price}
                onChange={(event) => setDraft((prev) => ({ ...prev, price: event.target.value }))}
                aria-invalid={!!errors.price}
              />
            </Field>
            <Field id="variant-stock" label="Stock" error={errors.stock}>
              <input
                id="variant-stock"
                inputMode="numeric"
                value={draft.stock}
                onChange={(event) => setDraft((prev) => ({ ...prev, stock: event.target.value }))}
                aria-invalid={!!errors.stock}
                className={INPUT_CLASS}
              />
            </Field>
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl px-5"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" form="variant-form" className="h-11 rounded-xl px-5" disabled={isSaving}>
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {variant ? "Save variant" : "Add variant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function VariantManager({
  productId,
  productSku,
  defaultPrice,
  variants,
  attributes,
  lowThreshold,
}: {
  productId: number
  productSku: string
  defaultPrice: string
  variants: ProductVariant[]
  attributes: Attribute[]
  lowThreshold: number
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<ProductVariant | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<ProductVariant | null>(null)
  const [isDeleting, startDelete] = React.useTransition()

  const attributesInUse = [
    ...new Set(variants.flatMap((variant) => variant.options.map((option) => option.attributeId))),
  ]
  const totalStock = variants.reduce((sum, variant) => sum + variant.stockQuantity, 0)

  const openNew = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const confirmDelete = () => {
    const target = deleteTarget
    if (!target) return
    startDelete(async () => {
      const result = await deleteVariantAction(productId, target.id)
      if ("error" in result) {
        toast.error("Couldn't delete variant", { description: result.error })
        return
      }
      setDeleteTarget(null)
      toast.success("Variant deleted", {
        description: `${target.options.map((o) => o.value).join(" · ")} was removed.`,
      })
    })
  }

  return (
    <>
      {variants.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border px-6 py-10 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-muted">
            <Layers className="size-5 text-muted-foreground" />
          </span>
          <div className="space-y-1">
            <p className="font-medium text-foreground">No variants</p>
            <p className="text-sm text-muted-foreground">
              Sold as a single item. Add variants for sizes, colours or storage options.
            </p>
          </div>
          <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={openNew}>
            <Plus className="size-4" />
            Add variant
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border/70">
            <Table className="text-[15px]">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40 [&>th]:h-11 [&>th]:text-[13px] [&>th]:font-medium [&>th]:text-muted-foreground">
                  <TableHead className="pl-4">Variant</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="w-24 pr-4">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.id} className="[&>td]:py-3">
                    <TableCell className="pl-4">
                      <span className="flex flex-wrap gap-1.5">
                        {variant.options.map((option) => (
                          <span
                            key={option.attributeOptionId}
                            className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-[13px]"
                          >
                            <span className="text-muted-foreground">{option.attributeName}</span>
                            <span className="font-medium text-foreground">{option.value}</span>
                          </span>
                        ))}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-[13px] text-muted-foreground">
                      {variant.sku}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatPrice(variant.price)}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <StockBadge quantity={variant.stockQuantity} lowThreshold={lowThreshold} />
                        <span className="text-[13px] text-muted-foreground tabular-nums">
                          {variant.stockQuantity}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="pr-4">
                      <span className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-9 rounded-lg"
                          aria-label={`Edit ${variant.sku}`}
                          onClick={() => {
                            setEditing(variant)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-9 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Delete ${variant.sku}`}
                          onClick={() => setDeleteTarget(variant)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {variants.length} {variants.length === 1 ? "variant" : "variants"} ·{" "}
              <span className="font-medium text-foreground tabular-nums">{totalStock}</span> units in
              total
            </p>
            <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={openNew}>
              <Plus className="size-4" />
              Add variant
            </Button>
          </div>
        </div>
      )}

      <VariantDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        productId={productId}
        productSku={productSku}
        defaultPrice={defaultPrice}
        attributes={attributes}
        attributesInUse={attributesInUse}
        variant={editing}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this variant?</AlertDialogTitle>
            <AlertDialogDescription className="text-[15px]">
              {deleteTarget?.options.map((o) => o.value).join(" · ")} ({deleteTarget?.sku}) will be
              removed and its {deleteTarget?.stockQuantity ?? 0} units taken out of the product&apos;s
              stock. Past orders keep their record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="rounded-xl"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault()
                confirmDelete()
              }}
            >
              {isDeleting && <Loader2 className="size-4 animate-spin" />}
              Delete variant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
