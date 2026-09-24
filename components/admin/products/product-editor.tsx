"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/actions/product.actions"
import type {
  AdminProduct,
  Attribute,
  CategoryNode,
  ProductInput,
} from "@/lib/backend-admin-products"
import { LOW_STOCK_THRESHOLD } from "@/lib/backend-admin-products"
import { formatPrice } from "@/lib/format"
import { productHref } from "@/lib/routes"
import { cn } from "@/lib/utils"
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
import { Kbd } from "@/components/ui/kbd"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AffixInput, Field, INPUT_CLASS, Section } from "./form-primitives"
import { ProductMedia } from "./product-media"
import { ProductThumb } from "./product-thumb"
import { StockBadge } from "./stock-badge"
import { VariantManager } from "./variant-manager"

// ── Form model ──────────────────────────────────────────────────────────────

interface FormState {
  name: string
  slug: string
  description: string
  categoryId: string
  price: string
  salePrice: string
  sku: string
  stock: string
  isPublished: boolean
  metaTitle: string
  metaDesc: string
  images: string[]
}

type FieldKey = Exclude<keyof FormState, "isPublished">
type Errors = Partial<Record<FieldKey, string>>

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "")
}

function money(value: string | null): string {
  if (value === null) return ""
  const number = Number(value)
  return Number.isFinite(number) ? String(number) : ""
}

function fromProduct(product: AdminProduct | null): FormState {
  return {
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    categoryId: product ? String(product.categoryId) : "",
    price: money(product?.basePrice ?? null),
    salePrice: money(product?.discountPrice ?? null),
    sku: product?.sku ?? "",
    stock: product ? String(product.stockQuantity) : "0",
    isPublished: product?.isPublished ?? false,
    metaTitle: product?.metaTitle ?? "",
    metaDesc: product?.metaDesc ?? "",
    images: product?.images.map((image) => image.url) ?? [],
  }
}

function validate(form: FormState, hasVariants: boolean): Errors {
  const errors: Errors = {}
  const name = form.name.trim()
  if (name.length < 2) errors.name = "Give the product a name (at least 2 characters)"
  else if (name.length > 200) errors.name = "Keep the name under 200 characters"
  if (!SLUG_PATTERN.test(form.slug) || form.slug.length < 2)
    errors.slug = "Use lowercase letters, numbers and single hyphens"
  if (!form.description.trim()) errors.description = "Describe the product for shoppers"
  if (!form.categoryId) errors.categoryId = "Choose a category"
  const price = Number(form.price)
  if (!form.price || !(price > 0)) errors.price = "Enter a price above 0"
  if (form.salePrice) {
    const sale = Number(form.salePrice)
    if (!(sale > 0)) errors.salePrice = "Enter a sale price above 0, or leave it empty"
    else if (price > 0 && sale >= price) errors.salePrice = "Sale price must be lower than the price"
  }
  if (!form.sku.trim()) errors.sku = "Enter a SKU"
  if (!hasVariants) {
    const stock = Number(form.stock)
    if (form.stock === "" || !Number.isInteger(stock) || stock < 0)
      errors.stock = "Use a whole number, 0 or more"
  }
  if (form.metaTitle.length > 160) errors.metaTitle = "Keep it under 160 characters"
  if (form.metaDesc.length > 300) errors.metaDesc = "Keep it under 300 characters"
  return errors
}

function toInput(form: FormState, hasVariants: boolean): ProductInput {
  return {
    categoryId: Number(form.categoryId),
    name: form.name.trim(),
    slug: form.slug,
    description: form.description.trim(),
    basePrice: Number(form.price),
    discountPrice: form.salePrice ? Number(form.salePrice) : null,
    sku: form.sku.trim(),
    // Variant products derive stock from their variants (the API refuses a write).
    ...(!hasVariants && { stockQuantity: Number(form.stock) }),
    isPublished: form.isPublished,
    metaTitle: form.metaTitle.trim() || null,
    metaDesc: form.metaDesc.trim() || null,
    images: form.images.map((url, index) => ({ url, isThumbnail: index === 0 })),
  }
}

