import Link from "next/link"
import { SearchX } from "lucide-react"
import { PRODUCTS_PATH } from "@/lib/routes"

export default function CatalogNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <SearchX className="size-12 text-muted-foreground" />
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold text-foreground">
          We couldn’t find that page
        </h1>
        <p className="text-sm text-muted-foreground">
          The category or link you followed may have changed. Browse the full
          catalog instead.
        </p>
      </div>
      <Link
        href={PRODUCTS_PATH}
        className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
      >
        Browse all products
      </Link>
    </div>
  )
}
