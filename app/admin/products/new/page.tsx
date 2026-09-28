import type { Metadata } from "next"
import { ProductEditor } from "@/components/admin/products/product-editor"
import { getAttributes, getCategoryTree } from "@/lib/backend-admin-products"
import { AccessDenied } from "@/components/admin/access-denied"
import { getAdminAccess } from "@/lib/admin-access"

export const metadata: Metadata = { title: "New product · Admin" }

export default async function NewProductPage() {
  const access = await getAdminAccess()
  if (!access.can("catalog.manage")) return <AccessDenied area="products" />

  const [categories, attributes] = await Promise.all([getCategoryTree(), getAttributes()])
  return <ProductEditor product={null} categories={categories} attributes={attributes} />
}
