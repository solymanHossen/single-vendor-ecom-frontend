"use client"

import * as React from "react"
import Image from "next/image"
import {
  AtSign,
  Globe,
  ImagePlus,
  Loader2,
  Megaphone,
  Palette,
  Phone,
  Search,
  Share2,
  Trash2,
  Truck,
  UserPlus,
  Zap,
  type LucideIcon,
  Boxes,
} from "lucide-react"
import { toast } from "sonner"
import { updateSettingsAction, uploadBrandingImageAction } from "@/actions/settings.actions"
import type { StoreSettings, StoreSettingsPatch } from "@/lib/backend-settings"
import { formatPrice } from "@/lib/format"
import { isOptimizableImage } from "@/lib/images"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Switch } from "@/components/ui/switch"
import {
  AffixInput,
  Field,
  INPUT_CLASS,
  Section,
} from "@/components/admin/products/form-primitives"
import { checkImage, IMAGE_ACCEPT } from "@/lib/upload-rules"

// ── Model ───────────────────────────────────────────────────────────────────

/** Every field as the inputs hold it: text for text, numbers as strings. */
type FormState = {
  [K in keyof StoreSettings]: StoreSettings[K] extends boolean ? boolean : string
}

const NUMBER_KEYS = [
  "shippingFeeInsideDhaka",
  "shippingFeeOutsideDhaka",
  "freeShippingThreshold",
  "lowStockThreshold",
] as const satisfies ReadonlyArray<keyof StoreSettings>

function toForm(settings: StoreSettings): FormState {
  return Object.fromEntries(
    Object.entries(settings).map(([key, value]) => [
      key,
      typeof value === "boolean" ? value : value === null ? "" : String(value),
    ])
  ) as FormState
}

/** Only what changed, converted back to API types ("" clears a field). */
function diff(form: FormState, base: FormState): StoreSettingsPatch {
  const patch: Record<string, unknown> = {}
  for (const key of Object.keys(form) as Array<keyof FormState>) {
    if (form[key] === base[key]) continue
    const value = form[key]
    patch[key] =
      typeof value === "boolean"
        ? value
        : (NUMBER_KEYS as readonly string[]).includes(key)
          ? Number(value)
          : value.trim()
  }
  return patch as StoreSettingsPatch
}

type Errors = Partial<Record<keyof FormState, string>>

const URL_PATTERN = /^https?:\/\/\S+\.\S+/i

function validate(form: FormState): Errors {
  const errors: Errors = {}
  if (!form.storeName.trim()) errors.storeName = "Your store needs a name"
  if (form.supportEmail && !/^\S+@\S+\.\S+$/.test(form.supportEmail))
    errors.supportEmail = "Enter a valid email address"
  for (const key of ["supportPhone", "whatsappNumber"] as const) {
    if (form[key] && !/^\+?[\d\s-]{5,20}$/.test(form[key]))
      errors[key] = "Use digits, spaces or dashes, e.g. +880 1712-345678"
  }
  for (const key of ["facebookUrl", "instagramUrl", "youtubeUrl", "tiktokUrl"] as const) {
    if (form[key] && !URL_PATTERN.test(form[key]))
      errors[key] = "Paste the full link, starting with https://"
  }
  for (const key of NUMBER_KEYS) {
    const value = Number(form[key])
    if (form[key] === "" || !Number.isInteger(value) || value < 0)
      errors[key] = "Use a whole amount, 0 or more"
  }
  return errors
}

// ── Navigation ──────────────────────────────────────────────────────────────

const SECTIONS: ReadonlyArray<{ id: string; label: string; icon: LucideIcon }> = [
  { id: "branding", label: "Branding", icon: Palette },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "social", label: "Social links", icon: Share2 },
  { id: "shipping", label: "Delivery", icon: Truck },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "announcement", label: "Announcement bar", icon: Megaphone },
  { id: "seo", label: "Search & sharing", icon: Search },
  { id: "accounts", label: "Customer accounts", icon: UserPlus },
]

function useActiveSection(): string {
  const [active, setActive] = React.useState(SECTIONS[0]!.id)
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: "-20% 0px -65% 0px" }
    )
    for (const section of SECTIONS) {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [])
  return active
}

// ── Pieces ──────────────────────────────────────────────────────────────────

