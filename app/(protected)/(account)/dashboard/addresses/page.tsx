import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AddressBook } from "@/components/account/address-book"
import { fetchMe } from "@/lib/backend-auth"
import { getAddresses } from "@/lib/backend-commerce"

export const metadata: Metadata = { title: "Addresses" }

export default async function AddressesPage() {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")

  const [addresses, profile] = await Promise.all([
    getAddresses(session.accessToken),
    fetchMe(session.accessToken),
  ])

  return (
    <AddressBook
      initial={addresses}
      contact={{ name: profile?.name ?? null, phone: profile?.phone ?? null }}
    />
  )
}
