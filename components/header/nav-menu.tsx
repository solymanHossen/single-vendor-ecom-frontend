"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ArrowUpRight, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"
import { discountPercent, formatPrice } from "@/lib/format"
import { isOptimizableImage, sizedImage } from "@/lib/images"
import {
  categoryHref,
  collectionHref,
  productHref,
  PRODUCTS_PATH,
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
/** Hover intent: ignore the rail while the pointer is just passing over it. */
const RAIL_HOVER_DELAY_MS = 90

/** Panels span the full site container (see NavigationMenuViewport). */
const PANEL_WIDTH = "w-[100cqw]"

export interface NavMenuProps {
  navigation: StorefrontNavigation
  activeTab?: string
  onTabChange?: (tab: "home" | "shop" | "about") => void
  onScrollToSection?: (id: string) => void
}

function Thumb({
  src,
  alt,
  width,
  height,
  sizes,
  className,
}: {
  src: string | null
  alt: string
  width: number
  height: number
  sizes: string
  className?: string
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
      >
        <LayoutGrid className="size-5" />
      </div>
    )
  }
  const url = sizedImage(src, width, height)
  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized={!isOptimizableImage(url)}
      className={cn("object-cover", className)}
    />
  )
}

const noopSubscribe = () => () => {}

/**
 * Dims the page behind an open menu. Portalled to <body> because the header
 * uses backdrop-filter, which would otherwise trap a fixed overlay inside it.
 */
function MenuBackdrop({ visible }: { visible: boolean }) {
  const mounted = React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
  if (!mounted) return null
  return createPortal(
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 z-30 bg-foreground/10 backdrop-blur-[2px] transition-opacity duration-300 ease-out motion-reduce:transition-none",
        visible ? "opacity-100" : "opacity-0"
      )}
    />,
    document.body
  )
}

function SpotlightCard({ product }: { product: NavigationProduct }) {
  const percent = discountPercent(product.basePrice, product.discountPrice)

  return (
    <NavigationMenuLink asChild>
      <Link
        href={productHref(product.id)}
        className="group flex h-full flex-col items-stretch gap-0 overflow-hidden rounded-2xl bg-muted/50 p-0 hover:bg-muted/70"
      >
        <div className="relative aspect-4/3 w-full overflow-hidden">
          {product.thumbnailUrl && (
            <Image
              src={sizedImage(product.thumbnailUrl, 640, 480)}
              alt={product.name}
              fill
              sizes="300px"
              unoptimized={!isOptimizableImage(product.thumbnailUrl)}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          )}
          {percent > 0 && (
            <span className="absolute top-3 left-3 rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm">
              Save {percent}%
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between gap-4 p-5">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Top deal · {product.categoryName}
            </p>
            <h4 className="line-clamp-2 text-base leading-snug font-semibold text-foreground">
              {product.name}
            </h4>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-lg font-bold text-foreground">
                {formatPrice(product.discountPrice ?? product.basePrice)}
              </span>
              {product.discountPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.basePrice)}
                </span>
              )}
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-transform duration-300 group-hover:-rotate-45">
              <ArrowRight className="size-4" />
            </span>
          </div>
        </div>
      </Link>
    </NavigationMenuLink>
  )
}

