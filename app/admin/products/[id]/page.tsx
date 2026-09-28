import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductEditor } from "@/components/admin/products/product-editor"
import {
  getAdminProduct,
  getAttributes,
  getCategoryTree,
} from "@/lib/backend-admin-products"
import { AccessDenied } from "@/components/admin/access-denied"
import { getAdminAccess } from "@/lib/admin-access"

export const metadata: Metadata = { title: "Edit product · Admin" }

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const access = await getAdminAccess()
  if (!access.can("catalog.manage")) return <AccessDenied area="products" />

  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) notFound()

  const [product, categories, attributes] = await Promise.all([
    getAdminProduct(access.accessToken, id),
    getCategoryTree(),
    getAttributes(),
  ])
  if (!product) notFound()

  // Keyed by id so moving between products starts from a fresh form.
  return (
    <ProductEditor
      key={product.id}
      product={product}
      categories={categories}
      attributes={attributes}
    />
  )
}
