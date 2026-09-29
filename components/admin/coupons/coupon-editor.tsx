"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Banknote,
  CalendarRange,
  Info,
  Loader2,
  Percent,
  Shuffle,
  Truck,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import { createCouponAction, updateCouponAction } from "@/actions/coupon.actions"
import { AffixInput, Field, INPUT_CLASS, Section } from "@/components/admin/products/form-primitives"
import { CouponStatusBadge } from "@/components/admin/coupons/coupon-status-badge"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Switch } from "@/components/ui/switch"
import type { Coupon, CouponInput, DiscountType } from "@/lib/backend-coupons"
import { generateCouponCode, offerConditions, offerHeadline } from "@/lib/coupon-format"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { endOfDayAfter, endOfMonth, fromDhakaInput, toDhakaInput } from "@/lib/dhaka-time"

// ── Form state ──────────────────────────────────────────────────────────────

interface FormState {
  code: string
  description: string
  discountType: DiscountType
  discountValue: string
  maxDiscountAmount: string
  minOrderAmount: string
  usageLimit: string
  perCustomerLimit: string
  validFrom: string
  validUntil: string
  isActive: boolean
}

type Errors = Partial<Record<keyof FormState, string>>

export type CouponTemplate = Pick<
  Coupon,
  | "code"
  | "description"
  | "discountType"
  | "discountValue"
  | "maxDiscountAmount"
  | "minOrderAmount"
  | "usageLimit"
  | "perCustomerLimit"
  | "validFrom"
  | "validUntil"
  | "isActive"
>

const amount = (value: string | null) => (value === null ? "" : String(Number(value)))

function fromCoupon(coupon: CouponTemplate): FormState {
  return {
    code: coupon.code,
    description: coupon.description ?? "",
    discountType: coupon.discountType,
    discountValue: coupon.discountType === "FREE_SHIPPING" ? "" : amount(coupon.discountValue),
    maxDiscountAmount: amount(coupon.maxDiscountAmount),
    minOrderAmount: amount(coupon.minOrderAmount),
    usageLimit: coupon.usageLimit === null ? "" : String(coupon.usageLimit),
    perCustomerLimit: coupon.perCustomerLimit === null ? "" : String(coupon.perCustomerLimit),
    validFrom: toDhakaInput(coupon.validFrom),
    validUntil: toDhakaInput(coupon.validUntil),
    isActive: coupon.isActive,
  }
}

const CODE_PATTERN = /^[A-Z0-9_-]+$/
const isWhole = (value: string) => /^\d+$/.test(value)

function validate(form: FormState): Errors {
  const errors: Errors = {}
  const code = form.code.trim()
  if (code.length < 3) errors.code = "Use at least 3 characters."
  else if (code.length > 50) errors.code = "Keep it to 50 characters or fewer."
  else if (!CODE_PATTERN.test(code)) errors.code = "Letters, numbers, hyphens and underscores only."

  const value = Number(form.discountValue)
  if (form.discountType === "PERCENTAGE") {
    if (!form.discountValue || !(value >= 1 && value <= 100)) errors.discountValue = "Enter a percentage from 1 to 100."
  } else if (form.discountType === "FIXED_AMOUNT") {
    if (!form.discountValue || !(value > 0)) errors.discountValue = "Enter how much to take off."
  }
  if (form.discountType === "PERCENTAGE" && form.maxDiscountAmount && !(Number(form.maxDiscountAmount) > 0)) {
    errors.maxDiscountAmount = "Enter an amount above 0, or leave it empty."
  }
  if (form.minOrderAmount && !(Number(form.minOrderAmount) >= 0)) {
    errors.minOrderAmount = "Enter an amount, or leave it empty."
  }
  if (form.usageLimit && !(isWhole(form.usageLimit) && Number(form.usageLimit) > 0)) {
    errors.usageLimit = "Enter a whole number, or leave it empty for no limit."
  }
  if (form.perCustomerLimit && !(isWhole(form.perCustomerLimit) && Number(form.perCustomerLimit) > 0)) {
    errors.perCustomerLimit = "Enter a whole number, or leave it empty for no limit."
  } else if (form.perCustomerLimit && form.usageLimit && Number(form.perCustomerLimit) > Number(form.usageLimit)) {
    errors.perCustomerLimit = "Can't be more than the total uses."
  }

  const from = fromDhakaInput(form.validFrom)
  const until = fromDhakaInput(form.validUntil)
  if (!from) errors.validFrom = "Pick a start date."
  if (!until) errors.validUntil = "Pick an end date."
  else if (from && until <= from) errors.validUntil = "The end must be after the start."
  return errors
}

