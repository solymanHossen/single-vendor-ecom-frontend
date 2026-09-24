"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Clock,
  CornerDownLeft,
  LayoutGrid,
  Loader2,
  Search,
  SearchX,
  TrendingUp,
  X,
} from "lucide-react"
import { Command as CommandPrimitive } from "cmdk"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { discountPercent, formatPrice } from "@/lib/format"
import { isOptimizableImage, sizedImage } from "@/lib/images"
import { preloadImage } from "@/lib/preload-image"
import { FadeImage } from "@/components/ui/fade-image"
import { categoryHref, productHref, searchHref } from "@/lib/routes"
import { useShortcutLabel, useStorageValue } from "@/hooks/use-storage-value"
import type {
  NavigationCategoryChild,
  NavigationProduct,
  SearchResponse,
  SearchResult,
  StorefrontNavigation,
} from "@/lib/storefront-types"

const DEBOUNCE_MS = 220
const MIN_QUERY_LENGTH = 2
const MAX_RECENT_SEARCHES = 5
const MAX_CATEGORY_MATCHES = 4
const RECENT_STORAGE_KEY = "aura:recent-searches"
const PREVIEW_SIZES = "300px"
const previewUrl = (url: string) => sizedImage(url, 640, 640)

type PreviewProduct = SearchResult | NavigationProduct

interface CategoryMatch {
  id: number
  name: string
  slug: string
  parentName: string | null
  productCount: number
}

interface SettledSearch {
  term: string
  data: SearchResponse | null
  failed: boolean
}

// Rows share one visual language; the check icon shadcn's CommandItem
// appends (for checkbox menus) is hidden since these rows navigate.
const ROW_CLASS =
  "group/row gap-3.5 rounded-xl px-3 py-2.5 text-[15px] transition-colors duration-150 cursor-pointer data-selected:bg-muted [&>svg:last-child]:hidden"
const GROUP_CLASS =
  "p-0 **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:pt-4 **:[[cmdk-group-heading]]:pb-2 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:tracking-wider **:[[cmdk-group-heading]]:uppercase"

function parseRecentSearches(raw: string | null): string[] {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed)
      ? parsed
          .filter((item): item is string => typeof item === "string")
          .slice(0, MAX_RECENT_SEARCHES)
      : []
  } catch {
    return []
  }
}

/** Wraps every case-insensitive occurrence of `query` in a <mark>. */
function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim()
  if (needle.length < MIN_QUERY_LENGTH) return <>{text}</>

  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const parts = text.split(new RegExp(`(${escaped})`, "gi"))
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === needle.toLowerCase() ? (
          <mark
            key={index}
            className="rounded bg-primary/15 px-0.5 text-foreground"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </>
  )
}

function Thumb({
  src,
  size,
  className,
}: {
  src: string | null
  size: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden bg-muted",
        className
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={sizedImage(src, size * 2, size * 2)}
          alt=""
          fill
          sizes={`${size}px`}
          unoptimized={!isOptimizableImage(src)}
          className="object-cover"
        />
      ) : (
        <LayoutGrid className="absolute inset-0 m-auto size-4 text-muted-foreground" />
      )}
    </span>
  )
}

