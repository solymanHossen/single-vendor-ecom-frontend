import Link from "next/link"
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { getNavigation } from "@/lib/backend-storefront"
import { getStoreSettings, type StoreSettings } from "@/lib/backend-settings"
import { categoryHref, collectionHref, PRODUCTS_PATH } from "@/lib/routes"

const SUPPORT_LINKS = [
  { label: "Track order", href: "/track-order" },
  { label: "Warranty", href: "/warranty" },
  { label: "Returns & exchanges", href: "/returns" },
  { label: "Contact support", href: "/contact" },
] as const

const COMPANY_LINKS = [
  { label: "About us", href: "/about" },
  { label: "Store locations", href: "/stores" },
  { label: "Terms of service", href: "/terms" },
  { label: "Privacy policy", href: "/privacy" },
] as const

/** Only the profiles the admin filled in (Admin → Settings → Social). */
function socialLinks(settings: StoreSettings) {
  return [
    { label: "Facebook", href: settings.facebookUrl, short: "FB" },
    { label: "Instagram", href: settings.instagramUrl, short: "IG" },
    { label: "YouTube", href: settings.youtubeUrl, short: "YT" },
    { label: "TikTok", href: settings.tiktokUrl, short: "TT" },
  ].filter(
    (link): link is { label: string; href: string; short: string } =>
      !!link.href
  )
}

/** What checkout actually accepts today (online gateways aren't live yet). */
const PAYMENT_METHODS = ["Cash on delivery"] as const

function ContactList({ settings }: { settings: StoreSettings }) {
  const whatsapp = settings.whatsappNumber?.replace(/[^\d]/g, "")
  const items = [
    settings.supportPhone && {
      icon: Phone,
      label: settings.supportPhone,
      href: `tel:${settings.supportPhone.replace(/[\s-]/g, "")}`,
    },
    whatsapp && {
      icon: MessageCircle,
      label: "Chat on WhatsApp",
      href: `https://wa.me/${whatsapp}`,
    },
    settings.supportEmail && {
      icon: Mail,
      label: settings.supportEmail,
      href: `mailto:${settings.supportEmail}`,
    },
    settings.storeAddress && { icon: MapPin, label: settings.storeAddress },
    settings.businessHours && { icon: Clock, label: settings.businessHours },
  ].filter(Boolean) as Array<{
    icon: typeof Phone
    label: string
    href?: string
  }>

  if (items.length === 0) return null
  return (
    <ul className="space-y-2.5 text-[15px]">
      {items.map(({ icon: Icon, label, href }) => (
        <li
          key={label}
          className="flex items-start gap-2.5 text-muted-foreground"
        >
          <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {href ? (
            <a
              href={href}
              {...(href.startsWith("http") && {
                target: "_blank",
                rel: "noreferrer",
              })}
              className="transition-colors hover:text-foreground"
            >
              {label}
            </a>
          ) : (
            <span>{label}</span>
          )}
        </li>
      ))}
    </ul>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: ReadonlyArray<{ label: string; href: string }>
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="text-[15px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Site footer (server component). Shop columns come from the live category
 * tree and collections — the same cached payload the header uses, so this
 * costs no extra request.
 */
export async function Footer() {
  const [navigation, settings] = await Promise.all([
    getNavigation(),
    getStoreSettings(),
  ])
  const socials = socialLinks(settings)
  const departments = navigation.categories.slice(0, 2)

  return (
    <footer className="w-full border-t border-border/70 bg-muted/30">
      <div className="page-container py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(4,1fr)] lg:gap-10">
          <div className="space-y-5">
            <Link
              href="/"
              className="inline-flex items-center gap-3 focus:outline-none"
            >
              <Logo size="md" />
              <span className="text-xl font-semibold tracking-tight text-foreground">
                {settings.storeName}
              </span>
            </Link>
            <p className="max-w-sm text-[15px] leading-relaxed text-muted-foreground">
              {settings.tagline} — delivered across Bangladesh with cash on
              delivery and 7-day easy returns.
            </p>
            <ContactList settings={settings} />
            <p className="inline-flex items-center gap-2 rounded-full bg-background px-3.5 py-1.5 text-sm font-medium text-foreground shadow-xs">
              <ShieldCheck className="size-4 text-primary" />
              100% authentic products
            </p>
            {socials.length > 0 && (
              <ul className="flex items-center gap-2 pt-1">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.label}
                      className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold text-foreground transition-colors hover:border-foreground/40"
                    >
                      {social.short}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {departments.map((department) => (
            <FooterColumn
              key={department.id}
              title={department.name}
              links={[
                ...department.children.slice(0, 5).map((child) => ({
                  label: child.name,
                  href: categoryHref(child.slug),
                })),
                {
                  label: `All ${department.name}`,
                  href: categoryHref(department.slug),
                },
              ]}
            />
          ))}

          <FooterColumn
            title="Shop"
            links={[
              ...navigation.collections.map((collection) => ({
                label: collection.title,
                href: collectionHref(collection.key),
              })),
              { label: "All products", href: PRODUCTS_PATH },
            ]}
          />

          <div className="grid grid-cols-2 gap-10 lg:grid-cols-1">
            <FooterColumn title="Customer care" links={SUPPORT_LINKS} />
            <FooterColumn title="Company" links={COMPANY_LINKS} />
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-border/70 pt-8 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.storeName}. All rights
            reserved.
          </p>
          <ul
            className="flex flex-wrap items-center gap-2"
            aria-label="Accepted payment methods"
          >
            {PAYMENT_METHODS.map((method) => (
              <li
                key={method}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
              >
                {method}
              </li>
            ))}
          </ul>
          <p>Prices in BDT (৳) · English</p>
        </div>
      </div>
    </footer>
  )
}
