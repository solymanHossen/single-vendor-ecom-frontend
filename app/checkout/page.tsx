import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { fetchMe } from "@/lib/backend-auth"
import { getAddresses, getQuote } from "@/lib/backend-commerce"

export default async function CheckoutPage() {
  const session = await auth()
  if (!session?.accessToken) redirect(`/login?callbackUrl=${encodeURIComponent("/checkout")}`)

  const [addresses, profile] = await Promise.all([
    getAddresses(session.accessToken),
    fetchMe(session.accessToken),
  ])
  const quote = await getQuote(session.accessToken, { addressId: addresses[0]?.id })

  return (
    <>
      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Checkout
      </h1>
      <CheckoutForm
        addresses={addresses}
        initialQuote={quote}
        contact={{ name: profile?.name ?? session.user.name ?? null, phone: profile?.phone ?? null }}
      />
    </>
  )
}