function ProductRow({
  product,
  query,
  onSelect,
}: {
  product: PreviewProduct
  query: string
  onSelect: () => void
}) {
  const percent = discountPercent(product.basePrice, product.discountPrice)

  return (
    <CommandItem
      value={`product-${product.id}`}
      onSelect={onSelect}
      className={ROW_CLASS}
    >
      <Thumb src={product.thumbnailUrl} size={52} className="rounded-xl" />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate font-medium text-foreground">
          <Highlight text={product.name} query={query} />
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {product.categoryName}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-semibold text-foreground">
          {formatPrice(product.discountPrice ?? product.basePrice)}
        </p>
        {percent > 0 && (
          <p className="text-xs font-medium text-muted-foreground line-through">
            {formatPrice(product.basePrice)}
          </p>
        )}
      </div>
    </CommandItem>
  )
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3.5 px-3 py-2.5">
      <Skeleton className="size-13 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3.5 w-1/4" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

/** Large preview of the highlighted product — "look before you click". */
function PreviewPane({
  product,
  onOpen,
}: {
  product: PreviewProduct | null
  onOpen: (product: PreviewProduct) => void
}) {
  if (!product) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-sm text-muted-foreground">
        <Search className="size-8 opacity-40" />
        Highlight a product to preview it here.
      </div>
    )
  }

  const percent = discountPercent(product.basePrice, product.discountPrice)
  return (
    <div
      key={product.id}
      className="flex h-full animate-in flex-col gap-5 p-5 duration-300 fade-in-0 motion-reduce:animate-none"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        {product.thumbnailUrl && (
          <FadeImage
            src={previewUrl(product.thumbnailUrl)}
            alt={product.name}
            fill
            sizes={PREVIEW_SIZES}
            unoptimized={!isOptimizableImage(product.thumbnailUrl)}
            className="object-cover"
          />
        )}
        {percent > 0 && (
          <span className="absolute top-3 left-3 rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background">
            −{percent}%
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        <p className="text-sm text-muted-foreground">{product.categoryName}</p>
        <h3 className="line-clamp-2 text-lg leading-snug font-semibold text-foreground">
          {product.name}
        </h3>
        <p className="flex items-baseline gap-2 pt-1">
          <span className="text-xl font-semibold tracking-tight text-foreground">
            {formatPrice(product.discountPrice ?? product.basePrice)}
          </span>
          {percent > 0 && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.basePrice)}
            </span>
          )}
        </p>
      </div>
      <Button
        onClick={() => onOpen(product)}
        className="mt-auto h-11 w-full rounded-full text-[15px] font-semibold"
      >
        View product
        <ArrowRight data-icon="inline-end" className="size-4" />
      </Button>
    </div>
  )
}

