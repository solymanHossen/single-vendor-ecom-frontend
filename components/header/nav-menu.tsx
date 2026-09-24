"use client"

import * as React from "react"
import { createPortal, preload } from "react-dom"
import Link from "next/link"
import Image, { getImageProps } from "next/image"
import { ArrowRight, LayoutGrid } from "lucide-react"
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

/**
 * Hover/focus-only motion for collection cards: one soft curve, transform
 * and opacity only (GPU-friendly), disabled for reduced-motion users.
 */
const HOVER_MOTION =
  "transition-[transform,opacity,background-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"

/** Panels span the full site container and never run past the screen bottom. */
const PANEL_WIDTH =
  "w-[100cqw] max-h-[calc(100dvh-7.5rem)] overflow-y-auto overscroll-contain"

// Rendered sizes — shared by <Image> and the preloader so the browser
// warms exactly the files the tiles will request.
const IMAGE_SPECS = {
  rail: { width: 96, height: 96, sizes: "40px" },
  tile: { width: 600, height: 450, sizes: "(min-width: 1536px) 260px, 300px" },
  spotlight: { width: 720, height: 540, sizes: "320px" },
  collection: {
    width: 720,
    height: 900,
    sizes: "(min-width: 1280px) 25vw, 50vw",
  },
} as const
type ImageSpec = (typeof IMAGE_SPECS)[keyof typeof IMAGE_SPECS]

export interface NavMenuProps {
  navigation: StorefrontNavigation
  activeTab?: string
  onTabChange?: (tab: "home" | "shop" | "about") => void
  onScrollToSection?: (id: string) => void
}

/**
 * Starts downloading the optimized menu images before a panel opens, using
 * the same srcset <Image> will pick — so tiles appear already loaded instead
 * of blank. Runs once, on the first pointer/focus contact with the nav.
 */
function preloadMenuImages(navigation: StorefrontNavigation): void {
  const queue: Array<[string | null, ImageSpec]> = [
    [navigation.spotlight?.thumbnailUrl ?? null, IMAGE_SPECS.spotlight],
    ...navigation.categories.map(
      (category) =>
        [category.iconUrl, IMAGE_SPECS.rail] as [string | null, ImageSpec]
    ),
    ...navigation.categories.flatMap((category) =>
      category.children.map(
        (child) =>
          [child.iconUrl, IMAGE_SPECS.tile] as [string | null, ImageSpec]
      )
    ),
    ...navigation.collections.map(
      (collection) =>
        [collection.previewImageUrl, IMAGE_SPECS.collection] as [
          string | null,
          ImageSpec,
        ]
    ),
  ]

  for (const [src, spec] of queue) {
    if (!src) continue
    const url = sizedImage(src, spec.width, spec.height)
    if (!isOptimizableImage(url)) {
      preload(url, { as: "image" })
      continue
    }
    const { props } = getImageProps({
      src: url,
      alt: "",
      fill: true,
      sizes: spec.sizes,
    })
    preload(props.src, {
      as: "image",
      imageSrcSet: props.srcSet,
      imageSizes: props.sizes,
    })
  }
}

