import { redirect } from "next/navigation"
import {
  Banknote,
  CircleAlert,
  ReceiptText,
  ShoppingCart,
  UserPlus,
} from "lucide-react"
import { auth } from "@/auth"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AttentionCard } from "@/components/admin/dashboard/attention-card"
import { KpiCard } from "@/components/admin/dashboard/kpi-card"
import { RecentOrdersTable } from "@/components/admin/dashboard/orders-table"
import { PaymentMixChart } from "@/components/admin/dashboard/payment-mix-chart"
import { RangePicker } from "@/components/admin/dashboard/range-picker"
import { RevenueChart } from "@/components/admin/dashboard/revenue-chart"
import { ReviewInsight } from "@/components/admin/dashboard/review-insight"
import { StatusBreakdown } from "@/components/admin/dashboard/status-breakdown"
import { TopProducts } from "@/components/admin/dashboard/top-products"
import { compactTaka, formatCount } from "@/components/admin/dashboard/format"
import {
  getAdminAnalytics,
  parseRange,
  type AnalyticsDashboard,
} from "@/lib/backend-analytics"
import { formatPrice } from "@/lib/format"

export default async function AdminOverviewPage({
  searchParams,
}: PageProps<"/admin">) {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")

  const range = parseRange((await searchParams).range)
  let data: AnalyticsDashboard | null = null
  try {
    data = await getAdminAnalytics(session.accessToken, range)
  } catch (error: unknown) {
    console.error("[admin] analytics unavailable:", error)
  }

  const firstName = session.user.name?.split(/\s+/)[0] ?? "there"

  return (
    <>
      <AdminPageHeader
        title={`Welcome back, ${firstName}`}
        description={`How the store performed over the last ${range} days.`}
        actions={<RangePicker value={range} />}
      />

      {!data ? (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-3xl bg-destructive/8 px-6 py-5 text-[15px] text-destructive"
        >
          <CircleAlert className="size-5 shrink-0" />
          Analytics are temporarily unavailable. Refresh in a moment.
        </div>
      ) : (
        <div className="space-y-6">
          <section
            aria-label="Key metrics"
            className="grid gap-6 *:min-w-0 sm:grid-cols-2 xl:grid-cols-4"
          >
            <KpiCard
              hero
              label="Revenue"
              metric={data.summary.revenue}
              format={compactTaka}
              icon={Banknote}
              rangeDays={range}
            />
            <KpiCard
              label="Orders"
              metric={data.summary.orders}
              format={formatCount}
              icon={ShoppingCart}
              rangeDays={range}
            />
            <KpiCard
              label="Average order value"
              metric={data.summary.averageOrderValue}
              format={(value) => formatPrice(Math.round(value))}
              icon={ReceiptText}
              rangeDays={range}
            />
            <KpiCard
              label="New customers"
              metric={data.summary.newCustomers}
              format={formatCount}
              icon={UserPlus}
              rangeDays={range}
            />
          </section>

          <section className="grid gap-6 *:min-w-0 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <RevenueChart daily={data.daily} />
            <PaymentMixChart mix={data.paymentMix} />
          </section>

          <section className="grid gap-6 *:min-w-0 lg:grid-cols-2 xl:grid-cols-3">
            <StatusBreakdown statuses={data.ordersByStatus} />
            <ReviewInsight reviews={data.reviews} />
            <AttentionCard
              operations={data.operations}
              lowStock={data.lowStock}
            />
          </section>

          <section className="grid gap-6 *:min-w-0 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <RecentOrdersTable orders={data.recentOrders} />
            <TopProducts products={data.topProducts} />
          </section>
        </div>
      )}
    </>
  )
}