// ── Pieces ──────────────────────────────────────────────────────────────────

function CategorySelect({
  categories,
  value,
  onChange,
  invalid,
}: {
  categories: CategoryNode[]
  value: string
  onChange: (value: string) => void
  invalid: boolean
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        id="categoryId"
        className="h-11! w-full rounded-xl text-[15px]"
        aria-invalid={invalid}
      >
        <SelectValue placeholder="Choose a category" />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-96 rounded-xl">
        {categories.map((parent) =>
          parent.children.length > 0 ? (
            <SelectGroup key={parent.id}>
              <SelectLabel>{parent.name}</SelectLabel>
              {parent.children.map((child) => (
                <SelectItem key={child.id} value={String(child.id)}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ) : (
            <SelectItem key={parent.id} value={String(parent.id)}>
              {parent.name}
            </SelectItem>
          )
        )}
      </SelectContent>
    </Select>
  )
}

function categoryName(categories: CategoryNode[], id: string): string | null {
  for (const parent of categories) {
    if (String(parent.id) === id) return parent.name
    const child = parent.children.find((c) => String(c.id) === id)
    if (child) return child.name
  }
  return null
}

function StorePreview({
  form,
  category,
  stock,
}: {
  form: FormState
  category: string | null
  stock: number
}) {
  const price = Number(form.price)
  const sale = Number(form.salePrice)
  const onSale = form.salePrice !== "" && sale > 0 && sale < price
  const off = onSale ? Math.floor(((price - sale) / price) * 100) : 0
  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        {form.images[0] ? (
          <ProductThumb url={form.images[0]} size={400} className="size-full! rounded-none border-0" />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            No image yet
          </div>
        )}
        {onSale && (
          <span className="absolute top-3 left-3 rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background">
            −{off}%
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[13px] text-muted-foreground">{category ?? "Category"}</p>
        <p className="line-clamp-2 font-medium text-foreground">
          {form.name.trim() || "Product name"}
        </p>
        <p className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-foreground tabular-nums">
            {price > 0 ? formatPrice(onSale ? sale : price) : "৳—"}
          </span>
          {onSale && (
            <span className="text-sm text-muted-foreground tabular-nums line-through">
              {formatPrice(price)}
            </span>
          )}
        </p>
      </div>
      <StockBadge quantity={stock} lowThreshold={LOW_STOCK_THRESHOLD} />
    </div>
  )
}

function SearchPreview({ form }: { form: FormState }) {
  const title = form.metaTitle.trim() || form.name.trim() || "Product name"
  const description =
    form.metaDesc.trim() ||
    form.description.trim().slice(0, 160) ||
    "A short summary of the product shows here in search results."
  return (
    <div className="rounded-2xl border border-border/70 bg-background p-5">
      <p className="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
        Search result preview
      </p>
      <p className="truncate text-sm text-muted-foreground">
        aura.com.bd › products › {form.slug || "product-slug"}
      </p>
      <p className="mt-1 line-clamp-1 text-lg text-[#1a0dab] dark:text-[#8ab4f8]">{title}</p>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

// ── Editor ──────────────────────────────────────────────────────────────────

export function ProductEditor({
  product,
  categories,
  attributes,
}: {
  product: AdminProduct | null
  categories: CategoryNode[]
  attributes: Attribute[]
}) {
  const router = useRouter()
  const isNew = product === null
  const hasVariants = (product?.variants.length ?? 0) > 0

  const [form, setForm] = React.useState<FormState>(() => fromProduct(product))
  const [baseline, setBaseline] = React.useState(() => JSON.stringify(fromProduct(product)))
  const [slugTouched, setSlugTouched] = React.useState(!isNew)
  const [errors, setErrors] = React.useState<Errors>({})
  const [isSaving, startSave] = React.useTransition()
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [isDeleting, startDelete] = React.useTransition()

  const dirty = JSON.stringify(form) !== baseline
  // Live stock for variant products comes from the server (variant edits re-sync it).
  const stock = hasVariants ? (product?.stockQuantity ?? 0) : Number(form.stock) || 0

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const setName = (name: string) => {
    setForm((prev) => ({ ...prev, name, ...(!slugTouched && { slug: slugify(name) }) }))
    setErrors((prev) => ({ ...prev, name: undefined, ...(!slugTouched && { slug: undefined }) }))
  }

  const save = React.useCallback(() => {
    const found = validate(form, hasVariants)
    setErrors(found)
    const firstError = Object.keys(found)[0]
    if (firstError) {
      toast.warning("Check the highlighted fields", {
        id: "product-form-invalid",
        description: Object.values(found)[0],
      })
      document.getElementById(firstError)?.focus()
      return
    }
    const input = toInput(form, hasVariants)
    startSave(async () => {
      if (isNew) {
        const result = await createProductAction(input)
        if ("error" in result) {
          toast.error("Couldn't create product", { description: result.error })
          return
        }
        setBaseline(JSON.stringify(form))
        toast.success("Product created", {
          description: result.product.isPublished
            ? `“${result.product.name}” is live. Add variants below if it comes in options.`
            : `“${result.product.name}” is saved as a draft. Add variants, then publish.`,
        })
        router.replace(`/admin/products/${result.product.id}`)
        return
      }
      const result = await updateProductAction(product.id, input)
      if ("error" in result) {
        toast.error("Couldn't save changes", { description: result.error })
        return
      }
      const saved = fromProduct(result.product)
      setForm(saved)
      setBaseline(JSON.stringify(saved))
      toast.success("Changes saved", {
        description: result.product.isPublished
          ? `“${result.product.name}” is up to date in the store.`
          : `“${result.product.name}” is saved as a draft.`,
      })
    })
  }, [form, hasVariants, isNew, product, router])

  // ⌘/Ctrl+S saves; leaving with unsaved edits asks first.
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault()
        if (!isSaving) save()
      }
    }
    const onUnload = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault()
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("beforeunload", onUnload)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("beforeunload", onUnload)
    }
  }, [save, dirty, isSaving])

  const confirmDelete = () => {
    if (!product) return
    startDelete(async () => {
      const result = await deleteProductAction(product.id)
      if ("error" in result) {
        setDeleteOpen(false)
        toast.error("Couldn't delete product", { description: result.error })
        return
      }
      setBaseline(JSON.stringify(form))
      toast.success("Product deleted", { description: `“${product.name}” was removed.` })
      router.push("/admin/products")
    })
  }

  const price = Number(form.price)
  const sale = Number(form.salePrice)
  const off =
    form.salePrice && sale > 0 && price > 0 && sale < price
      ? Math.floor(((price - sale) / price) * 100)
      : 0
  const category = categoryName(categories, form.categoryId)

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        save()
      }}
      className="space-y-6"
    >
      {/* Sticky action bar */}
      <div className="sticky top-3 z-20 -mx-1 flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card/90 px-4 py-3 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-card/75 sm:px-5">
        <Button asChild variant="ghost" size="icon" className="size-10 rounded-xl">
          <Link href="/admin/products" aria-label="Back to products">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="mr-auto min-w-0">
          <p className="truncate text-lg font-semibold text-foreground">
            {isNew ? "New product" : product.name}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className={cn(
                "size-2 rounded-full",
                form.isPublished ? "bg-emerald-500" : "bg-muted-foreground/50"
              )}
              aria-hidden="true"
            />
            {form.isPublished ? "Live" : "Draft"}
            {dirty && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-amber-700 dark:text-amber-400">Unsaved changes</span>
              </>
            )}
          </p>
        </div>
        {!isNew && product.isPublished && (
          <Button asChild variant="ghost" className="hidden h-10 rounded-xl sm:inline-flex">
            <Link href={productHref(product.id)} target="_blank">
              <ExternalLink className="size-4" />
              View in store
            </Link>
          </Button>
        )}
        {dirty && !isNew && (
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl"
            disabled={isSaving}
            onClick={() => {
              setForm(JSON.parse(baseline) as FormState)
              setErrors({})
            }}
          >
            Discard
          </Button>
        )}
        <Button type="submit" className="h-10 rounded-xl px-5 font-semibold" disabled={isSaving}>
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          {isNew ? "Create product" : "Save changes"}
          <Kbd className="ml-1 hidden bg-primary-foreground/15 text-primary-foreground lg:inline-flex">
            ⌘S
          </Kbd>
        </Button>
      </div>

      <div className="grid gap-6 *:min-w-0 lg:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-6">
          <Section title="Basics" description="What shoppers see first.">
            <div className="space-y-5">
              <Field id="name" label="Product name" error={errors.name} counter={{ value: form.name.length, max: 200 }}>
                <input
                  id="name"
                  value={form.name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Sony WH-1000XM6 Wireless Headphones"
                  aria-invalid={!!errors.name}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field
                id="slug"
                label="URL slug"
                error={errors.slug}
                hint={slugTouched ? "Changing the slug changes the product's link." : "Generated from the name."}
              >
                <AffixInput
                  id="slug"
                  prefix="/products/"
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true)
                    set("slug", slugify(event.target.value) || event.target.value.toLowerCase())
                  }}
                  aria-invalid={!!errors.slug}
                  className="font-mono text-sm"
                />
              </Field>
              <Field id="description" label="Description" error={errors.description} hint="Features, materials, what's in the box — plain text, line breaks are kept.">
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(event) => set("description", event.target.value)}
                  rows={8}
                  aria-invalid={!!errors.description}
                  className={cn(INPUT_CLASS, "h-auto min-h-44 resize-y py-3 leading-relaxed")}
                />
              </Field>
            </div>
          </Section>

          <Section title="Media" description="Up to 20 images. The cover appears in listings and search.">
            <ProductMedia images={form.images} onChange={(images) => set("images", images)} />
          </Section>

          <Section title="Pricing">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="price" label="Price" error={errors.price}>
                <AffixInput
                  id="price"
                  prefix="৳"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(event) => set("price", event.target.value.replace(/[^\d.]/g, ""))}
                  placeholder="0"
                  aria-invalid={!!errors.price}
                  className="tabular-nums"
                />
              </Field>
              <Field
                id="salePrice"
                label="Sale price"
                optional
                error={errors.salePrice}
                hint={
                  off > 0 ? (
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      Shoppers save {off}% ({formatPrice(price - sale)})
                    </span>
                  ) : (
                    "Leave empty when it isn't on sale."
                  )
                }
              >
                <AffixInput
                  id="salePrice"
                  prefix="৳"
                  inputMode="decimal"
                  value={form.salePrice}
                  onChange={(event) => set("salePrice", event.target.value.replace(/[^\d.]/g, ""))}
                  placeholder="—"
                  aria-invalid={!!errors.salePrice}
                  className="tabular-nums"
                />
              </Field>
            </div>
          </Section>

          <Section title="Inventory">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="sku" label="SKU" error={errors.sku} hint="Your internal stock code. Must be unique.">
                <input
                  id="sku"
                  value={form.sku}
                  onChange={(event) => set("sku", event.target.value.toUpperCase())}
                  placeholder="e.g. ELC-AUD-001"
                  aria-invalid={!!errors.sku}
                  maxLength={100}
                  className={cn(INPUT_CLASS, "font-mono text-sm")}
                />
              </Field>
              <Field
                id="stock"
                label="Stock"
                error={errors.stock}
                hint={
                  hasVariants
                    ? `Total of ${product?.variants.length} ${product?.variants.length === 1 ? "variant" : "variants"} — edit stock per variant below.`
                    : "Units available to sell."
                }
              >
                <input
                  id="stock"
                  inputMode="numeric"
                  value={hasVariants ? String(stock) : form.stock}
                  disabled={hasVariants}
                  onChange={(event) => set("stock", event.target.value.replace(/\D/g, ""))}
                  aria-invalid={!!errors.stock}
                  className={cn(INPUT_CLASS, "tabular-nums")}
                />
              </Field>
            </div>
          </Section>

          <Section
            title="Variants"
            description="Sizes, colours, storage… each with its own SKU, price and stock."
          >
            {isNew ? (
              <p className="rounded-2xl bg-muted/60 px-5 py-4 text-[15px] text-muted-foreground">
                Create the product first — you can add variants right after.
              </p>
            ) : (
              <VariantManager
                productId={product.id}
                productSku={product.sku}
                defaultPrice={money(product.discountPrice ?? product.basePrice)}
                variants={product.variants}
                attributes={attributes}
                lowThreshold={LOW_STOCK_THRESHOLD}
              />
            )}
          </Section>

          <Section title="Search engine listing" description="How the product appears on Google and when shared.">
            <div className="space-y-5">
              <Field id="metaTitle" label="Page title" optional error={errors.metaTitle} counter={{ value: form.metaTitle.length, max: 160 }}>
                <input
                  id="metaTitle"
                  value={form.metaTitle}
                  onChange={(event) => set("metaTitle", event.target.value)}
                  placeholder={form.name || "Defaults to the product name"}
                  aria-invalid={!!errors.metaTitle}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field id="metaDesc" label="Meta description" optional error={errors.metaDesc} counter={{ value: form.metaDesc.length, max: 300 }}>
                <textarea
                  id="metaDesc"
                  value={form.metaDesc}
                  onChange={(event) => set("metaDesc", event.target.value)}
                  rows={3}
                  placeholder="Defaults to the start of the description"
                  aria-invalid={!!errors.metaDesc}
                  className={cn(INPUT_CLASS, "h-auto resize-y py-3 leading-relaxed")}
                />
              </Field>
              <SearchPreview form={form} />
            </div>
          </Section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <Section title="Visibility">
            <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl bg-muted/50 p-4">
              <span className="space-y-1">
                <span className="block font-medium text-foreground">
                  {form.isPublished ? "Published" : "Draft"}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {form.isPublished
                    ? "Visible in the store, search and collections."
                    : "Hidden from shoppers until you publish."}
                </span>
              </span>
              <Switch
                checked={form.isPublished}
                onCheckedChange={(checked) => set("isPublished", checked)}
                aria-label="Published"
              />
            </label>
          </Section>

          <Section title="Organisation">
            <Field id="categoryId" label="Category" error={errors.categoryId}>
              <CategorySelect
                categories={categories}
                value={form.categoryId}
                onChange={(value) => set("categoryId", value)}
                invalid={!!errors.categoryId}
              />
            </Field>
          </Section>

          <Section title="Store preview">
            <StorePreview form={form} category={category} stock={stock} />
          </Section>

          {!isNew && (
            <section className="rounded-3xl border border-destructive/25 bg-card p-6">
              <h2 className="font-semibold text-foreground">Delete product</h2>
              <p className="mt-1 mb-4 text-sm text-muted-foreground">
                Removes the product, its images and variants. Products that have been ordered
                can only be moved to drafts.
              </p>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete product
              </Button>
            </section>
          )}
        </aside>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={(open) => !isDeleting && setDeleteOpen(open)}>
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription className="text-[15px]">
              “{product?.name}” will be removed permanently with its images and variants. This
              can&apos;t be undone.
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
              Delete product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}