const numberOrNull = (value: string) => (value.trim() === "" ? null : Number(value))

function toInput(form: FormState): CouponInput {
  return {
    code: form.code.trim().toUpperCase(),
    description: form.description.trim() || null,
    discountType: form.discountType,
    discountValue: form.discountType === "FREE_SHIPPING" ? 0 : Number(form.discountValue),
    maxDiscountAmount: form.discountType === "PERCENTAGE" ? numberOrNull(form.maxDiscountAmount) : null,
    minOrderAmount: numberOrNull(form.minOrderAmount),
    usageLimit: numberOrNull(form.usageLimit),
    perCustomerLimit: numberOrNull(form.perCustomerLimit),
    validFrom: fromDhakaInput(form.validFrom) ?? "",
    validUntil: fromDhakaInput(form.validUntil) ?? "",
    isActive: form.isActive,
  }
}

// ── Pieces ──────────────────────────────────────────────────────────────────

const TYPES: Array<{ key: DiscountType; label: string; hint: string; icon: LucideIcon }> = [
  { key: "PERCENTAGE", label: "Percentage", hint: "e.g. 10% off the items", icon: Percent },
  { key: "FIXED_AMOUNT", label: "Fixed amount", hint: "e.g. ৳500 off the items", icon: Banknote },
  { key: "FREE_SHIPPING", label: "Free delivery", hint: "Waives the delivery fee", icon: Truck },
]

function SuffixInput({ suffix, className, ...props }: React.ComponentProps<"input"> & { suffix: string }) {
  return (
    <div className="relative">
      <input {...props} className={cn(INPUT_CLASS, "pr-10", className)} />
      <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[15px] text-muted-foreground">
        {suffix}
      </span>
    </div>
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
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border/70 bg-background text-foreground hover:border-foreground/40"
      )}
    >
      {children}
    </button>
  )
}

/** What a shopper would see — mirrors the storefront wording. */
function Preview({ form }: { form: FormState }) {
  const input = toInput(form)
  const headline =
    form.discountType !== "FREE_SHIPPING" && !form.discountValue
      ? form.discountType === "PERCENTAGE"
        ? "–% off"
        : "৳– off"
      : offerHeadline(input)
  const conditions = offerConditions(input)
  const from = fromDhakaInput(form.validFrom)
  const until = fromDhakaInput(form.validUntil)

  return (
    <div className="overflow-hidden rounded-2xl bg-foreground text-background shadow-sm">
      <div className="relative px-5 pt-5 pb-4">
        <p className="text-xs font-semibold tracking-[0.14em] text-background/60 uppercase">Coupon</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">{headline}</p>
        {conditions.length > 0 && <p className="mt-1 text-sm text-background/70">{conditions.join(" · ")}</p>}
      </div>
      {/* Perforation */}
      <div className="relative flex items-center" aria-hidden="true">
        <span className="absolute -left-2.5 size-5 rounded-full bg-card" />
        <span className="mx-4 w-full border-t-2 border-dashed border-background/20" />
        <span className="absolute -right-2.5 size-5 rounded-full bg-card" />
      </div>
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-5">
        <span className="rounded-lg border border-dashed border-background/40 px-3 py-1.5 font-mono text-base font-semibold tracking-wider">
          {form.code.trim().toUpperCase() || "YOURCODE"}
        </span>
        <span className="text-right text-xs text-background/60">
          {from && until ? (
            <>
              {formatDate(from)}
              <br />– {formatDate(until)}
            </>
          ) : (
            "Set dates"
          )}
        </span>
      </div>
    </div>
  )
}

