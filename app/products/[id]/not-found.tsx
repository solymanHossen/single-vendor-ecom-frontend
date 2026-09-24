import Link from "next/link"
import { PackageX } from "lucide-react"
import { PRODUCTS_PATH } from "@/lib/routes"

export default function ProductNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <PackageX className="size-12 text-muted-foreground" />
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold text-foreground">Product not found</h1>
        <p className="text-sm text-muted-foreground">
          This product may have been removed or is no longer available.
        </p>
      </div>
      <Link
        href={PRODUCTS_PATH}
        className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
      >
        Continue shopping
      </Link>
    </div>
  )
}
