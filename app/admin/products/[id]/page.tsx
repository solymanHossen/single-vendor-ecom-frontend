import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { ProductEditor } from "@/components/admin/products/product-editor"
import {
  getAdminProduct,
  getAttributes,
  getCategoryTree,
} from "@/lib/backend-admin-products"

export const metadata: Metadata = { title: "Edit product · AURA Admin" }

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")

  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) notFound()

  const [product, categories, attributes] = await Promise.all([
    getAdminProduct(session.accessToken, id),
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
