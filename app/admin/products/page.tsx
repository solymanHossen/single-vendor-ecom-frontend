import Link from "next/link"
import { redirect } from "next/navigation"
import { CircleAlert, Plus } from "lucide-react"
import { auth } from "@/auth"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { ProductCatalog } from "@/components/admin/products/product-catalog"
import { Button } from "@/components/ui/button"
import { parseAdminProductQuery } from "@/lib/admin-product-params"
import {
  getAdminProducts,
  getCategoryTree,
  type AdminProductPage,
  type CategoryNode,
} from "@/lib/backend-admin-products"

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")

  const query = parseAdminProductQuery(await searchParams)
  let page: AdminProductPage | null = null
  let categories: CategoryNode[] = []
  try {
    ;[page, categories] = await Promise.all([
      getAdminProducts(session.accessToken, query),
      getCategoryTree(),
    ])
  } catch (error: unknown) {
    console.error("[admin] products unavailable:", error)
  }

  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Everything in your catalogue — drafts included. Search, filter, publish and keep stock healthy."
        actions={
          <Button asChild className="h-11 rounded-xl px-5 text-[15px] font-semibold">
            <Link href="/admin/products/new">
              <Plus className="size-5" />
              Add product
            </Link>
          </Button>
        }
      />
      {page ? (
        <ProductCatalog page={page} query={query} categories={categories} />
      ) : (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-3xl bg-destructive/8 px-6 py-5 text-[15px] text-destructive"
        >
          <CircleAlert className="size-5 shrink-0" />
          Products are temporarily unavailable. Refresh in a moment.
        </div>
      )}
    </>
  )
}
