"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  LayoutGrid,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { discountPercent, formatPrice } from "@/lib/format"
import { isOptimizableImage } from "@/lib/images"
import {
  categoryHref,
  collectionHref,
  productHref,
  SHOP_PATH,
} from "@/lib/routes"
import type {
  NavigationCategory,
  NavigationCollection,
  NavigationProduct,
  StorefrontNavigation,
} from "@/lib/storefront-types"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"

/** Number of top categories promoted to direct links beside the menus. */
const DIRECT_LINK_COUNT = 2

export interface NavMenuProps {
  navigation: StorefrontNavigation
  activeTab?: string
  onTabChange?: (tab: "home" | "shop" | "about") => void
  onScrollToSection?: (id: string) => void
}

function Thumb({
  src,
  alt,
  size,
  className,
}: {
  src: string | null
  alt: string
  size: number
  className?: string
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        style={{ width: size, height: size }}
      >
        <LayoutGrid className="size-4" />
      </div>
    )
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      sizes={`${size}px`}
      unoptimized={!isOptimizableImage(src)}
      className={cn("object-cover", className)}
      style={{ width: size, height: size }}
    />
  )
}

function SpotlightCard({ product }: { product: NavigationProduct }) {
  const percent = discountPercent(product.basePrice, product.discountPrice)

  return (
    <NavigationMenuLink asChild>
      <Link
        href={productHref(product.slug)}
        className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-muted/40 p-0! transition-colors hover:border-primary/40"
      >
        <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
          {product.thumbnailUrl && (
            <Image
              src={product.thumbnailUrl}
              alt={product.name}
              fill
              sizes="260px"
              unoptimized={!isOptimizableImage(product.thumbnailUrl)}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-bold tracking-wider text-foreground uppercase backdrop-blur">
            Top deal
          </span>
          {percent > 0 && (
            <span className="absolute top-3 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              −{percent}%
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between gap-3 p-4">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              {product.categoryName}
            </p>
            <h4 className="line-clamp-2 text-sm leading-snug font-bold text-foreground transition-colors group-hover:text-primary">
              {product.name}
            </h4>
          </div>

          <div className="flex items-end justify-between border-t border-border/60 pt-3">
            <div className="flex flex-col">
              {product.discountPrice && (
                <span className="text-[11px] text-muted-foreground line-through">
                  {formatPrice(product.basePrice)}
                </span>
              )}
              <span className="text-base font-bold text-primary">
                {formatPrice(product.discountPrice ?? product.basePrice)}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              Shop now
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </NavigationMenuLink>
  )
}

function CatalogMegaMenu({
  categories,
  spotlight,
  onNavigate,
}: {
  categories: NavigationCategory[]
  spotlight: NavigationProduct | null
  onNavigate: () => void
}) {
  const [activeId, setActiveId] = React.useState<number | null>(
    categories[0]?.id ?? null
  )
  const active =
    categories.find((category) => category.id === activeId) ?? categories[0]

  if (!active) {
    return (
      <div className="w-105 p-8 text-center text-sm text-muted-foreground">
        Our catalog is being stocked — check back soon.
      </div>
    )
  }

  return (
    <div className="grid w-225 grid-cols-[220px_1fr_260px] gap-0">
      {/* Department rail — hover or keyboard focus switches the panel */}
      <ul className="border-r border-border/60 bg-muted/30 p-3" role="list">
        {categories.map((category) => {
          const isActive = category.id === active.id
          return (
            <li key={category.id}>
              <NavigationMenuLink asChild>
                <Link
                  href={categoryHref(category.slug)}
                  onMouseEnter={() => setActiveId(category.id)}
                  onFocus={() => setActiveId(category.id)}
                  onClick={onNavigate}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "flex flex-row! items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-background text-primary shadow-xs"
                      : "text-foreground hover:bg-background/70"
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Thumb
                      src={category.iconUrl}
                      alt=""
                      size={28}
                      className="shrink-0 rounded-md"
                    />
                    <span className="truncate">{category.name}</span>
                  </span>
                  <ChevronRight
                    className={cn(
                      "size-3.5 shrink-0 transition-all",
                      isActive ? "translate-x-0.5 opacity-100" : "opacity-40"
                    )}
                  />
                </Link>
              </NavigationMenuLink>
            </li>
          )
        })}
        <li className="mt-2 border-t border-border/60 pt-2">
          <NavigationMenuLink asChild>
            <Link
              href={SHOP_PATH}
              onClick={onNavigate}
              className="flex flex-row! items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-primary hover:bg-background/70"
            >
              <LayoutGrid className="size-3.5" />
              Browse all products
            </Link>
          </NavigationMenuLink>
        </li>
      </ul>

      {/* Active department: sub-categories with live counts */}
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              {active.name}
            </h3>
            {active.description && (
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {active.description}
              </p>
            )}
          </div>
          <NavigationMenuLink asChild>
            <Link
              href={categoryHref(active.slug)}
              onClick={onNavigate}
              className="flex shrink-0 flex-row! items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              View all {active.productCount}
              <ArrowRight className="size-3" />
            </Link>
          </NavigationMenuLink>
        </div>

        <ul className="grid grid-cols-2 gap-2" role="list">
          {active.children.map((child) => (
            <li key={child.id}>
              <NavigationMenuLink asChild>
                <Link
                  href={categoryHref(child.slug)}
                  onClick={onNavigate}
                  className="group flex flex-row! items-center gap-3 rounded-xl border border-transparent p-2 transition-all hover:border-border/60 hover:bg-muted/60"
                >
                  <Thumb
                    src={child.iconUrl}
                    alt=""
                    size={44}
                    className="shrink-0 rounded-lg transition-transform group-hover:scale-105"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
                      {child.name}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {child.productCount}{" "}
                      {child.productCount === 1 ? "product" : "products"}
                    </span>
                  </span>
                </Link>
              </NavigationMenuLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Spotlight deal (largest live saving) */}
      <div className="border-l border-border/60 p-3">
        {spotlight ? (
          <SpotlightCard product={spotlight} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl bg-muted/40 p-4 text-center">
            <Sparkles className="size-5 text-primary" />
            <p className="text-xs text-muted-foreground">
              New deals drop every week.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function CollectionsMenu({
  collections,
}: {
  collections: NavigationCollection[]
}) {
  return (
    <ul className="grid w-130 grid-cols-2 gap-2 p-3" role="list">
      {collections.map((collection) => (
        <li key={collection.key}>
          <NavigationMenuLink asChild>
            <Link
              href={collectionHref(collection.key)}
              className="group flex flex-row! items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted/70"
            >
              <Thumb
                src={collection.previewImageUrl}
                alt=""
                size={56}
                className="shrink-0 rounded-lg transition-transform group-hover:scale-105"
              />
              <span className="min-w-0 space-y-0.5">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
                  {collection.title}
                  <span className="rounded-full bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">
                    {collection.productCount}
                  </span>
                </span>
                <span className="line-clamp-2 block text-[11px] leading-snug text-muted-foreground">
                  {collection.description}
                </span>
              </span>
            </Link>
          </NavigationMenuLink>
        </li>
      ))}
    </ul>
  )
}

export function NavMenu({ navigation, activeTab, onTabChange }: NavMenuProps) {
  const { categories, collections, spotlight } = navigation
  const directLinks = categories.slice(0, DIRECT_LINK_COUNT)

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList className="flex items-center gap-1">
        {/* Catalog mega-menu */}
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              "bg-transparent text-sm font-medium transition-colors hover:bg-muted/50 hover:text-primary focus:text-primary data-[state=open]:bg-muted/60",
              activeTab === "shop" && "font-semibold text-primary"
            )}
          >
            Explore Catalog
          </NavigationMenuTrigger>
          <NavigationMenuContent className="p-0!">
            <CatalogMegaMenu
              categories={categories}
              spotlight={spotlight}
              onNavigate={() => onTabChange?.("shop")}
            />
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Curated collections — hidden entirely when none have products */}
        {collections.length > 0 && (
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent text-sm font-medium transition-colors hover:bg-muted/50 hover:text-primary focus:text-primary">
              Collections
            </NavigationMenuTrigger>
            <NavigationMenuContent className="p-0!">
              <CollectionsMenu collections={collections} />
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}

        {/* Largest departments promoted to direct links */}
        {directLinks.map((category) => (
          <NavigationMenuItem key={category.id} className="hidden lg:block">
            <NavigationMenuLink asChild>
              <Link
                href={categoryHref(category.slug)}
                onClick={() => onTabChange?.("shop")}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                {category.name}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