function ImageUpload({
  label,
  hint,
  value,
  onChange,
  variant,
}: {
  label: string
  hint: string
  value: string
  onChange: (url: string) => void
  variant: "logo" | "icon"
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, startUpload] = React.useTransition()

  const upload = (file: File) => {
    const problem = checkImage(file, "logo")
    if (problem) {
      toast.error(problem.title, { description: problem.description })
      return
    }
    startUpload(async () => {
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadBrandingImageAction(formData)
      if ("error" in result) {
        toast.error("Upload failed", { description: result.error })
        return
      }
      onChange(result.url)
      toast.success(`${label} uploaded`, { description: "Save your changes to publish it." })
    })
  }

  const box = variant === "logo" ? "size-24" : "size-14"
  const preview = (tone: "light" | "dark") => (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl border",
        box,
        tone === "light" ? "border-border bg-white" : "border-neutral-800 bg-neutral-900"
      )}
      aria-label={`${label} on a ${tone} background`}
    >
      {value ? (
        <Image
          src={value}
          alt=""
          width={variant === "logo" ? 72 : 36}
          height={variant === "logo" ? 72 : 36}
          unoptimized={!isOptimizableImage(value)}
          className="object-contain"
        />
      ) : (
        <ImagePlus
          className={cn("size-6", tone === "light" ? "text-neutral-400" : "text-neutral-500")}
          aria-hidden="true"
        />
      )}
    </div>
  )

  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="flex gap-3">
        {preview("light")}
        {preview("dark")}
      </div>
      <div className="min-w-0 space-y-2.5">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">{hint}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-lg"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            {value ? "Replace" : "Upload"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              className="h-9 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={uploading}
              onClick={() => onChange("")}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ""
          if (file) upload(file)
        }}
      />
    </div>
  )
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-6 rounded-2xl bg-muted/50 p-4">
      <span className="space-y-1">
        <span className="block font-medium text-foreground">{title}</span>
        <span className="block text-sm text-muted-foreground">{description}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={title} />
    </label>
  )
}

// ── Form ────────────────────────────────────────────────────────────────────

