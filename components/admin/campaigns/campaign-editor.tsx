"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Banknote,
  CalendarRange,
  ImagePlus,
  Loader2,
  Percent,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"
import {
  createCampaignAction,
  searchCampaignProductsAction,
  updateCampaignAction,
  uploadCampaignBannerAction,
  type ProductOption,
} from "@/actions/campaign.actions"
import { AffixInput, Field, INPUT_CLASS, Section } from "@/components/admin/products/form-primitives"
import { CampaignStatusBadge } from "@/components/admin/campaigns/campaign-status-badge"
import { LineThumb } from "@/components/cart/cart-drawer"
import { CampaignHero, DEFAULT_ACCENT } from "@/components/campaigns/campaign-hero"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import { Switch } from "@/components/ui/switch"
import type { CategoryNode } from "@/lib/backend-admin-products"
import type { CampaignDetail, CampaignDiscountType, CampaignInput, PublicCampaign } from "@/lib/backend-campaigns"
import { endOfDayAfter, fromDhakaInput, hoursAfter, toDhakaInput } from "@/lib/dhaka-time"
import { formatPrice } from "@/lib/format"
import { IMAGE_ACCEPT, checkImage } from "@/lib/upload-rules"
import { cn } from "@/lib/utils"

// ── Form state ──────────────────────────────────────────────────────────────

interface PickedProduct {
  id: number
  name: string
  thumbnailUrl: string | null
  /** List price, before any sale. */
  basePrice: string
  /** Current selling price (product sale applied). */
  price: string
}

interface FormState {
  name: string
  slug: string
  tagline: string
  description: string
  discountType: CampaignDiscountType
  discountValue: string
  maxDiscountAmount: string
  startsAt: string
  endsAt: string
  isActive: boolean
  isFeatured: boolean
  bannerUrl: string | null
  accentColor: string
  products: PickedProduct[]
  categoryIds: number[]
}

type Errors = Partial<Record<"name" | "slug" | "discountValue" | "maxDiscountAmount" | "startsAt" | "endsAt" | "coverage", string>>

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_PERCENT = 90
const ACCENTS = ["#1d4ed8", "#be123c", "#0f766e", "#7c3aed", "#c2410c", "#111827"] as const

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
}

function fromCampaign(campaign: CampaignDetail | null, defaults: { startsAt: string; endsAt: string }): FormState {
  return {
    name: campaign?.name ?? "",
    slug: campaign?.slug ?? "",
    tagline: campaign?.tagline ?? "",
    description: campaign?.description ?? "",
    discountType: campaign?.discountType ?? "PERCENTAGE",
    discountValue: campaign ? String(Number(campaign.discountValue)) : "20",
    maxDiscountAmount: campaign?.maxDiscountAmount ? String(Number(campaign.maxDiscountAmount)) : "",
    startsAt: toDhakaInput(campaign?.startsAt ?? defaults.startsAt),
    endsAt: toDhakaInput(campaign?.endsAt ?? defaults.endsAt),
    isActive: campaign?.isActive ?? false,
    isFeatured: campaign?.isFeatured ?? false,
    bannerUrl: campaign?.bannerUrl ?? null,
    accentColor: campaign?.accentColor ?? DEFAULT_ACCENT,
    products:
      campaign?.products.map((product) => ({
        id: product.id,
        name: product.name,
        thumbnailUrl: product.imageUrl,
        basePrice: product.basePrice,
        price: product.price,
      })) ?? [],
    categoryIds: campaign?.categories.map((category) => category.id) ?? [],
  }
}

