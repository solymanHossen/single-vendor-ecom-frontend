import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { ProductEditor } from "@/components/admin/products/product-editor"
import { getAttributes, getCategoryTree } from "@/lib/backend-admin-products"

export const metadata: Metadata = { title: "New product · AURA Admin" }

export default async function NewProductPage() {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")

  const [categories, attributes] = await Promise.all([getCategoryTree(), getAttributes()])
  return <ProductEditor product={null} categories={categories} attributes={attributes} />
}
