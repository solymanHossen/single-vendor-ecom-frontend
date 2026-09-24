"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Search,
  ArrowRight,
  Clock,
  X,
  TrendingUp,
  LayoutGrid,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Command as CommandPrimitive } from "cmdk"
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
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
import { cn } from "@/lib/utils"
import { discountPercent, formatPrice } from "@/lib/format"
import { isOptimizableImage } from "@/lib/images"
import { categoryHref, productHref, searchHref } from "@/lib/routes"
import { useShortcutLabel, useStorageValue } from "@/hooks/use-storage-value"
import type {
  NavigationProduct,
  SearchResponse,
  SearchResult,
  StorefrontNavigation,
} from "@/lib/storefront-types"

const DEBOUNCE_MS = 250
const MIN_QUERY_LENGTH = 2
const MAX_RECENT_SEARCHES = 5
const MAX_CATEGORY_MATCHES = 4
const RECENT_STORAGE_KEY = "aura:recent-searches"

interface CategoryMatch {
  id: number
  name: string
  slug: string
  parentName: string | null
  productCount: number
}

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

interface SettledSearch {
  term: string
  data: SearchResponse | null
  failed: boolean
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
            className="rounded-sm bg-primary/15 text-foreground"
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

function ProductRow({
  product,
  query,
  onSelect,
}: {
  product: SearchResult | NavigationProduct
  query: string
  onSelect: () => void
}) {
  const percent = discountPercent(product.basePrice, product.discountPrice)

  return (
    <CommandItem
      value={`product-${product.id}`}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg p-2"
    >
      <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
        {product.thumbnailUrl && (
          <Image
            src={product.thumbnailUrl}
            alt=""
            fill
            sizes="44px"
            unoptimized={!isOptimizableImage(product.thumbnailUrl)}
            className="object-cover"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">
          <Highlight text={product.name} query={query} />
        </p>
        <p className="text-[11px] text-muted-foreground">
          {product.categoryName}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs font-semibold text-foreground">
          {formatPrice(product.discountPrice ?? product.basePrice)}
        </p>
        {percent > 0 && (
          <p className="text-[10px] font-semibold text-primary">−{percent}%</p>
        )}
      </div>
    </CommandItem>
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
  // Only ever written from the fetch callbacks; loading/error/empty states
  // are all derived from it, so no state is set synchronously in an effect.
  const [settled, setSettled] = React.useState<SettledSearch | null>(null)
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
      .then((data) => setSettled({ term: debouncedTerm, data, failed: false }))
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

  const popularCategories = React.useMemo(
    () =>
      navigation.categories
        .flatMap((parent) => parent.children)
        .sort((a, b) => b.productCount - a.productCount)
        .slice(0, 6),
    [navigation.categories]
  )

  const handleQueryChange = (value: string) => {
    setQuery(value)
    onSearchChange?.(value)
  }

  const navigate = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  const rememberAndSearch = (term: string) => {
    const clean = term.trim()
    if (!clean) return
    const next = [
      clean,
      ...recentSearches.filter(
        (item) => item.toLowerCase() !== clean.toLowerCase()
      ),
    ].slice(0, MAX_RECENT_SEARCHES)
    setRecentRaw(JSON.stringify(next))
    navigate(searchHref(clean))
  }

  const openProduct = (id: number) => {
    if (hasQuery) {
      const next = [
        trimmedQuery,
        ...recentSearches.filter((item) => item !== trimmedQuery),
      ].slice(0, MAX_RECENT_SEARCHES)
      setRecentRaw(JSON.stringify(next))
    }
    navigate(productHref(id))
  }

  const clearRecent = () => setRecentRaw(null)

  // Derived search state for the current query.
  const isSettled =
    hasQuery && settled?.term === trimmedQuery && debouncedTerm === trimmedQuery
  const showLoading = hasQuery && !isSettled
  const hasError = isSettled && settled.failed
  const response = hasQuery ? (settled?.data ?? null) : null
  // The previous query's results stay on screen (dimmed) while the next loads.
  const results = response?.results ?? []

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
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden h-5 -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground select-none md:inline-flex">
          {shortcutLabel}
        </kbd>
      </Button>

      {/* Palette */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="top-[15%] translate-y-0 overflow-hidden rounded-xl! p-0 sm:max-w-xl"
          showCloseButton={false}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Search the store</DialogTitle>
            <DialogDescription>
              Search products and categories.
            </DialogDescription>
          </DialogHeader>
          {/* Results come from the server already ranked, so cmdk's own fuzzy
              filter is disabled — it would otherwise hide valid matches. */}
          <Command
            shouldFilter={false}
            className="**:data-[slot=command-input-wrapper]:h-12"
          >
            <CommandInput
              placeholder="Search products, brands, categories…"
              value={query}
              onValueChange={handleQueryChange}
              onKeyDown={(event) => {
                // Enter with nothing highlighted still runs a full search.
                if (event.key === "Enter" && hasQuery && results.length === 0) {
                  event.preventDefault()
                  rememberAndSearch(trimmedQuery)
                }
              }}
            />
            <CommandList className="max-h-[min(460px,65vh)] p-2">
              {hasQuery ? (
                <>
                  <CommandGroup>
                    <CommandItem
                      value="__search-all"
                      onSelect={() => rememberAndSearch(trimmedQuery)}
                      className="flex cursor-pointer items-center justify-between rounded-lg p-2.5"
                    >
                      <span className="flex items-center gap-2 text-xs">
                        <Search className="size-4 text-primary" />
                        Search for{" "}
                        <strong className="font-semibold">
                          “{trimmedQuery}”
                        </strong>
                      </span>
                      <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
                        {isSettled && response
                          ? `${response.total} result${response.total === 1 ? "" : "s"}`
                          : null}
                        <ArrowRight className="size-3.5" />
                      </span>
                    </CommandItem>
                  </CommandGroup>

                  {categoryMatches.length > 0 && (
                    <CommandGroup heading="Categories">
                      {categoryMatches.map((category) => (
                        <CommandItem
                          key={category.id}
                          value={`category-${category.id}`}
                          onSelect={() => navigate(categoryHref(category.slug))}
                          className="flex cursor-pointer items-center justify-between rounded-lg p-2"
                        >
                          <span className="flex items-center gap-2 text-xs">
                            <LayoutGrid className="size-4 text-muted-foreground" />
                            <span>
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
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {category.productCount}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  <CommandGroup heading="Products">
                    {showLoading && results.length === 0 && (
                      <div
                        className="space-y-1 p-1"
                        aria-live="polite"
                        aria-busy="true"
                      >
                        {Array.from({ length: 3 }, (_, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-2"
                          >
                            <div className="size-11 animate-pulse rounded-md bg-muted" />
                            <div className="flex-1 space-y-1.5">
                              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                              <div className="h-2.5 w-1/4 animate-pulse rounded bg-muted" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {hasError && (
                      <p
                        className="flex items-center gap-2 p-3 text-xs text-destructive"
                        role="alert"
                      >
                        <AlertCircle className="size-4" />
                        Search is unavailable right now. Please try again.
                      </p>
                    )}

                    {isSettled && !hasError && results.length === 0 && (
                      <p className="p-3 text-xs text-muted-foreground">
                        No products match “{trimmedQuery}”. Try a brand or
                        category name.
                      </p>
                    )}

                    <div
                      className={cn(
                        showLoading &&
                          results.length > 0 &&
                          "opacity-60 transition-opacity"
                      )}
                    >
                      {results.map((product) => (
                        <ProductRow
                          key={product.id}
                          product={product}
                          query={trimmedQuery}
                          onSelect={() => openProduct(product.id)}
                        />
                      ))}
                    </div>
                    {showLoading && results.length > 0 && (
                      <Loader2 className="mx-auto my-1 size-4 animate-spin text-muted-foreground" />
                    )}
                  </CommandGroup>
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
                            onClick={clearRecent}
                            className="text-[10px] font-medium text-muted-foreground normal-case hover:text-foreground"
                          >
                            Clear
                          </button>
                        </span>
                      }
                    >
                      {recentSearches.map((term) => (
                        <CommandItem
                          key={term}
                          value={`recent-${term}`}
                          onSelect={() => rememberAndSearch(term)}
                          className="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-xs"
                        >
                          <Clock className="size-3.5 text-muted-foreground" />
                          {term}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {popularCategories.length > 0 && (
                    <CommandGroup heading="Popular categories">
                      <div className="flex flex-wrap gap-1.5 p-2">
                        {popularCategories.map((category) => (
                          <CommandPrimitive.Item
                            key={category.id}
                            value={`popular-${category.id}`}
                            onSelect={() =>
                              navigate(categoryHref(category.slug))
                            }
                            className="cursor-pointer rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-foreground transition-colors hover:bg-primary hover:text-primary-foreground data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
                          >
                            {category.name}
                          </CommandPrimitive.Item>
                        ))}
                      </div>
                    </CommandGroup>
                  )}

                  {navigation.trending.length > 0 && (
                    <>
                      <CommandSeparator />
                      <CommandGroup
                        heading={
                          <span className="flex items-center gap-1.5">
                            <TrendingUp className="size-3" />
                            Trending now
                          </span>
                        }
                      >
                        {navigation.trending.map((product) => (
                          <ProductRow
                            key={product.id}
                            product={product}
                            query=""
                            onSelect={() => openProduct(product.id)}
                          />
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </>
              )}
            </CommandList>

            <div className="hidden items-center justify-between border-t border-border px-3 py-2 text-[10px] text-muted-foreground sm:flex">
              <span className="flex items-center gap-3">
                <span>
                  <kbd className="font-mono">↑↓</kbd> navigate
                </span>
                <span>
                  <kbd className="font-mono">↵</kbd> open
                </span>
                <span>
                  <kbd className="font-mono">esc</kbd> close
                </span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1 hover:text-foreground"
                aria-label="Close search"
              >
                <X className="size-3" />
              </button>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