function CatalogPanel({
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
  const hoverTimer = React.useRef<number | undefined>(undefined)
  const active =
    categories.find((category) => category.id === activeId) ?? categories[0]

  React.useEffect(() => () => window.clearTimeout(hoverTimer.current), [])

  const activateSoon = (id: number) => {
    window.clearTimeout(hoverTimer.current)
    hoverTimer.current = window.setTimeout(
      () => setActiveId(id),
      RAIL_HOVER_DELAY_MS
    )
  }

  if (!active) {
    return (
      <div
        className={cn(
          PANEL_WIDTH,
          "p-12 text-center text-sm text-muted-foreground"
        )}
      >
        Our catalog is being stocked — check back soon.
      </div>
    )
  }

  return (
    <div
      className={cn(
        PANEL_WIDTH,
        "grid grid-cols-[240px_1fr] gap-2 p-3 xl:grid-cols-[260px_1fr_300px]"
      )}
    >
      {/* Department rail */}
      <ul
        className="flex flex-col gap-0.5 rounded-xl bg-muted/40 p-2"
        role="list"
      >
        {categories.map((category) => {
          const isActive = category.id === active.id
          return (
            <li key={category.id}>
              <NavigationMenuLink asChild>
                <Link
                  href={categoryHref(category.slug)}
                  onMouseEnter={() => activateSoon(category.id)}
                  onMouseLeave={() => window.clearTimeout(hoverTimer.current)}
                  onFocus={() => setActiveId(category.id)}
                  onClick={onNavigate}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200",
                    isActive
                      ? "bg-background font-semibold text-foreground shadow-xs hover:bg-background focus:bg-background"
                      : "font-medium text-muted-foreground hover:bg-background/60 hover:text-foreground"
                  )}
                >
                  <span className="truncate">{category.name}</span>
                  <span
                    className={cn(
                      "shrink-0 text-xs tabular-nums",
                      isActive ? "text-primary" : "text-muted-foreground/70"
                    )}
                  >
                    {category.productCount}
                  </span>
                </Link>
              </NavigationMenuLink>
            </li>
          )
        })}
        <li className="mt-auto pt-2">
          <NavigationMenuLink asChild>
            <Link
              href={PRODUCTS_PATH}
              onClick={onNavigate}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-background/60"
            >
              Shop everything
              <ArrowRight className="size-4" />
            </Link>
          </NavigationMenuLink>
        </li>
      </ul>

      {/* Active department — keyed so each switch fades in smoothly */}
      <div
        key={active.id}
        className="flex min-w-0 animate-in flex-col gap-5 px-4 py-3 duration-300 fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none"
      >
        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0 space-y-1">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              {active.name}
            </h3>
            {active.description && (
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {active.description}
              </p>
            )}
          </div>
          <NavigationMenuLink asChild>
            <Link
              href={categoryHref(active.slug)}
              onClick={onNavigate}
              className="group/all flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              View all {active.productCount}
              <ArrowRight className="size-4 transition-transform group-hover/all:translate-x-0.5" />
            </Link>
          </NavigationMenuLink>
        </div>

        <ul className="grid grid-cols-3 gap-4 2xl:grid-cols-4" role="list">
          {active.children.map((child) => (
            <li key={child.id}>
              <NavigationMenuLink asChild>
                <Link
                  href={categoryHref(child.slug)}
                  onClick={onNavigate}
                  className="group flex flex-col items-stretch gap-2.5 rounded-xl p-0 hover:bg-transparent focus:bg-transparent"
                >
                  <div className="relative aspect-3/2 overflow-hidden rounded-xl bg-muted">
                    <Thumb
                      src={child.iconUrl}
                      alt=""
                      width={480}
                      height={320}
                      sizes="(min-width: 1536px) 240px, 280px"
                      className="transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-baseline justify-between gap-2 px-0.5">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {child.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {child.productCount} {child.productCount === 1 ? "item" : "items"}
                    </span>
                  </div>
                </Link>
              </NavigationMenuLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Spotlight deal — shown on wide screens where it has room to breathe */}
      <div className="hidden xl:block">
        {spotlight && <SpotlightCard product={spotlight} />}
      </div>
    </div>
  )
}

function CollectionsPanel({
  collections,
}: {
  collections: NavigationCollection[]
}) {
  return (
    <ul
      className={cn(PANEL_WIDTH, "grid grid-cols-2 gap-3 p-3 xl:grid-cols-4")}
      role="list"
    >
      {collections.map((collection) => (
        <li key={collection.key}>
          <NavigationMenuLink asChild>
            <Link
              href={collectionHref(collection.key)}
              className="group relative block aspect-4/3 overflow-hidden rounded-xl bg-muted p-0 xl:aspect-4/5"
            >
              <Thumb
                src={collection.previewImageUrl}
                alt=""
                width={640}
                height={800}
                sizes="(min-width: 1280px) 25vw, 50vw"
                className="transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-white/75">
                    {collection.productCount} products
                  </p>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {collection.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-white/80">
                    {collection.description}
                  </p>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform duration-300 group-hover:-rotate-45">
                  <ArrowUpRight className="size-4 rotate-45" />
                </span>
              </div>
            </Link>
          </NavigationMenuLink>
        </li>
      ))}
    </ul>
  )
}

const TRIGGER_CLASS =
  "h-9 rounded-full bg-transparent px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus:bg-muted/70 data-open:bg-muted data-open:text-foreground data-popup-open:bg-muted"

export function NavMenu({ navigation, activeTab, onTabChange }: NavMenuProps) {
  const { categories, collections, spotlight } = navigation
  const directLinks = categories.slice(0, DIRECT_LINK_COUNT)
  // Controlled so the page backdrop can follow the menu's open state.
  const [openMenu, setOpenMenu] = React.useState("")

  return (
    <>
      <NavigationMenu
        value={openMenu}
        onValueChange={setOpenMenu}
        delayDuration={120}
        // `static!` lets the viewport anchor to the header bar, not this list.
        className="static! hidden md:flex"
      >
        <NavigationMenuList className="flex items-center gap-0.5">
          <NavigationMenuItem value="catalog">
            <NavigationMenuTrigger
              className={cn(
                TRIGGER_CLASS,
                activeTab === "shop" && "text-foreground"
              )}
            >
              Explore Catalog
            </NavigationMenuTrigger>
            <NavigationMenuContent className="p-0!">
              <CatalogPanel
                categories={categories}
                spotlight={spotlight}
                onNavigate={() => {
                  setOpenMenu("")
                  onTabChange?.("shop")
                }}
              />
            </NavigationMenuContent>
          </NavigationMenuItem>

          {collections.length > 0 && (
            <NavigationMenuItem value="collections">
              <NavigationMenuTrigger className={TRIGGER_CLASS}>
                Collections
              </NavigationMenuTrigger>
              <NavigationMenuContent className="p-0!">
                <CollectionsPanel collections={collections} />
              </NavigationMenuContent>
            </NavigationMenuItem>
          )}

          {directLinks.map((category) => (
            <NavigationMenuItem key={category.id} className="hidden lg:block">
              <NavigationMenuLink asChild>
                <Link
                  href={categoryHref(category.slug)}
                  onClick={() => onTabChange?.("shop")}
                  className="h-9 rounded-full px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                >
                  {category.name}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <MenuBackdrop visible={openMenu !== ""} />
    </>
  )
}