function validate(form: FormState): Errors {
  const errors: Errors = {}
  if (form.name.trim().length < 3) errors.name = "Give the sale a name (3+ characters)."
  if (form.slug && !SLUG_PATTERN.test(form.slug)) errors.slug = "Lowercase letters, numbers and single hyphens."
  const value = Number(form.discountValue)
  if (form.discountType === "PERCENTAGE" && !(value >= 1 && value <= MAX_PERCENT)) {
    errors.discountValue = `Enter a percentage from 1 to ${MAX_PERCENT}.`
  }
  if (form.discountType === "FIXED_AMOUNT" && !(value > 0)) errors.discountValue = "Enter how much to take off each item."
  if (form.discountType === "PERCENTAGE" && form.maxDiscountAmount && !(Number(form.maxDiscountAmount) > 0)) {
    errors.maxDiscountAmount = "Enter an amount above 0, or leave it empty."
  }
  const from = fromDhakaInput(form.startsAt)
  const until = fromDhakaInput(form.endsAt)
  if (!from) errors.startsAt = "Pick a start."
  if (!until) errors.endsAt = "Pick an end."
  else if (from && until <= from) errors.endsAt = "The end must be after the start."
  if (form.isActive && form.products.length === 0 && form.categoryIds.length === 0) {
    errors.coverage = "Add products or categories before publishing."
  }
  return errors
}

function toInput(form: FormState): CampaignInput {
  return {
    name: form.name.trim(),
    ...(form.slug && { slug: form.slug }),
    tagline: form.tagline.trim() || null,
    description: form.description.trim() || null,
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    maxDiscountAmount:
      form.discountType === "PERCENTAGE" && form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
    startsAt: fromDhakaInput(form.startsAt) ?? "",
    endsAt: fromDhakaInput(form.endsAt) ?? "",
    isActive: form.isActive,
    isFeatured: form.isFeatured,
    bannerUrl: form.bannerUrl,
    accentColor: form.accentColor,
    productIds: form.products.map((product) => product.id),
    categoryIds: form.categoryIds,
  }
}

/**
 * Same rule as the API — best price wins, never stacked: the campaign comes
 * off the list price, and the shopper pays the lower of that and the
 * product's own sale price. Whole taka, rounded down, never below ৳1.
 */
function previewPrice(product: Pick<PickedProduct, "basePrice" | "price">, form: FormState): { price: number; fromCampaign: boolean } {
  const base = Number(product.basePrice)
  const selling = Number(product.price)
  const value = Number(form.discountValue) || 0
  let discount = form.discountType === "PERCENTAGE" ? (base * value) / 100 : value
  const cap = Number(form.maxDiscountAmount)
  if (form.discountType === "PERCENTAGE" && cap > 0) discount = Math.min(discount, cap)
  const campaign = Math.max(1, Math.floor(base - discount))
  return campaign < selling ? { price: campaign, fromCampaign: true } : { price: selling, fromCampaign: false }
}

function labelOf(form: FormState): string {
  const value = Number(form.discountValue) || 0
  return form.discountType === "PERCENTAGE" ? `${value}% off` : `${formatPrice(value)} off`
}

// ── Pieces ──────────────────────────────────────────────────────────────────