export function SettingsForm({ initial }: { initial: StoreSettings }) {
  const [base, setBase] = React.useState(() => toForm(initial))
  const [form, setForm] = React.useState(base)
  const [errors, setErrors] = React.useState<Errors>({})
  const [saving, startSave] = React.useTransition()
  const active = useActiveSection()

  const patch = diff(form, base)
  const changes = Object.keys(patch).length
  const dirty = changes > 0

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }
  const text = (key: keyof FormState) => ({
    id: key,
    value: form[key] as string,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(key, event.target.value as never),
    "aria-invalid": !!errors[key],
  })

  const save = React.useCallback(() => {
    if (!dirty || saving) return
    const found = validate(form)
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      toast.warning("Check the highlighted fields", { description: Object.values(found)[0] })
      document.getElementById(first)?.focus()
      return
    }
    startSave(async () => {
      const result = await updateSettingsAction(diff(form, base))
      if ("error" in result) {
        toast.error("Couldn't save settings", { description: result.error })
        return
      }
      const saved = toForm(result.settings)
      setBase(saved)
      setForm(saved)
      toast.success("Settings saved", { description: "The storefront is updated." })
    })
  }, [dirty, saving, form, base])

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault()
        save()
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
  }, [save, dirty])

  const inside = Number(form.shippingFeeInsideDhaka) || 0
  const outside = Number(form.shippingFeeOutsideDhaka) || 0
  const threshold = Number(form.freeShippingThreshold) || 0

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        save()
      }}
      className="space-y-6"
    >
      <div className="sticky top-3 z-20 -mx-1 flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card/90 px-5 py-3 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-card/75">
        <div className="mr-auto min-w-0">
          <h1 className="text-xl font-semibold text-foreground">Store settings</h1>
          <p className="text-sm text-muted-foreground">
            {dirty ? (
              <span className="font-medium text-amber-700 dark:text-amber-400">
                {changes} unsaved {changes === 1 ? "change" : "changes"}
              </span>
            ) : (
              "Brand, contact, delivery and storefront preferences"
            )}
          </p>
        </div>
        {dirty && (
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl"
            disabled={saving}
            onClick={() => {
              setForm(base)
              setErrors({})
            }}
          >
            Discard
          </Button>
        )}
        <Button type="submit" className="h-10 rounded-xl px-5 font-semibold" disabled={!dirty || saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          Save changes
          <Kbd className="ml-1 hidden bg-primary-foreground/15 text-primary-foreground lg:inline-flex">⌘S</Kbd>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="hidden lg:block">
          <ul className="sticky top-28 space-y-1">
            {SECTIONS.map((section) => {
              const Icon = section.icon
              const current = active === section.id
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={current ? "location" : undefined}
                    className={cn(
                      "flex h-10 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors",
                      current
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {section.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="min-w-0 space-y-6 [&>section]:scroll-mt-28">
          <Section id="branding" title="Branding" description="How your store looks everywhere — header, footer, emails and browser tabs.">
            <div className="space-y-7">
              <ImageUpload
                label="Logo"
                hint="Shown 40px tall in the header, up to 160px wide — a wide wordmark (e.g. 640×160) or a square emblem both fit. Transparent PNG or WebP works best. Max 2 MB."
                value={form.logoUrl}
                onChange={(url) => set("logoUrl", url)}
                variant="logo"
              />
              <ImageUpload
                label="Browser icon"
                hint="Shown in the browser tab. Falls back to the logo when empty."
                value={form.faviconUrl}
                onChange={(url) => set("faviconUrl", url)}
                variant="icon"
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="storeName" label="Store name" error={errors.storeName} counter={{ value: form.storeName.length, max: 60 }}>
                  <input {...text("storeName")} maxLength={60} className={INPUT_CLASS} />
                </Field>
                <Field id="tagline" label="Tagline" optional counter={{ value: form.tagline.length, max: 120 }}>
                  <input {...text("tagline")} maxLength={120} placeholder="Next-gen tech & streetwear" className={INPUT_CLASS} />
                </Field>
              </div>
            </div>
          </Section>

          <Section id="contact" title="Contact" description="Shown in the footer so customers can reach you.">
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="supportEmail" label="Support email" optional error={errors.supportEmail}>
                  <input {...text("supportEmail")} type="email" placeholder="support@yourstore.com" className={INPUT_CLASS} />
                </Field>
                <Field id="supportPhone" label="Support phone" optional error={errors.supportPhone}>
                  <input {...text("supportPhone")} type="tel" placeholder="+880 9610 123456" className={cn(INPUT_CLASS, "tabular-nums")} />
                </Field>
                <Field id="whatsappNumber" label="WhatsApp number" optional error={errors.whatsappNumber} hint="Adds a “Chat on WhatsApp” link.">
                  <input {...text("whatsappNumber")} type="tel" placeholder="+8801712345678" className={cn(INPUT_CLASS, "tabular-nums")} />
                </Field>
                <Field id="businessHours" label="Business hours" optional>
                  <input {...text("businessHours")} maxLength={120} placeholder="Sat–Thu, 10am–8pm" className={INPUT_CLASS} />
                </Field>
              </div>
              <Field id="storeAddress" label="Store or office address" optional counter={{ value: form.storeAddress.length, max: 300 }}>
                <textarea {...text("storeAddress")} rows={2} maxLength={300} placeholder="House 12, Road 5, Dhanmondi, Dhaka 1205" className={cn(INPUT_CLASS, "h-auto resize-y py-3")} />
              </Field>
            </div>
          </Section>

          <Section id="social" title="Social links" description="Only the profiles you fill in appear in the footer.">
            <div className="grid gap-5 sm:grid-cols-2">
              {(
                [
                  ["facebookUrl", "Facebook", "https://facebook.com/yourstore"],
                  ["instagramUrl", "Instagram", "https://instagram.com/yourstore"],
                  ["youtubeUrl", "YouTube", "https://youtube.com/@yourstore"],
                  ["tiktokUrl", "TikTok", "https://tiktok.com/@yourstore"],
                ] as const
              ).map(([key, label, placeholder]) => (
                <Field key={key} id={key} label={label} optional error={errors[key]}>
                  <div className="relative">
                    <AtSign className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <input {...text(key)} type="url" placeholder={placeholder} className={cn(INPUT_CLASS, "pl-10")} />
                  </div>
                </Field>
              ))}
            </div>
          </Section>

          <Section id="shipping" title="Delivery" description="Charged at checkout. Applies to new orders immediately.">
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-3">
                <Field id="shippingFeeInsideDhaka" label="Inside Dhaka" error={errors.shippingFeeInsideDhaka}>
                  <AffixInput {...text("shippingFeeInsideDhaka")} prefix="৳" inputMode="numeric" className="tabular-nums" />
                </Field>
                <Field id="shippingFeeOutsideDhaka" label="Outside Dhaka" error={errors.shippingFeeOutsideDhaka}>
                  <AffixInput {...text("shippingFeeOutsideDhaka")} prefix="৳" inputMode="numeric" className="tabular-nums" />
                </Field>
                <Field id="freeShippingThreshold" label="Free delivery from" error={errors.freeShippingThreshold} hint="0 turns free delivery off.">
                  <AffixInput {...text("freeShippingThreshold")} prefix="৳" inputMode="numeric" className="tabular-nums" />
                </Field>
              </div>
              <p className="flex items-start gap-2.5 rounded-2xl bg-muted/60 px-4 py-3.5 text-[15px] text-muted-foreground">
                <Truck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  Customers pay{" "}
                  <span className="font-medium text-foreground">{inside === 0 ? "nothing" : formatPrice(inside)}</span>{" "}
                  inside Dhaka and{" "}
                  <span className="font-medium text-foreground">{outside === 0 ? "nothing" : formatPrice(outside)}</span>{" "}
                  elsewhere
                  {threshold > 0 ? (
                    <>
                      , and delivery is free on orders of{" "}
                      <span className="font-medium text-foreground">{formatPrice(threshold)}</span> or more.
                    </>
                  ) : (
                    ", whatever the order size."
                  )}
                </span>
              </p>
            </div>
          </Section>

          <Section id="inventory" title="Inventory" description="When an item counts as running low — for alerts, the inventory page and the “only a few left” label shoppers see.">
            <div className="grid gap-5 sm:grid-cols-3">
              <Field
                id="lowStockThreshold"
                label="Low stock at"
                error={errors.lowStockThreshold}
                hint="Units or fewer. Products can set their own."
              >
                <input {...text("lowStockThreshold")} inputMode="numeric" className={cn(INPUT_CLASS, "tabular-nums")} />
              </Field>
            </div>
            <p className="mt-5 flex items-start gap-2.5 rounded-2xl bg-muted/60 px-4 py-3.5 text-[15px] text-muted-foreground">
              <Boxes className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                Staff who manage the catalogue get a daily email at 9 am when anything is low or out of stock, and
                shoppers can ask to be told when a sold-out item is back.
              </span>
            </p>
          </Section>

          <Section id="announcement" title="Announcement bar" description="The thin strip above the header on every storefront page.">
            <div className="space-y-5">
              <ToggleRow
                title="Show the announcement bar"
                description="Turn it off for a cleaner header."
                checked={form.announcementEnabled}
                onChange={(checked) => set("announcementEnabled", checked)}
              />
              <ToggleRow
                title="Feature running coupon campaigns"
                description="While a coupon campaign is live, show its code and countdown instead of your message."
                checked={form.announcementPromotion}
                onChange={(checked) => set("announcementPromotion", checked)}
              />
              <Field id="announcementMessage" label="Message" counter={{ value: form.announcementMessage.length, max: 200 }}>
                <input {...text("announcementMessage")} maxLength={200} className={INPUT_CLASS} />
              </Field>
              <div className={cn("space-y-2", !form.announcementEnabled && "opacity-50")}>
                <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">Preview</p>
                <div className="flex items-center gap-2 overflow-hidden rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-foreground/15 px-2 py-0.5 font-semibold">
                    <Zap className="size-3" aria-hidden="true" />
                    {form.storeName || "Store"} Promise
                  </span>
                  <span className="truncate">{form.announcementMessage || "Your message"}</span>
                </div>
              </div>
            </div>
          </Section>

          <Section id="seo" title="Search & sharing" description="The title and summary search engines and social apps show for your homepage.">
            <div className="space-y-5">
              <Field id="metaTitle" label="Homepage title" optional counter={{ value: form.metaTitle.length, max: 70 }} hint="Leave empty to use “Store name — Tagline”.">
                <input {...text("metaTitle")} maxLength={70} placeholder={`${form.storeName} — ${form.tagline}`} className={INPUT_CLASS} />
              </Field>
              <Field id="metaDescription" label="Description" optional counter={{ value: form.metaDescription.length, max: 160 }}>
                <textarea {...text("metaDescription")} rows={3} maxLength={160} placeholder="A one-sentence pitch for your store." className={cn(INPUT_CLASS, "h-auto resize-y py-3")} />
              </Field>
              <div className="rounded-2xl border border-border/70 bg-background p-5">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  <Globe className="size-3.5" aria-hidden="true" />
                  Search result preview
                </p>
                <p className="line-clamp-1 text-lg text-[#1a0dab] dark:text-[#8ab4f8]">
                  {form.metaTitle || `${form.storeName} — ${form.tagline}`}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {form.metaDescription ||
                    `Shop ${form.storeName}: ${form.tagline}. Cash on delivery across Bangladesh.`}
                </p>
              </div>
            </div>
          </Section>

          <Section id="accounts" title="Customer accounts" description="Who can sign up and how.">
            <div className="space-y-3">
              <ToggleRow
                title="Allow new sign-ups"
                description="Turn off to stop new customer accounts. Existing customers can still sign in."
                checked={form.allowRegistration}
                onChange={(checked) => set("allowRegistration", checked)}
              />
              <ToggleRow
                title="Sign in with Google"
                description="Let customers use their Google account instead of a password."
                checked={form.enableGoogleLogin}
                onChange={(checked) => set("enableGoogleLogin", checked)}
              />
            </div>
          </Section>
        </div>
      </div>
    </form>
  )
}
