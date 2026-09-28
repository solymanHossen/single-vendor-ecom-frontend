import type { Metadata } from "next"
import { AccessDenied } from "@/components/admin/access-denied"
import { CouponEditor, type CouponTemplate } from "@/components/admin/coupons/coupon-editor"
import { getAdminAccess } from "@/lib/admin-access"
import { getCoupon } from "@/lib/backend-coupons"

export const metadata: Metadata = { title: "New coupon · Admin" }

const DAY = 86_400_000

/** Starts now (to the minute), runs 30 days to close of day in Dhaka. */
function freshTemplate(now: number): CouponTemplate {
  const start = new Date(Math.floor(now / 60_000) * 60_000)
  const dhakaEnd = new Date(now + 6 * 3_600_000 + 29 * DAY).toISOString().slice(0, 10)
  return {
    code: "",
    description: null,
    discountType: "PERCENTAGE",
    discountValue: "10",
    maxDiscountAmount: null,
    minOrderAmount: null,
    usageLimit: null,
    perCustomerLimit: null,
    validFrom: start.toISOString(),
    validUntil: new Date(`${dhakaEnd}T23:59:00+06:00`).toISOString(),
    isActive: true,
  }
}

export default async function NewCouponPage({ searchParams }: PageProps<"/admin/coupons/new">) {
  const access = await getAdminAccess()
  if (!access.can("coupons.manage")) return <AccessDenied area="coupons" />

  // eslint-disable-next-line react-hooks/purity -- request-time default dates
  const now = Date.now()
  let template = freshTemplate(now)

  // ?from=<id> duplicates a coupon: same offer, new code, same length of run from today.
  const from = Number((await searchParams).from)
  if (Number.isInteger(from) && from > 0) {
    const source = await getCoupon(access.accessToken, from)
    if (source) {
      const length = new Date(source.validUntil).getTime() - new Date(source.validFrom).getTime()
      template = {
        ...source,
        code: `${source.code}-COPY`.slice(0, 50),
        validFrom: template.validFrom,
        validUntil: new Date(new Date(template.validFrom).getTime() + Math.max(length, DAY)).toISOString(),
        isActive: true,
      }
    }
  }

  return <CouponEditor coupon={null} template={template} />
}