// ── Editor ──────────────────────────────────────────────────────────────────

export function CouponEditor({
  coupon,
  template,
  aside,
}: {
  /** The coupon being edited, or null to create one. */
  coupon: Coupon | null
  /** Starting values (a new coupon's defaults, or the one being duplicated). */
  template: CouponTemplate
  /** Extra panels under the preview (e.g. performance). */
  aside?: React.ReactNode
}) {
  const router = useRouter()
  const isNew = coupon === null
  const [form, setForm] = React.useState<FormState>(() => fromCoupon(template))
  const [baseline, setBaseline] = React.useState(() => JSON.stringify(fromCoupon(template)))
  const [errors, setErrors] = React.useState<Errors>({})
  const [saving, startSave] = React.useTransition()
  const dirty = JSON.stringify(form) !== baseline

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const save = React.useCallback(() => {
    const found = validate(form)
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      toast.warning("Check the highlighted fields", { id: "coupon-form-invalid", description: Object.values(found)[0] })
      document.getElementById(`coupon-${first}`)?.focus()
      return
    }
    const input = toInput(form)
    startSave(async () => {
      if (isNew) {
        const result = await createCouponAction(input)
        if ("error" in result) {
          toast.error("Couldn't create coupon", { description: result.error })
          return
        }
        setBaseline(JSON.stringify(form))
        toast.success("Coupon created", {
          description:
            result.coupon.status === "ACTIVE"
              ? `${result.coupon.code} works at checkout now.`
              : result.coupon.status === "SCHEDULED"
                ? `${result.coupon.code} starts ${formatDate(result.coupon.validFrom, true)}.`
                : `${result.coupon.code} is saved but switched off.`,
        })
        router.replace(`/admin/coupons/${result.coupon.id}`)
        return
      }
      const result = await updateCouponAction(coupon.id, input)
      if ("error" in result) {
        toast.error("Couldn't save changes", { description: result.error })
        return
      }
      const saved = fromCoupon(result.coupon)
      setForm(saved)
      setBaseline(JSON.stringify(saved))
      toast.success("Changes saved", { description: `${result.coupon.code} is up to date.` })
      router.refresh()
    })
  }, [coupon, form, isNew, router])

  // ⌘/Ctrl+S saves; leaving with unsaved edits asks first.
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

  const presets: Array<{ label: string; value: string }> = [
    { label: "1 week", value: endOfDayAfter(form.validFrom, 6) },
    { label: "30 days", value: endOfDayAfter(form.validFrom, 29) },
    { label: "3 months", value: endOfDayAfter(form.validFrom, 89) },
    { label: "End of month", value: endOfMonth(form.validFrom) },
  ]
  const errorProps = (key: keyof FormState) => ({
    id: `coupon-${key}`,
    "aria-invalid": !!errors[key] || undefined,
    "aria-describedby": errors[key] ? `coupon-${key}-error` : undefined,
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
          <Link href="/admin/coupons" aria-label="Back to coupons">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="mr-auto min-w-0">
          <p className="truncate font-mono text-lg font-semibold tracking-wide text-foreground">
            {isNew ? <span className="font-sans tracking-normal">New coupon</span> : coupon.code}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            {coupon ? <CouponStatusBadge status={coupon.status} className="py-0.5" /> : "Not saved yet"}
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
        <Button type="submit" className="h-10 rounded-xl px-5 font-semibold" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {isNew ? "Create coupon" : "Save changes"}
          <Kbd className="ml-1 hidden bg-primary-foreground/15 text-primary-foreground lg:inline-flex">⌘S</Kbd>
        </Button>
      </div>

      <div className="grid items-start gap-6 *:min-w-0 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Section title="Code" description="What shoppers type at checkout. It isn't case-sensitive.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="coupon-code" label="Coupon code" error={errors.code} counter={{ value: form.code.length, max: 50 }}>
                <div className="flex gap-2">
                  <input
                    {...errorProps("code")}
                    value={form.code}
                    onChange={(event) => set("code", event.target.value.toUpperCase().replace(/\s+/g, ""))}
                    placeholder="SUMMER25"
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={60}
                    className={cn(INPUT_CLASS, "font-mono tracking-wider uppercase")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 shrink-0 rounded-xl"
                    onClick={() => set("code", generateCouponCode())}
                  >
                    <Shuffle className="size-4" />
                    Generate
                  </Button>
                </div>
              </Field>
              <Field
                id="coupon-description"
                label="Internal note"
                optional
                hint="Only staff see this, e.g. “Eid campaign — Facebook ads”."
                counter={{ value: form.description.length, max: 200 }}
              >
                <input
                  {...errorProps("description")}
                  value={form.description}
                  onChange={(event) => set("description", event.target.value)}
                  placeholder="What's this coupon for?"
                  maxLength={200}
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
          </Section>

          <Section title="Discount" description="What the coupon gives.">
            <div role="radiogroup" aria-label="Discount type" className="grid gap-3 sm:grid-cols-3">
              {TYPES.map((type) => {
                const active = form.discountType === type.key
                return (
                  <button
                    key={type.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      set("discountType", type.key)
                      setErrors((prev) => ({ ...prev, discountValue: undefined, maxDiscountAmount: undefined }))
                    }}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border p-4 text-left transition-[border-color,box-shadow]",
                      active
                        ? "border-foreground ring-4 ring-foreground/8"
                        : "border-border/70 hover:border-foreground/40"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl",
                        active ? "bg-foreground text-background" : "bg-muted text-foreground"
                      )}
                    >
                      <type.icon className="size-[18px]" aria-hidden="true" />
                    </span>
                    <span className="space-y-0.5">
                      <span className="block font-medium text-foreground">{type.label}</span>
                      <span className="block text-sm text-muted-foreground">{type.hint}</span>
                    </span>
                  </button>
                )
              })}
            </div>

            {form.discountType !== "FREE_SHIPPING" ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field
                  id="coupon-discountValue"
                  label={form.discountType === "PERCENTAGE" ? "Percentage off" : "Amount off"}
                  error={errors.discountValue}
                >
                  {form.discountType === "PERCENTAGE" ? (
                    <SuffixInput
                      {...errorProps("discountValue")}
                      suffix="%"
                      inputMode="decimal"
                      value={form.discountValue}
                      onChange={(event) => set("discountValue", event.target.value)}
                      placeholder="10"
                    />
                  ) : (
                    <AffixInput
                      {...errorProps("discountValue")}
                      prefix="৳"
                      inputMode="decimal"
                      value={form.discountValue}
                      onChange={(event) => set("discountValue", event.target.value)}
                      placeholder="500"
                    />
                  )}
                </Field>
                {form.discountType === "PERCENTAGE" && (
                  <Field
                    id="coupon-maxDiscountAmount"
                    label="Maximum discount"
                    optional
                    error={errors.maxDiscountAmount}
                    hint="Caps the saving on big orders."
                  >
                    <AffixInput
                      {...errorProps("maxDiscountAmount")}
                      prefix="৳"
                      inputMode="decimal"
                      value={form.maxDiscountAmount}
                      onChange={(event) => set("maxDiscountAmount", event.target.value)}
                      placeholder="No cap"
                    />
                  </Field>
                )}
              </div>
            ) : (
              <p className="mt-5 flex items-start gap-2 rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
                <Truck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                The delivery fee becomes ৳0 at checkout, inside or outside Dhaka. Item prices don&apos;t change.
              </p>
            )}
            {coupon && coupon.orderCount > 0 && (
              <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Changes apply to new orders only — the {coupon.orderCount} past{" "}
                {coupon.orderCount === 1 ? "order keeps its" : "orders keep their"} discount.
              </p>
            )}
          </Section>

          <Section title="Conditions" description="Who can use it, and how often. Leave a field empty for no limit.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="coupon-minOrderAmount"
                label="Minimum order"
                optional
                error={errors.minOrderAmount}
                hint="Item total before delivery."
              >
                <AffixInput
                  {...errorProps("minOrderAmount")}
                  prefix="৳"
                  inputMode="decimal"
                  value={form.minOrderAmount}
                  onChange={(event) => set("minOrderAmount", event.target.value)}
                  placeholder="Any amount"
                />
              </Field>
              <Field
                id="coupon-usageLimit"
                label="Total uses"
                optional
                error={errors.usageLimit}
                hint={
                  coupon
                    ? `${coupon.usedCount.toLocaleString("en-US")} used so far. Cancelled orders give their use back.`
                    : "Cancelled orders give their use back."
                }
              >
                <input
                  {...errorProps("usageLimit")}
                  inputMode="numeric"
                  value={form.usageLimit}
                  onChange={(event) => set("usageLimit", event.target.value)}
                  placeholder="Unlimited"
                  className={INPUT_CLASS}
                />
              </Field>
              <Field id="coupon-perCustomerLimit" label="Uses per customer" optional error={errors.perCustomerLimit}>
                <div className="space-y-2.5">
                  <input
                    {...errorProps("perCustomerLimit")}
                    inputMode="numeric"
                    value={form.perCustomerLimit}
                    onChange={(event) => set("perCustomerLimit", event.target.value)}
                    placeholder="Unlimited"
                    className={INPUT_CLASS}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Chip active={form.perCustomerLimit === ""} onClick={() => set("perCustomerLimit", "")}>
                      Unlimited
                    </Chip>
                    <Chip active={form.perCustomerLimit === "1"} onClick={() => set("perCustomerLimit", "1")}>
                      Once each
                    </Chip>
                    <Chip active={form.perCustomerLimit === "3"} onClick={() => set("perCustomerLimit", "3")}>
                      3 times each
                    </Chip>
                  </div>
                </div>
              </Field>
            </div>
          </Section>

          <Section title="Schedule" description="Dates and times are in Dhaka time.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="coupon-validFrom" label="Starts" error={errors.validFrom}>
                <input
                  {...errorProps("validFrom")}
                  type="datetime-local"
                  value={form.validFrom}
                  onChange={(event) => set("validFrom", event.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field id="coupon-validUntil" label="Ends" error={errors.validUntil}>
                <input
                  {...errorProps("validUntil")}
                  type="datetime-local"
                  value={form.validUntil}
                  min={form.validFrom || undefined}
                  onChange={(event) => set("validUntil", event.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
            {form.validFrom && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarRange className="size-4" aria-hidden="true" />
                  Run for
                </span>
                {presets.map((preset) => (
                  <Chip
                    key={preset.label}
                    active={form.validUntil === preset.value}
                    onClick={() => set("validUntil", preset.value)}
                  >
                    {preset.label}
                  </Chip>
                ))}
              </div>
            )}
          </Section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <Section title="Preview" description="How the offer reads to shoppers.">
            <Preview form={form} />
            <label className="mt-5 flex cursor-pointer items-start justify-between gap-4 rounded-2xl bg-muted/50 p-4">
              <span className="space-y-1">
                <span className="block font-medium text-foreground">{form.isActive ? "Switched on" : "Switched off"}</span>
                <span className="block text-sm text-muted-foreground">
                  {form.isActive
                    ? "Works at checkout during its dates."
                    : "Saved, but no one can use it until you switch it on."}
                </span>
              </span>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => set("isActive", checked)}
                aria-label="Coupon switched on"
              />
            </label>
          </Section>
          {aside}
        </aside>
      </div>
    </form>
  )
}