export interface SearchCommandProps {
  navigation: StorefrontNavigation
  /** Controlled open state — lets the mobile drawer open the same palette. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export function SearchCommand({
  navigation,
  open: controlledOpen,
  onOpenChange,
  searchQuery,
  onSearchChange,
}: SearchCommandProps) {
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = React.useCallback(
    (next: boolean) => {
      setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [onOpenChange]
  )

  const [query, setQuery] = React.useState(searchQuery ?? "")
  const [debouncedQuery, setDebouncedQuery] = React.useState(query)
  // Only ever written from fetch callbacks; loading/error/empty states are
  // derived from it, so no state is set synchronously inside an effect.
  const [settled, setSettled] = React.useState<SettledSearch | null>(null)
  // cmdk's highlighted item (keyboard or pointer) drives the preview pane.
  const [highlighted, setHighlighted] = React.useState("")
  const [recentRaw, setRecentRaw] = useStorageValue("local", RECENT_STORAGE_KEY)
  const recentSearches = React.useMemo(
    () => parseRecentSearches(recentRaw),
    [recentRaw]
  )
  const shortcutLabel = useShortcutLabel()

  const trimmedQuery = query.trim()
  const hasQuery = trimmedQuery.length >= MIN_QUERY_LENGTH
  const debouncedTerm = debouncedQuery.trim()

  // ⌘K / Ctrl+K toggles the palette; "/" opens it when not typing elsewhere.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "k" || event.key === "K") &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        setOpen(!open)
        return
      }
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")
      if (event.key === "/" && !isTyping && !open) {
        event.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, setOpen])

  // Opening the palette warms the trending previews shown before typing.
  React.useEffect(() => {
    if (!open) return
    for (const product of navigation.trending) {
      if (product.thumbnailUrl)
        preloadImage(previewUrl(product.thumbnailUrl), PREVIEW_SIZES)
    }
  }, [open, navigation.trending])

  React.useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedQuery(query),
      DEBOUNCE_MS
    )
    return () => window.clearTimeout(timeout)
  }, [query])

  // Live product search. AbortController guarantees a slow response for an
  // old query can never overwrite the results of the newer one.
  React.useEffect(() => {
    if (debouncedTerm.length < MIN_QUERY_LENGTH) return

    const controller = new AbortController()
    fetch(`/api/search?q=${encodeURIComponent(debouncedTerm)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Search failed with ${res.status}`)
        return (await res.json()) as SearchResponse
      })
      .then((data) => {
        // Warm the preview pane's large images before they are highlighted.
        for (const result of data.results) {
          if (result.thumbnailUrl)
            preloadImage(previewUrl(result.thumbnailUrl), PREVIEW_SIZES)
        }
        setSettled({ term: debouncedTerm, data, failed: false })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setSettled({ term: debouncedTerm, data: null, failed: true })
      })

    return () => controller.abort()
  }, [debouncedTerm])

  // Category suggestions are matched locally against the navigation tree —
  // instant, and they need no extra request.
  const categoryMatches = React.useMemo<CategoryMatch[]>(() => {
    if (!hasQuery) return []
    const needle = trimmedQuery.toLowerCase()
    const matches: CategoryMatch[] = []
    for (const parent of navigation.categories) {
      if (parent.name.toLowerCase().includes(needle)) {
        matches.push({ ...parent, parentName: null })
      }
      for (const child of parent.children) {
        if (child.name.toLowerCase().includes(needle)) {
          matches.push({ ...child, parentName: parent.name })
        }
      }
    }
    return matches.slice(0, MAX_CATEGORY_MATCHES)
  }, [hasQuery, trimmedQuery, navigation.categories])

  const popularCategories = React.useMemo<NavigationCategoryChild[]>(
    () =>
      navigation.categories
        .flatMap((parent) => parent.children)
        .sort((a, b) => b.productCount - a.productCount)
        .slice(0, 6),
    [navigation.categories]
  )

  // Derived search state for the current query.
  const isSettled =
    hasQuery && settled?.term === trimmedQuery && debouncedTerm === trimmedQuery
  const showLoading = hasQuery && !isSettled
  const hasError = isSettled && settled.failed
  const response = hasQuery ? (settled?.data ?? null) : null
  // The previous query's results stay on screen (dimmed) while the next loads.
  const results = React.useMemo(() => response?.results ?? [], [response])
  const visibleProducts = React.useMemo<PreviewProduct[]>(
    () => (hasQuery ? results : navigation.trending),
    [hasQuery, results, navigation.trending]
  )

  // Preview follows the highlighted row; falls back to the first product so
  // the pane is never empty while there is something to show.
  const previewProduct = React.useMemo<PreviewProduct | null>(() => {
    const match = /^product-(\d+)$/.exec(highlighted)
    const id = match ? Number(match[1]) : null
    return (
      visibleProducts.find((product) => product.id === id) ??
      visibleProducts[0] ??
      null
    )
  }, [highlighted, visibleProducts])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    onSearchChange?.(value)
  }

  const navigate = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  const remember = (term: string) => {
    const clean = term.trim()
    if (clean.length < MIN_QUERY_LENGTH) return
    const next = [
      clean,
      ...recentSearches.filter(
        (item) => item.toLowerCase() !== clean.toLowerCase()
      ),
    ].slice(0, MAX_RECENT_SEARCHES)
    setRecentRaw(JSON.stringify(next))
  }

  const searchFor = (term: string) => {
    remember(term)
    navigate(searchHref(term))
  }

  const openProduct = (product: PreviewProduct) => {
    remember(trimmedQuery)
    navigate(productHref(product.id))
  }

  const clearQuery = () => {
    handleQueryChange("")
    inputRef.current?.focus()
  }

  return (
    <>
      {/* Trigger */}
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative mr-1 h-9 w-9 justify-center rounded-full border-border/80 bg-muted/40 px-0 text-xs font-normal text-muted-foreground shadow-xs transition-all hover:bg-muted/70 hover:text-foreground sm:w-44 sm:justify-start sm:pr-16 sm:pl-3.5 md:w-60 lg:w-72"
        aria-label="Search products"
      >
        <Search className="size-4 shrink-0 text-muted-foreground sm:mr-2" />
        <span className="hidden truncate sm:inline">
          {trimmedQuery || "Search products…"}
        </span>
        <Kbd className="absolute top-1/2 right-2.5 hidden -translate-y-1/2 border border-border bg-background md:inline-flex">
          {shortcutLabel}
        </Kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            "flex flex-col gap-0 overflow-hidden p-0 shadow-2xl ring-foreground/10",
            // Phones: a full-screen search surface.
            "top-0 left-0 h-dvh max-w-none translate-x-0 translate-y-0 rounded-none",
            // Tablet and up: a wide floating palette near the top of the page.
            "sm:top-[8vh] sm:left-1/2 sm:h-auto sm:max-h-[84vh] sm:w-[calc(100%-2rem)] sm:max-w-4xl sm:-translate-x-1/2 sm:rounded-3xl",
            "duration-200 data-open:slide-in-from-top-2 data-open:zoom-in-[0.98] data-closed:zoom-out-[0.98]"
          )}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Search the store</DialogTitle>
            <DialogDescription>
              Search products and categories.
            </DialogDescription>
          </DialogHeader>

          <Command
            shouldFilter={false}
            loop
            value={highlighted}
            onValueChange={setHighlighted}
            className="flex min-h-0 flex-1 flex-col rounded-none! bg-transparent p-0"
          >
            {/* Search field */}
            <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border/70 px-5 sm:h-18 sm:px-6">
              {showLoading ? (
                <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" />
              ) : (
                <Search className="size-5 shrink-0 text-muted-foreground" />
              )}
              <CommandPrimitive.Input
                ref={inputRef}
                value={query}
                onValueChange={handleQueryChange}
                placeholder="What are you looking for?"
                onKeyDown={(event) => {
                  // Enter with nothing highlighted still runs a full search.
                  if (event.key === "Enter" && hasQuery && !highlighted) {
                    event.preventDefault()
                    searchFor(trimmedQuery)
                  }
                }}
                className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-lg"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearQuery}
                  aria-label="Clear search"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground sm:hidden"
              >
                Cancel
              </button>
              <Kbd className="hidden h-6 border border-border bg-background px-1.5 sm:inline-flex">
                Esc
              </Kbd>
            </div>

            <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_320px]">
              <CommandList className="max-h-none min-h-0 overflow-y-auto overscroll-contain px-3 pb-3 sm:max-h-[min(560px,calc(84vh-130px))]">
                {hasQuery ? (
                  <>
                    <CommandGroup className={cn(GROUP_CLASS, "pt-3")}>
                      <CommandItem
                        value="__search-all"
                        onSelect={() => searchFor(trimmedQuery)}
                        className={ROW_CLASS}
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Search className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          Search for{" "}
                          <strong className="font-semibold">
                            “{trimmedQuery}”
                          </strong>
                        </span>
                        <span className="shrink-0 text-sm text-muted-foreground">
                          {isSettled && response
                            ? `${response.total} result${response.total === 1 ? "" : "s"}`
                            : null}
                        </span>
                        <CornerDownLeft className="size-4 text-muted-foreground" />
                      </CommandItem>
                    </CommandGroup>

                    {categoryMatches.length > 0 && (
                      <CommandGroup
                        heading="Categories"
                        className={GROUP_CLASS}
                      >
                        {categoryMatches.map((category) => (
                          <CommandItem
                            key={category.id}
                            value={`category-${category.id}`}
                            onSelect={() =>
                              navigate(categoryHref(category.slug))
                            }
                            className={ROW_CLASS}
                          >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground group-data-selected/row:bg-background">
                              <LayoutGrid className="size-5" />
                            </span>
                            <span className="min-w-0 flex-1 truncate">
                              <Highlight
                                text={category.name}
                                query={trimmedQuery}
                              />
                              {category.parentName && (
                                <span className="text-muted-foreground">
                                  {" "}
                                  in {category.parentName}
                                </span>
                              )}
                            </span>
                            <span className="shrink-0 text-sm text-muted-foreground">
                              {category.productCount} products
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {(showLoading || hasError || results.length > 0) && (
                      <CommandGroup heading="Products" className={GROUP_CLASS}>
                        {showLoading && results.length === 0 && (
                          <div aria-live="polite" aria-busy="true">
                            {Array.from({ length: 4 }, (_, index) => (
                              <RowSkeleton key={index} />
                            ))}
                          </div>
                        )}

                        {hasError && (
                          <p
                            className="flex items-center gap-2.5 rounded-xl bg-destructive/5 px-4 py-3.5 text-[15px] text-destructive"
                            role="alert"
                          >
                            <AlertCircle className="size-5" />
                            Search is unavailable right now. Please try again.
                          </p>
                        )}

                        <div
                          className={cn(
                            "transition-opacity duration-200",
                            showLoading && results.length > 0 && "opacity-50"
                          )}
                        >
                          {results.map((product) => (
                            <ProductRow
                              key={product.id}
                              product={product}
                              query={trimmedQuery}
                              onSelect={() => openProduct(product)}
                            />
                          ))}
                        </div>
                      </CommandGroup>
                    )}

                    {isSettled && !hasError && results.length === 0 && (
                      <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                        <SearchX className="size-10 text-muted-foreground/60" />
                        <div className="space-y-1">
                          <p className="text-base font-semibold text-foreground">
                            No products match “{trimmedQuery}”
                          </p>
                          <p className="text-[15px] text-muted-foreground">
                            Check the spelling, or try one of these categories:
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 pt-2">
                          {popularCategories.slice(0, 5).map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() =>
                                navigate(categoryHref(category.slug))
                              }
                              className="h-9 rounded-full border border-border px-4 text-sm font-medium hover:border-foreground/40"
                            >
                              {category.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {recentSearches.length > 0 && (
                      <CommandGroup
                        heading={
                          <span className="flex items-center justify-between">
                            Recent searches
                            <button
                              type="button"
                              onClick={() => setRecentRaw(null)}
                              className="text-xs font-medium tracking-normal text-muted-foreground normal-case hover:text-foreground"
                            >
                              Clear all
                            </button>
                          </span>
                        }
                        className={GROUP_CLASS}
                      >
                        {recentSearches.map((term) => (
                          <CommandItem
                            key={term}
                            value={`recent-${term}`}
                            onSelect={() => searchFor(term)}
                            className={ROW_CLASS}
                          >
                            <Clock className="size-4.5 text-muted-foreground" />
                            <span className="min-w-0 flex-1 truncate">
                              {term}
                            </span>
                            <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-data-selected/row:opacity-100" />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {popularCategories.length > 0 && (
                      <CommandGroup
                        heading="Popular categories"
                        className={GROUP_CLASS}
                      >
                        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                          {popularCategories.map((category) => (
                            <CommandItem
                              key={category.id}
                              value={`popular-${category.id}`}
                              onSelect={() =>
                                navigate(categoryHref(category.slug))
                              }
                              className={cn(ROW_CLASS, "gap-2.5 px-2 py-2")}
                            >
                              <Thumb
                                src={category.iconUrl}
                                size={36}
                                className="rounded-lg"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium">
                                  {category.name}
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                  {category.productCount} products
                                </span>
                              </span>
                            </CommandItem>
                          ))}
                        </div>
                      </CommandGroup>
                    )}

                    {navigation.trending.length > 0 && (
                      <>
                        <CommandSeparator className="mx-0 mt-3" />
                        <CommandGroup
                          heading={
                            <span className="flex items-center gap-1.5">
                              <TrendingUp className="size-3.5" />
                              Trending now
                            </span>
                          }
                          className={GROUP_CLASS}
                        >
                          {navigation.trending.map((product) => (
                            <ProductRow
                              key={product.id}
                              product={product}
                              query=""
                              onSelect={() => openProduct(product)}
                            />
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </>
                )}
              </CommandList>

              <aside
                aria-label="Product preview"
                className="hidden border-l border-border/70 bg-muted/30 md:block"
              >
                <PreviewPane product={previewProduct} onOpen={openProduct} />
              </aside>
            </div>

            {/* Footer */}
            <div className="hidden shrink-0 items-center justify-between border-t border-border/70 px-6 py-3 text-sm text-muted-foreground sm:flex">
              <div className="flex items-center gap-5">
                <span className="flex items-center gap-2">
                  <KbdGroup>
                    <Kbd>↑</Kbd>
                    <Kbd>↓</Kbd>
                  </KbdGroup>
                  Navigate
                </span>
                <span className="flex items-center gap-2">
                  <Kbd>
                    <CornerDownLeft />
                  </Kbd>
                  Open
                </span>
                <span className="flex items-center gap-2">
                  <Kbd>Esc</Kbd>
                  Close
                </span>
              </div>
              <span className="flex items-center gap-2">
                <Kbd>{shortcutLabel}</Kbd>
                anywhere to search
              </span>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