function ProductPicker({
  open,
  onOpenChange,
  selected,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selected: ReadonlySet<number>
  onAdd: (products: PickedProduct[]) => void
}) {
  const [search, setSearch] = React.useState("")
  const [results, setResults] = React.useState<ProductOption[]>([])
  const [picked, setPicked] = React.useState<Map<number, ProductOption>>(new Map())
  const [loading, startLoading] = React.useTransition()

  React.useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => {
      startLoading(async () => {
        const result = await searchCampaignProductsAction(search)
        if ("error" in result) {
          toast.error("Couldn't search products", { description: result.error })
          return
        }
        setResults(result.items)
      })
    }, 250)
    return () => window.clearTimeout(timer)
  }, [open, search])

  const toggle = (product: ProductOption) =>
    setPicked((prev) => {
      const next = new Map(prev)
      if (next.has(product.id)) next.delete(product.id)
      else next.set(product.id, product)
      return next
    })

  const close = (next: boolean) => {
    onOpenChange(next)
    if (!next) {
      setPicked(new Map())
      setSearch("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-border/70 px-6 pt-6 pb-4 text-left">
          <DialogTitle>Add products</DialogTitle>
          <DialogDescription>Search your catalogue and tick the products in this sale.</DialogDescription>
          <div className="relative pt-3">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 mt-1.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or SKU…"
              aria-label="Search products"
              className={cn(INPUT_CLASS, "pl-10")}
            />
          </div>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
          {loading && results.length === 0 ? (
            <p className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Searching…
            </p>
          ) : results.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No products match.</p>
          ) : (
            <ul className="space-y-0.5">
              {results.map((product) => {
                const already = selected.has(product.id)
                const checked = already || picked.has(product.id)
                return (
                  <li key={product.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60",
                        already && "cursor-default opacity-60"
                      )}
                    >
                      <Checkbox checked={checked} disabled={already} onCheckedChange={() => toggle(product)} />
                      <LineThumb url={product.thumbnailUrl} size={40} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium text-foreground">{product.name}</span>
                        <span className="block truncate text-sm text-muted-foreground">
                          {product.categoryName} · {formatPrice(product.price)}
                          {!product.isPublished && " · draft"}
                          {product.stockQuantity === 0 && " · out of stock"}
                        </span>
                      </span>
                      {already && <span className="text-xs font-medium text-muted-foreground">Added</span>}
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border/70 px-6 py-4">
          <span className="text-sm text-muted-foreground">{picked.size} selected</span>
          <div className="flex gap-2">
            <Button variant="outline" className="h-10 rounded-xl" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button
              className="h-10 rounded-xl"
              disabled={picked.size === 0}
              onClick={() => {
                onAdd(
                  [...picked.values()].map((product) => ({
                    id: product.id,
                    name: product.name,
                    thumbnailUrl: product.thumbnailUrl,
                    basePrice: product.basePrice,
                    price: product.price,
                  }))
                )
                close(false)
              }}
            >
              Add {picked.size > 0 ? picked.size : ""} {picked.size === 1 ? "product" : "products"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CategoryChecklist({
  nodes,
  selected,
  onToggle,
  inherited = false,
  depth = 0,
}: {
  nodes: CategoryNode[]
  selected: ReadonlySet<number>
  onToggle: (id: number) => void
  inherited?: boolean
  depth?: number
}) {
  return (
    <ul className={cn("space-y-0.5", depth > 0 && "ml-6 border-l border-border/70 pl-3")}>
      {nodes.map((node) => {
        const own = selected.has(node.id)
        return (
          <li key={node.id}>
            <label className={cn("flex items-center gap-3 rounded-lg px-2 py-1.5 text-[15px] hover:bg-muted/60", inherited ? "cursor-default text-muted-foreground" : "cursor-pointer")}>
              <Checkbox checked={own || inherited} disabled={inherited} onCheckedChange={() => onToggle(node.id)} />
              {node.name}
              {inherited && <span className="text-xs">included</span>}
            </label>
            {node.children.length > 0 && (
              <CategoryChecklist
                nodes={node.children}
                selected={selected}
                onToggle={onToggle}
                inherited={inherited || own}
                depth={depth + 1}
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 items-center rounded-lg border px-3 text-sm font-medium transition-colors",
        active ? "border-foreground bg-foreground text-background" : "border-border/70 bg-background text-foreground hover:border-foreground/40"
      )}
    >
      {children}
    </button>
  )
}

// ── Editor ──────────────────────────────────────────────────────────────────

export function CampaignEditor({
  campaign,
  categories,
  defaults,
  serverNow,
  aside,
}: {
  campaign: CampaignDetail | null
  categories: CategoryNode[]
  /** New campaign's default schedule (ISO), computed on the server. */
  defaults: { startsAt: string; endsAt: string }
  serverNow: number
  aside?: React.ReactNode
}) {
  const router = useRouter()
  const isNew = campaign === null
  const [form, setForm] = React.useState<FormState>(() => fromCampaign(campaign, defaults))
  const [baseline, setBaseline] = React.useState(() => JSON.stringify(fromCampaign(campaign, defaults)))
  const [slugTouched, setSlugTouched] = React.useState(!isNew)
  const [errors, setErrors] = React.useState<Errors>({})
  const [saving, startSave] = React.useTransition()
  const [uploading, startUpload] = React.useTransition()
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const bannerInput = React.useRef<HTMLInputElement>(null)
  const dirty = JSON.stringify(form) !== baseline
  const selectedCategories = React.useMemo(() => new Set(form.categoryIds), [form.categoryIds])
  const selectedProducts = React.useMemo(() => new Set(form.products.map((product) => product.id)), [form.products])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined, ...((key === "products" || key === "categoryIds" || key === "isActive") && { coverage: undefined }) }))
  }

  const save = React.useCallback(
    (overrides: Partial<FormState> = {}) => {
      const next = { ...form, ...overrides }
      const found = validate(next)
      setErrors(found)
      const first = Object.keys(found)[0]
      if (first) {
        toast.warning("Check the highlighted fields", { id: "campaign-invalid", description: Object.values(found)[0] })
        document.getElementById(`campaign-${first}`)?.focus()
        return
      }
      startSave(async () => {
        const input = toInput(next)
        const result = isNew ? await createCampaignAction(input) : await updateCampaignAction(campaign.id, input)
        if ("error" in result) {
          toast.error(isNew ? "Couldn't create campaign" : "Couldn't save campaign", { description: result.error })
          return
        }
        const saved = fromCampaign(result.campaign, defaults)
        setForm(saved)
        setBaseline(JSON.stringify(saved))
        const status = result.campaign.status
        toast.success(isNew ? "Campaign created" : "Changes saved", {
          description:
            status === "LIVE"
              ? `Sale prices are live on ${result.campaign.coveredProductCount} products.`
              : status === "SCHEDULED"
                ? "It goes live automatically when the countdown ends."
                : status === "DRAFT"
                  ? "Saved as a draft — publish when you're ready."
                  : "This campaign has ended.",
        })
        if (isNew) router.replace(`/admin/campaigns/${result.campaign.id}`)
        else router.refresh()
      })
    },
    [campaign, defaults, form, isNew, router]
  )

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault()
        if (!saving) save()
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
  }, [save, dirty, saving])

  const uploadBanner = (file: File) => {
    const problem = checkImage(file, "banner")
    if (problem) {
      toast.error(problem.title, { description: problem.description })
      return
    }
    startUpload(async () => {
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadCampaignBannerAction(formData)
      if ("error" in result) {
        toast.error("Couldn't upload banner", { description: result.error })
        return
      }
      set("bannerUrl", result.url)
    })
  }

  const from = fromDhakaInput(form.startsAt)
  const until = fromDhakaInput(form.endsAt)
  const preview: PublicCampaign = {
    id: campaign?.id ?? 0,
    name: form.name.trim() || "Your sale name",
    slug: form.slug || "preview",
    tagline: form.tagline.trim() || null,
    description: null,
    discountType: form.discountType,
    discountValue: form.discountValue,
    maxDiscountAmount: form.maxDiscountAmount || null,
    label: labelOf(form),
    startsAt: from ?? new Date(serverNow).toISOString(),
    endsAt: until ?? new Date(serverNow + 86_400_000).toISOString(),
    status:
      until && new Date(until).getTime() <= serverNow
        ? "ENDED"
        : from && new Date(from).getTime() > serverNow
          ? "SCHEDULED"
          : "LIVE",
    bannerUrl: form.bannerUrl,
    accentColor: form.accentColor,
  }
  const sample = form.products[0]
  const presets = [
    { label: "24-hour flash", value: hoursAfter(form.startsAt, 24) },
    { label: "3 days", value: endOfDayAfter(form.startsAt, 2) },
    { label: "1 week", value: endOfDayAfter(form.startsAt, 6) },
    { label: "2 weeks", value: endOfDayAfter(form.startsAt, 13) },
  ]
  const errorProps = (key: keyof Errors) => ({
    id: `campaign-${key}`,
    "aria-invalid": !!errors[key] || undefined,
  })

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
          <Link href="/admin/campaigns" aria-label="Back to campaigns">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="mr-auto min-w-0">
          <p className="truncate text-lg font-semibold text-foreground">{isNew ? "New campaign" : campaign.name}</p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            {campaign ? <CampaignStatusBadge status={campaign.status} className="py-0.5" /> : "Not saved yet"}
            {dirty && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-amber-700 dark:text-amber-400">Unsaved changes</span>
              </>
            )}
          </p>
        </div>
        {dirty && !isNew && (
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl"
            disabled={saving}
            onClick={() => {
              setForm(JSON.parse(baseline) as FormState)
              setErrors({})
            }}
          >
            Discard
          </Button>
        )}
        {!form.isActive && (
          <Button type="button" variant="outline" className="h-10 rounded-xl" disabled={saving} onClick={() => save({ isActive: true })}>
            {isNew ? "Create & publish" : "Publish"}
          </Button>
        )}
        <Button type="submit" className="h-10 rounded-xl px-5 font-semibold" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {isNew ? (form.isActive ? "Create campaign" : "Save draft") : "Save changes"}
          <Kbd className="ml-1 hidden bg-primary-foreground/15 text-primary-foreground lg:inline-flex">⌘S</Kbd>
        </Button>
      </div>

      <div className="grid items-start gap-6 *:min-w-0 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="space-y-6">
          <Section title="Basics" description="What shoppers see on the sale page and badges.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="campaign-name" label="Campaign name" error={errors.name} counter={{ value: form.name.length, max: 80 }}>
                <input
                  {...errorProps("name")}
                  value={form.name}
                  maxLength={80}
                  placeholder="Eid Mega Sale"
                  onChange={(event) => {
                    const name = event.target.value
                    setForm((prev) => ({ ...prev, name, ...(!slugTouched && { slug: slugify(name) }) }))
                    setErrors((prev) => ({ ...prev, name: undefined, slug: undefined }))
                  }}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field id="campaign-slug" label="Page link" error={errors.slug} hint={`/campaigns/${form.slug || "…"}`}>
                <AffixInput
                  {...errorProps("slug")}
                  prefix="/campaigns/"
                  value={form.slug}
                  maxLength={80}
                  onChange={(event) => {
                    setSlugTouched(true)
                    set("slug", event.target.value.toLowerCase().replace(/\s+/g, "-"))
                  }}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field id="campaign-tagline" label="Tagline" optional counter={{ value: form.tagline.length, max: 160 }}>
                  <input
                    id="campaign-tagline"
                    value={form.tagline}
                    maxLength={160}
                    placeholder="Up to 40% off fashion, gifts and more"
                    onChange={(event) => set("tagline", event.target.value)}
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field id="campaign-description" label="Details" optional hint="Shown under the banner — terms, delivery notes, anything shoppers should know." counter={{ value: form.description.length, max: 2000 }}>
                  <textarea
                    id="campaign-description"
                    value={form.description}
                    maxLength={2000}
                    rows={3}
                    onChange={(event) => set("description", event.target.value)}
                    className={cn(INPUT_CLASS, "field-sizing-content h-auto min-h-24 py-2.5")}
                  />
                </Field>
              </div>
            </div>
          </Section>

          <Section title="Discount" description="Taken off each item's regular price — never stacked on a product's own sale. Shoppers always get the better of the two.">
            <div role="radiogroup" aria-label="Discount type" className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { key: "PERCENTAGE", label: "Percentage off", hint: "e.g. 20% off every item", icon: Percent },
                  { key: "FIXED_AMOUNT", label: "Amount off", hint: "e.g. ৳500 off every item", icon: Banknote },
                ] as const
              ).map((type) => {
                const active = form.discountType === type.key
                return (
                  <button
                    key={type.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => set("discountType", type.key)}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border p-4 text-left transition-[border-color,box-shadow]",
                      active ? "border-foreground ring-4 ring-foreground/8" : "border-border/70 hover:border-foreground/40"
                    )}
                  >
                    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", active ? "bg-foreground text-background" : "bg-muted text-foreground")}>
                      <type.icon className="size-[18px]" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-medium text-foreground">{type.label}</span>
                      <span className="block text-sm text-muted-foreground">{type.hint}</span>
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field id="campaign-discountValue" label={form.discountType === "PERCENTAGE" ? "Percentage off" : "Amount off each item"} error={errors.discountValue}>
                {form.discountType === "PERCENTAGE" ? (
                  <div className="relative">
                    <input {...errorProps("discountValue")} inputMode="decimal" value={form.discountValue} onChange={(event) => set("discountValue", event.target.value)} className={cn(INPUT_CLASS, "pr-10")} />
                    <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                ) : (
                  <AffixInput {...errorProps("discountValue")} prefix="৳" inputMode="decimal" value={form.discountValue} onChange={(event) => set("discountValue", event.target.value)} />
                )}
              </Field>
              {form.discountType === "PERCENTAGE" && (
                <Field id="campaign-maxDiscountAmount" label="Most off one item" optional error={errors.maxDiscountAmount} hint="Stops expensive items getting a huge discount.">
                  <AffixInput {...errorProps("maxDiscountAmount")} prefix="৳" inputMode="decimal" placeholder="No cap" value={form.maxDiscountAmount} onChange={(event) => set("maxDiscountAmount", event.target.value)} />
                </Field>
              )}
            </div>
          </Section>

          <Section
            title="What's on sale"
            description="Pick whole categories (new products join automatically), individual products, or both."
            action={
              <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={() => setPickerOpen(true)}>
                <Plus className="size-4" />
                Add products
              </Button>
            }
          >
            {errors.coverage && (
              <p id="campaign-coverage" tabIndex={-1} className="mb-4 rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive outline-none">
                {errors.coverage}
              </p>
            )}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Categories <span className="font-normal text-muted-foreground">· {form.categoryIds.length} chosen</span>
                </p>
                <div className="max-h-80 overflow-y-auto rounded-2xl border border-border/70 p-2">
                  <CategoryChecklist
                    nodes={categories}
                    selected={selectedCategories}
                    onToggle={(id) =>
                      set("categoryIds", selectedCategories.has(id) ? form.categoryIds.filter((value) => value !== id) : [...form.categoryIds, id])
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Products <span className="font-normal text-muted-foreground">· {form.products.length} chosen</span>
                </p>
                {form.products.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                  >
                    <Plus className="size-5" />
                    Add individual products
                  </button>
                ) : (
                  <ul className="max-h-80 divide-y divide-border/70 overflow-y-auto rounded-2xl border border-border/70">
                    {form.products.map((product) => {
                      const preview = previewPrice(product, form)
                      return (
                        <li key={product.id} className="flex items-center gap-3 px-3 py-2.5">
                          <LineThumb url={product.thumbnailUrl} size={40} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-foreground">{product.name}</span>
                            <span className="block text-sm tabular-nums">
                              <span className="text-muted-foreground line-through">{formatPrice(product.basePrice)}</span>{" "}
                              <span className="font-semibold text-rose-700 dark:text-rose-400">{formatPrice(preview.price)}</span>
                              {!preview.fromCampaign && (
                                <span className="ml-1.5 text-xs text-muted-foreground">own sale is better — kept</span>
                              )}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => set("products", form.products.filter((item) => item.id !== product.id))}
                            aria-label={`Remove ${product.name}`}
                            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive"
                          >
                            <X className="size-4" />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          </Section>

          <Section title="Schedule" description="Dhaka time. Prices switch on and off automatically, to the second.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="campaign-startsAt" label="Starts" error={errors.startsAt}>
                <input {...errorProps("startsAt")} type="datetime-local" value={form.startsAt} onChange={(event) => set("startsAt", event.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field id="campaign-endsAt" label="Ends" error={errors.endsAt}>
                <input {...errorProps("endsAt")} type="datetime-local" value={form.endsAt} min={form.startsAt || undefined} onChange={(event) => set("endsAt", event.target.value)} className={INPUT_CLASS} />
              </Field>
            </div>
            {form.startsAt && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarRange className="size-4" aria-hidden="true" />
                  Run for
                </span>
                {presets.map((preset) => (
                  <Chip key={preset.label} active={form.endsAt === preset.value} onClick={() => set("endsAt", preset.value)}>
                    {preset.label}
                  </Chip>
                ))}
              </div>
            )}
          </Section>

          <Section title="Look" description="Brand the sale page and homepage feature.">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Banner image <span className="font-normal text-muted-foreground">Optional · wide, 1600×600 works well</span></p>
                <input ref={bannerInput} type="file" accept={IMAGE_ACCEPT} hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadBanner(file); event.target.value = "" }} />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" className="h-10 rounded-xl" disabled={uploading} onClick={() => bannerInput.current?.click()}>
                    {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                    {form.bannerUrl ? "Replace" : "Upload"}
                  </Button>
                  {form.bannerUrl && (
                    <Button type="button" variant="ghost" className="h-10 rounded-xl text-muted-foreground hover:text-destructive" onClick={() => set("bannerUrl", null)}>
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Accent colour</p>
                <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Accent colour">
                  {ACCENTS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      role="radio"
                      aria-checked={form.accentColor === color}
                      aria-label={color}
                      onClick={() => set("accentColor", color)}
                      className={cn("size-9 rounded-full ring-offset-2 ring-offset-card transition-shadow", form.accentColor === color && "ring-2 ring-foreground")}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <label className="relative size-9 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-border" title="Custom colour">
                    <input type="color" value={form.accentColor} onChange={(event) => set("accentColor", event.target.value)} className="absolute inset-0 size-full cursor-pointer opacity-0" aria-label="Custom accent colour" />
                    <span className="flex size-full items-center justify-center text-xs text-muted-foreground">+</span>
                  </label>
                </div>
              </div>
            </div>
          </Section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <Section title="Preview" description="Sale page header, as shoppers see it.">
            <CampaignHero campaign={preview} productCount={0} serverNow={serverNow} compact />
            {sample && (
              <p className="mt-4 rounded-2xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{sample.name}</span>: {formatPrice(sample.basePrice)} →{" "}
                <span className="font-semibold text-rose-700 dark:text-rose-400">{formatPrice(previewPrice(sample, form).price)}</span>
              </p>
            )}
            <div className="mt-5 space-y-3">
              {[
                {
                  key: "isActive" as const,
                  title: form.isActive ? "Published" : "Draft",
                  body: form.isActive ? "Goes live at the start time, off at the end." : "Only staff can see it. Nothing is discounted.",
                },
                {
                  key: "isFeatured" as const,
                  title: "Feature on the homepage",
                  body: "Shows the sale with its countdown while it's live.",
                },
              ].map((toggle) => (
                <label key={toggle.key} className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl bg-muted/50 p-4">
                  <span className="space-y-1">
                    <span className="block font-medium text-foreground">{toggle.title}</span>
                    <span className="block text-sm text-muted-foreground">{toggle.body}</span>
                  </span>
                  <Switch checked={form[toggle.key]} onCheckedChange={(checked) => set(toggle.key, checked)} aria-label={toggle.title} />
                </label>
              ))}
            </div>
          </Section>
          {aside}
        </aside>
      </div>

      <ProductPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selected={selectedProducts}
        onAdd={(products) => set("products", [...form.products, ...products.filter((product) => !selectedProducts.has(product.id))])}
      />
    </form>
  )
}