/** Menu image over a soft placeholder; preloaded, so it appears without motion. */
function MenuImage({
  src,
  spec,
  alt = "",
  className,
}: {
  src: string | null
  spec: ImageSpec
  alt?: string
  className?: string
}) {
  if (!src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
        <LayoutGrid className="size-5" />
      </div>
    )
  }
  const url = sizedImage(src, spec.width, spec.height)
  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={spec.sizes}
      unoptimized={!isOptimizableImage(url)}
      // Only mounted while a panel is open, and already preloaded — load now.
      loading="eager"
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
        "pointer-events-none fixed inset-0 z-30 bg-foreground/10 backdrop-blur-[2px] transition-opacity duration-200 motion-reduce:transition-none",
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
        className="group flex h-full flex-col items-stretch gap-0 overflow-hidden rounded-2xl bg-muted/50 p-0 transition-colors duration-150 hover:bg-muted/80"
      >
        <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
          <MenuImage
            src={product.thumbnailUrl}
            spec={IMAGE_SPECS.spotlight}
            alt={product.name}
          />
          {percent > 0 && (
            <span className="absolute top-4 left-4 rounded-full bg-background px-3 py-1 text-sm font-semibold text-foreground shadow-sm">
              Save {percent}%
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between gap-5 p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Top deal · {product.categoryName}
            </p>
            <h4 className="line-clamp-2 text-lg leading-snug font-semibold text-foreground">
              {product.name}
            </h4>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col">
              {product.discountPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.basePrice)}
                </span>
              )}
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {formatPrice(product.discountPrice ?? product.basePrice)}
              </span>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
              <ArrowRight className="size-5" />
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
          "p-16 text-center text-base text-muted-foreground"
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
        "grid grid-cols-[280px_1fr] gap-4 p-4 xl:grid-cols-[300px_1fr_340px]"
      )}
    >
      {/* Department rail */}
      <nav
        aria-label="Departments"
        className="flex flex-col rounded-2xl bg-muted/40 p-2.5"
      >
        <p className="px-3 pt-2 pb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Departments
        </p>
        <ul className="flex flex-col gap-1" role="list">
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
                      "flex items-center gap-3 rounded-xl px-2.5 py-2 text-base transition-colors duration-150",
                      isActive
                        ? "bg-background font-semibold text-foreground shadow-sm hover:bg-background focus:bg-background"
                        : "font-medium text-muted-foreground hover:bg-background/60 hover:text-foreground"
                    )}
                  >
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <MenuImage
                        src={category.iconUrl}
                        spec={IMAGE_SPECS.rail}
                      />
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {category.name}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground/80"
                      )}
                    >
                      {category.productCount}
                    </span>
                  </Link>
                </NavigationMenuLink>
              </li>
            )
          })}
        </ul>
        <div className="mt-auto pt-3">
          <NavigationMenuLink asChild>
            <Link
              href={PRODUCTS_PATH}
              onClick={onNavigate}
              className="group/all flex items-center justify-between rounded-xl bg-foreground px-4 py-3 text-base font-semibold text-background hover:bg-foreground/90 focus:bg-foreground/90"
            >
              Shop everything
              <ArrowRight className="size-5" />
            </Link>
          </NavigationMenuLink>
        </div>
      </nav>

      {/* Active department — keyed so each switch replays the cascade */}
      <div key={active.id} className="flex min-w-0 flex-col gap-6 px-3 py-3">
        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0 space-y-1.5">
            <h3 className="text-3xl font-semibold tracking-tight text-foreground">
              {active.name}
            </h3>
            {active.description && (
              <p className="line-clamp-2 max-w-2xl text-base text-muted-foreground">
                {active.description}
              </p>
            )}
          </div>
          <NavigationMenuLink asChild>
            <Link
              href={categoryHref(active.slug)}
              onClick={onNavigate}
              className="group/all flex shrink-0 items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-foreground/30 hover:bg-muted"
            >
              Shop all {active.productCount}
              <ArrowRight className="size-4" />
            </Link>
          </NavigationMenuLink>
        </div>

        <ul className="grid grid-cols-3 gap-5 2xl:grid-cols-4" role="list">
          {active.children.map((child) => (
            <li key={child.id}>
              <NavigationMenuLink asChild>
                <Link
                  href={categoryHref(child.slug)}
                  onClick={onNavigate}
                  className="group flex flex-col items-stretch gap-3 rounded-2xl p-0 hover:bg-transparent focus:bg-transparent"
                >
                  <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted ring-1 ring-foreground/5">
                    <MenuImage src={child.iconUrl} spec={IMAGE_SPECS.tile} />
                  </div>
                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-foreground">
                        {child.name}
                      </p>
                      <p className="text-sm text-muted-foreground tabular-nums">
                        {child.productCount}{" "}
                        {child.productCount === 1 ? "product" : "products"}
                      </p>
                    </div>
                    <ArrowRight className="size-5 shrink-0 text-muted-foreground" />
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
    <div className={cn(PANEL_WIDTH, "space-y-4 p-4")}>
      <div className="flex items-end justify-between gap-4 px-2 pt-2">
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold tracking-tight text-foreground">
            Curated collections
          </h3>
          <p className="text-base text-muted-foreground">
            Hand-picked edits, updated live from what shoppers love.
          </p>
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-4 xl:grid-cols-4" role="list">
        {collections.map((collection) => (
          <li key={collection.key}>
            <NavigationMenuLink asChild>
              <Link
                href={collectionHref(collection.key)}
                className="group relative block aspect-4/3 overflow-hidden rounded-2xl bg-muted p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 xl:aspect-3/4"
              >
                <MenuImage
                  src={collection.previewImageUrl}
                  spec={IMAGE_SPECS.collection}
                  className={cn(
                    HOVER_MOTION,
                    "duration-700 group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
                  )}
                />
                {/* Base shade for legibility; a second layer deepens on hover. */}
                <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
                <div
                  className={cn(
                    HOVER_MOTION,
                    "absolute inset-0 bg-linear-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                  )}
                />
                <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-black backdrop-blur">
                  {collection.productCount} products
                </span>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white">
                  <div
                    className={cn(
                      HOVER_MOTION,
                      "space-y-1.5 group-hover:-translate-y-1 group-focus-visible:-translate-y-1"
                    )}
                  >
                    <h4 className="text-2xl font-semibold tracking-tight">
                      {collection.title}
                    </h4>
                    <p className="line-clamp-2 text-base text-white/85">
                      {collection.description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      HOVER_MOTION,
                      "flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-black group-hover:bg-primary group-hover:text-primary-foreground group-focus-visible:bg-primary group-focus-visible:text-primary-foreground"
                    )}
                  >
                    <ArrowRight
                      className={cn(
                        HOVER_MOTION,
                        "size-5 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
                      )}
                    />
                  </span>
                </div>
              </Link>
            </NavigationMenuLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

const TRIGGER_CLASS =
  "h-10 rounded-full bg-transparent px-4 text-[15px] font-medium text-muted-foreground transition-colors duration-300 hover:bg-muted/70 hover:text-foreground focus:bg-muted/70 data-open:bg-muted data-open:text-foreground data-popup-open:bg-muted"

export function NavMenu({ navigation, activeTab, onTabChange }: NavMenuProps) {
  const { categories, collections, spotlight } = navigation
  const directLinks = categories.slice(0, DIRECT_LINK_COUNT)
  // Controlled so the page backdrop can follow the menu's open state.
  const [openMenu, setOpenMenu] = React.useState("")
  const preloaded = React.useRef(false)

  const warmUp = () => {
    if (preloaded.current) return
    preloaded.current = true
    preloadMenuImages(navigation)
  }

  return (
    <>
      <NavigationMenu
        value={openMenu}
        onValueChange={setOpenMenu}
        delayDuration={100}
        onPointerEnter={warmUp}
        onFocusCapture={warmUp}
        // `static!` lets the viewport anchor to the header bar, not this list.
        className="static! hidden md:flex"
      >
        <NavigationMenuList className="flex items-center gap-1">
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
                  className="h-10 rounded-full px-4 text-[15px] font-medium text-muted-foreground transition-colors duration-300 hover:bg-muted/70 hover:text-foreground"
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
