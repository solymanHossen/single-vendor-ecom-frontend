import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { isOptimizableImage, sizedImage } from "@/lib/images"
import { collectionHref } from "@/lib/routes"
import type { NavigationCollection } from "@/lib/storefront-types"
import { cn } from "@/lib/utils"
import { SectionHeader } from "./section-header"

const MOTION =
  "transition-[transform,opacity,background-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"

/** The four live collections as editorial cards (same hover language as the menu). */
export function CollectionsShowcase({
  collections,
}: {
  collections: NavigationCollection[]
}) {
  if (collections.length === 0) return null

  return (
    <section aria-label="Curated collections">
      <SectionHeader
        title="Curated collections"
        description="Hand-picked edits, updated live from what shoppers love."
      />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        {collections.map((collection) => (
          <li key={collection.key}>
            <Link
              href={collectionHref(collection.key)}
              className="group relative block aspect-4/3 overflow-hidden rounded-3xl bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background xl:aspect-3/4"
            >
              {collection.previewImageUrl && (
                <Image
                  src={sizedImage(collection.previewImageUrl, 720, 900)}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                  unoptimized={!isOptimizableImage(collection.previewImageUrl)}
                  className={cn(
                    MOTION,
                    "object-cover duration-700 group-hover:scale-[1.04]"
                  )}
                />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
              <div
                className={cn(
                  MOTION,
                  "absolute inset-0 bg-linear-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100"
                )}
              />
              <span className="absolute top-5 left-5 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-black backdrop-blur">
                {collection.productCount} products
              </span>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white sm:p-7">
                <div
                  className={cn(
                    MOTION,
                    "space-y-1.5 group-hover:-translate-y-1"
                  )}
                >
                  <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    {collection.title}
                  </h3>
                  <p className="line-clamp-2 text-base text-white/85">
                    {collection.description}
                  </p>
                </div>
                <span
                  className={cn(
                    MOTION,
                    "flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-black group-hover:bg-primary group-hover:text-primary-foreground"
                  )}
                >
                  <ArrowRight
                    className={cn(MOTION, "size-5 group-hover:translate-x-0.5")}
                  />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
