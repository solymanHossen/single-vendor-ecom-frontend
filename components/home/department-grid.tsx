import Image from "next/image"
import Link from "next/link"
import { isOptimizableImage, sizedImage } from "@/lib/images"
import { categoryHref } from "@/lib/routes"
import type { NavigationCategory } from "@/lib/storefront-types"
import { SectionHeader } from "./section-header"

const HOVER =
  "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"

/** Top-level departments as large image tiles, straight from the live category tree. */
export function DepartmentGrid({
  categories,
}: {
  categories: NavigationCategory[]
}) {
  if (categories.length === 0) return null

  return (
    <section aria-label="Departments">
      <SectionHeader
        title="Shop by department"
        description="Everything in the store, organised the way you shop."
        action={{ label: "Browse all products", href: "/products" }}
      />
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-6">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={categoryHref(category.slug)}
              className="group block rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-muted">
                {category.iconUrl && (
                  <Image
                    src={sizedImage(category.iconUrl, 600, 750)}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 16vw, (min-width: 768px) 30vw, 50vw"
                    unoptimized={!isOptimizableImage(category.iconUrl)}
                    className={`object-cover group-hover:scale-[1.04] ${HOVER}`}
                  />
                )}
              </div>
              <div className="mt-3.5 space-y-0.5 px-1">
                <p className="text-base font-semibold text-foreground">
                  {category.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {category.productCount} products
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
