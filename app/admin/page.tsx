import Link from "next/link"
import {
  ArrowRight,
  Images,
  Layers,
  Package,
  ShoppingBag,
  Sparkles,
  Store,
  TicketPercent,
  type LucideIcon,
} from "lucide-react"
import { auth } from "@/auth"
import { hasRole, SUPER_ADMIN_ROLES } from "@/auth.config"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { getAllHeroBannersAdmin, type HeroBanner } from "@/lib/backend-hero"
import { getNavigation } from "@/lib/backend-storefront"
import { formatPrice, timeUntil } from "@/lib/format"

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint: string
  icon: LucideIcon
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background p-6">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-medium text-muted-foreground">{label}</p>
        <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
    </div>
  )
}

function ActionCard({
  href,
  title,
  description,
  icon: Icon,
  primary = false,
}: {
  href: string
  title: string
  description: string
  icon: LucideIcon
  primary?: boolean
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-5 rounded-3xl border border-border/70 bg-background p-6 transition-colors duration-150 hover:border-foreground/25"
    >
      <span
        className={
          primary
            ? "flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
            : "flex size-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground"
        }
      >
        <Icon className="size-6" />
      </span>
      <span className="min-w-0 flex-1 space-y-1">
        <span className="block text-lg font-semibold text-foreground">
          {title}
        </span>
        <span className="block text-[15px] text-muted-foreground">
          {description}
        </span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
    </Link>
  )
}

export default async function AdminOverviewPage() {
  const session = await auth()
  const isSuperAdmin = hasRole(session?.user?.role, SUPER_ADMIN_ROLES)

  const [navigation, banners] = await Promise.all([
    getNavigation(),
    isSuperAdmin && session?.accessToken
      ? getAllHeroBannersAdmin(session.accessToken).catch(
          (): HeroBanner[] => []
        )
      : Promise.resolve<HeroBanner[] | null>(null),
  ])

  const totalProducts = navigation.categories.reduce(
    (sum, category) => sum + category.productCount,
    0
  )
  const subcategoryCount = navigation.categories.reduce(
    (sum, category) => sum + category.children.length,
    0
  )
  const firstName = session?.user?.name?.split(/\s+/)[0] ?? "there"
  const promotion = navigation.promotion
  const activeBanners = banners?.filter((banner) => banner.isActive).length ?? 0

  return (
    <>
      <AdminPageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's what's live on the AURA storefront right now."
      />

      <section
        aria-label="Store at a glance"
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Live products"
          value={String(totalProducts)}
          hint="Published and visible to shoppers"
          icon={Package}
        />
        <StatCard
          label="Departments"
          value={String(navigation.categories.length)}
          hint={`${subcategoryCount} sub-categories`}
          icon={Layers}
        />
        <StatCard
          label="Collections"
          value={String(navigation.collections.length)}
          hint="Curated, updated automatically"
          icon={Sparkles}
        />
        <StatCard
          label="Active offer"
          value={promotion?.code ?? "None"}
          hint={
            promotion
              ? `${
                  promotion.discountType === "PERCENTAGE"
                    ? `${Number.parseFloat(promotion.discountValue)}% off`
                    : `${formatPrice(promotion.discountValue)} off`
                } · ends in ${timeUntil(promotion.validUntil)}`
              : "No coupon is currently running"
          }
          icon={TicketPercent}
        />
      </section>

      <section aria-labelledby="actions-heading" className="mt-14 space-y-5">
        <h2
          id="actions-heading"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          Quick actions
        </h2>
        <div className="grid gap-5 lg:grid-cols-2">
          {banners !== null && (
            <ActionCard
              href="/admin/hero-banners"
              title="Hero banners"
              description={`${activeBanners} of ${banners.length} banners live on the homepage`}
              icon={Images}
              primary
            />
          )}
          <ActionCard
            href="/"
            title="View storefront"
            description="See the homepage exactly as shoppers do"
            icon={Store}
          />
          <ActionCard
            href="/products"
            title="Browse catalog"
            description="Check listings, filters and product pages"
            icon={ShoppingBag}
          />
        </div>
      </section>
    </>
  )
}
