"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CircleAlert,
  CircleX,
  Eye,
  EyeOff,
  FilePen,
  Layers,
  Loader2,
  MoreHorizontal,
  Package,
  PackageSearch,
  Pencil,
  Search,
  Send,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import {
  deleteProductAction,
  setProductsPublishedAction,
} from "@/actions/product.actions"
import { adminProductsHref } from "@/lib/admin-product-params"
import type {
  AdminProductPage,
  AdminProductQuery,
  AdminProductRow,
  AdminProductSort,
  CategoryNode,
} from "@/lib/backend-admin-products"
import { ADMIN_PAGE_SIZE } from "@/lib/backend-admin-products"
import { formatPrice } from "@/lib/format"
import { productHref } from "@/lib/routes"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AdminPagination } from "./admin-pagination"
import { ProductThumb } from "./product-thumb"
import { StockBadge } from "./stock-badge"

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Dhaka",
})

// ── Status tabs ─────────────────────────────────────────────────────────────

interface Tab {
  key: string
  label: string
  count: number
  icon: LucideIcon
  patch: Pick<AdminProductQuery, "status" | "stock">
  tone?: "warning" | "critical"
}

function StatusTabs({
  page,
  query,
  navigate,
}: {
  page: AdminProductPage
  query: AdminProductQuery
  navigate: (href: string) => void
}) {
  const { summary } = page
  const tabs: Tab[] = [
    { key: "all", label: "All products", count: summary.total, icon: Package, patch: { status: "all", stock: "all" } },
    { key: "published", label: "Published", count: summary.published, icon: Eye, patch: { status: "published", stock: "all" } },
    { key: "draft", label: "Drafts", count: summary.draft, icon: FilePen, patch: { status: "draft", stock: "all" } },
    { key: "low", label: "Low stock", count: summary.lowStock, icon: CircleAlert, patch: { status: "all", stock: "low" }, tone: "warning" },
    { key: "out", label: "Out of stock", count: summary.outOfStock, icon: CircleX, patch: { status: "all", stock: "out" }, tone: "critical" },
  ]

  return (
    <nav
      aria-label="Filter by status"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5"
    >
      {tabs.map((tab) => {
        const active =
          query.status === tab.patch.status && query.stock === tab.patch.stock
        const href = adminProductsHref(query, tab.patch)
        const Icon = tab.icon
        const alert = tab.tone && tab.count > 0
        return (
          <Link
            key={tab.key}
            href={href}
            aria-current={active ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault()
              navigate(href)
            }}
            className={cn(
              "group flex items-center gap-3.5 rounded-2xl border bg-card p-4 transition-[border-color,box-shadow] duration-150",
              active
                ? "border-foreground/80 shadow-[0_0_0_1px_var(--foreground)]"
                : "border-border/70 hover:border-foreground/30"
            )}
          >
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                alert && tab.tone === "warning"
                  ? "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                  : alert && tab.tone === "critical"
                    ? "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300"
                    : "bg-muted text-foreground"
              )}
            >
              <Icon className="size-[18px]" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm text-muted-foreground">
                {tab.label}
              </span>
              <span className="block text-2xl leading-tight font-semibold tracking-tight text-foreground tabular-nums">
                {tab.count}
              </span>
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

// ── Toolbar ─────────────────────────────────────────────────────────────────

function CategoryFilter({
  categories,
  value,
  onChange,
}: {
  categories: CategoryNode[]
  value: number | undefined
  onChange: (id: number | undefined) => void
}) {
  return (
    <Select
      value={value ? String(value) : "all"}
      onValueChange={(next) => onChange(next === "all" ? undefined : Number(next))}
    >
      <SelectTrigger className="h-11! w-full rounded-xl text-[15px] sm:w-60">
        <SelectValue placeholder="All categories" />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-96 rounded-xl">
        <SelectItem value="all">All categories</SelectItem>
        <SelectSeparator />
        {categories.map((parent) =>
          parent.children.length > 0 ? (
            <SelectGroup key={parent.id}>
              <SelectLabel>{parent.name}</SelectLabel>
              {parent.children.map((child) => (
                <SelectItem key={child.id} value={String(child.id)}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ) : (
            <SelectItem key={parent.id} value={String(parent.id)}>
              {parent.name}
            </SelectItem>
          )
        )}
      </SelectContent>
    </Select>
  )
}

function SearchField({
  initial,
  onSearch,
  pending,
}: {
  initial: string
  onSearch: (value: string) => void
  pending: boolean
}) {
  const [value, setValue] = React.useState(initial)
  // Follow the URL when it changes elsewhere (e.g. "Clear filters").
  const [lastInitial, setLastInitial] = React.useState(initial)
  if (initial !== lastInitial) {
    setLastInitial(initial)
    setValue(initial)
  }

  const onSearchRef = React.useRef(onSearch)
  React.useEffect(() => {
    onSearchRef.current = onSearch
  })

  React.useEffect(() => {
    if (value.trim() === initial) return
    const timer = window.setTimeout(() => onSearchRef.current(value.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [value, initial])

  return (
    <div className="relative min-w-0 flex-1">
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search by name or SKU…"
        aria-label="Search products"
        className="h-11 w-full rounded-xl border border-input bg-background pr-10 pl-11 text-[15px] shadow-xs transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15 [&::-webkit-search-cancel-button]:hidden"
      />
      {pending ? (
        <Loader2 className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : (
        value && (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )
      )}
    </div>
  )
}

// ── Table ───────────────────────────────────────────────────────────────────

function SortHeader({
  label,
  field,
  query,
  navigate,
  className,
}: {
  label: string
  field: AdminProductSort
  query: AdminProductQuery
  navigate: (href: string) => void
  className?: string
}) {
  const active = query.sortBy === field
  // Text columns start A→Z; numbers and dates start high→low.
  const firstOrder = field === "name" ? "asc" : "desc"
  const nextOrder = active ? (query.sortOrder === "asc" ? "desc" : "asc") : firstOrder
  const href = adminProductsHref(query, { sortBy: field, sortOrder: nextOrder })
  const Icon = !active ? ArrowUpDown : query.sortOrder === "asc" ? ArrowUp : ArrowDown
  return (
    <TableHead
      className={className}
      aria-sort={active ? (query.sortOrder === "asc" ? "ascending" : "descending") : undefined}
    >
      <Link
        href={href}
        onClick={(event) => {
          event.preventDefault()
          navigate(href)
        }}
        className={cn(
          "-mx-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-muted hover:text-foreground",
          active && "text-foreground"
        )}
      >
        {label}
        <Icon className={cn("size-3.5", !active && "opacity-50")} aria-hidden="true" />
      </Link>
    </TableHead>
  )
}

function PriceCell({ row }: { row: AdminProductRow }) {
  if (row.discountPrice === null) {
    return (
      <span className="font-medium text-foreground tabular-nums">
        {formatPrice(row.basePrice)}
      </span>
    )
  }
  return (
    <span className="flex flex-col">
      <span className="font-medium text-foreground tabular-nums">
        {formatPrice(row.discountPrice)}
      </span>
      <span className="text-[13px] text-muted-foreground tabular-nums line-through">
        {formatPrice(row.basePrice)}
      </span>
    </span>
  )
}

type PublishUpdate = { ids: number[]; isPublished: boolean }

export function ProductCatalog({
  page,
  query,
  categories,
}: {
  page: AdminProductPage
  query: AdminProductQuery
  categories: CategoryNode[]
}) {
  const router = useRouter()
  const [isNavigating, startNavigation] = React.useTransition()
  const [, startMutation] = React.useTransition()
  const [selected, setSelected] = React.useState<ReadonlySet<number>>(new Set())
  const [deleteTarget, setDeleteTarget] = React.useState<AdminProductRow | null>(null)
  const [isDeleting, startDelete] = React.useTransition()

  const [rows, applyOptimistic] = React.useOptimistic(
    page.items,
    (current: AdminProductRow[], update: PublishUpdate) =>
      current.map((row) =>
        update.ids.includes(row.id) ? { ...row, isPublished: update.isPublished } : row
      )
  )

  // A new page of results starts with nothing selected.
  const pageKey = page.items.map((row) => row.id).join(",")
  const [lastPageKey, setLastPageKey] = React.useState(pageKey)
  if (pageKey !== lastPageKey) {
    setLastPageKey(pageKey)
    setSelected(new Set())
  }

  const navigate = React.useCallback(
    (href: string, replace = false) =>
      startNavigation(() => (replace ? router.replace(href) : router.push(href))),
    [router]
  )

  const setPublished = (ids: number[], isPublished: boolean, label: string) => {
    startMutation(async () => {
      applyOptimistic({ ids, isPublished })
      const result = await setProductsPublishedAction(ids, isPublished)
      if ("error" in result) {
        toast.error("Couldn't update products", { description: result.error })
        return
      }
      setSelected(new Set())
      toast.success(isPublished ? "Published" : "Moved to drafts", {
        id: "product-status",
        description: isPublished
          ? `${label} now ${ids.length === 1 ? "shows" : "show"} in the store.`
          : `${label} ${ids.length === 1 ? "is" : "are"} hidden from shoppers.`,
      })
    })
  }

  const confirmDelete = () => {
    const target = deleteTarget
    if (!target) return
    startDelete(async () => {
      const result = await deleteProductAction(target.id)
      if ("error" in result) {
        toast.error("Couldn't delete product", { description: result.error })
        return
      }
      setDeleteTarget(null)
      toast.success("Product deleted", { description: `“${target.name}” was removed.` })
    })
  }

  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.id))
  const someSelected = !allSelected && rows.some((row) => selected.has(row.id))
  const toggleAll = (checked: boolean) =>
    setSelected(checked ? new Set(rows.map((row) => row.id)) : new Set())
  const toggleOne = (id: number, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })

  const hasFilters =
    !!query.search || !!query.categoryId || query.status !== "all" || query.stock !== "all"
  const selectedIds = [...selected]
  const lowThreshold = page.summary.lowStockThreshold

  return (
    <div className="space-y-6">
      <StatusTabs page={page} query={query} navigate={navigate} />

      <section className="overflow-hidden rounded-3xl border border-border/70 bg-card">
        {/* Toolbar ↔ bulk bar share one row so the table never jumps. */}
        <div className="flex min-h-[76px] flex-wrap items-center gap-3 border-b border-border/70 px-6 py-4">
          {selectedIds.length > 0 ? (
            <>
              <p className="mr-auto text-[15px] font-medium text-foreground">
                <span className="tabular-nums">{selectedIds.length}</span> selected
              </p>
              <Button
                variant="outline"
                className="h-10 rounded-xl"
                onClick={() =>
                  setPublished(selectedIds, true, `${selectedIds.length} ${selectedIds.length === 1 ? "product" : "products"}`)
                }
              >
                <Send className="size-4" />
                Publish
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-xl"
                onClick={() =>
                  setPublished(selectedIds, false, `${selectedIds.length} ${selectedIds.length === 1 ? "product" : "products"}`)
                }
              >
                <EyeOff className="size-4" />
                Unpublish
              </Button>
              <Button
                variant="ghost"
                className="h-10 rounded-xl"
                onClick={() => setSelected(new Set())}
              >
                Clear
              </Button>
            </>
          ) : (
            <>
              <SearchField
                initial={query.search ?? ""}
                pending={isNavigating}
                onSearch={(value) =>
                  navigate(adminProductsHref(query, { search: value || undefined }), true)
                }
              />
              <CategoryFilter
                categories={categories}
                value={query.categoryId}
                onChange={(categoryId) => navigate(adminProductsHref(query, { categoryId }))}
              />
            </>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <PackageSearch className="size-7 text-muted-foreground" />
            </span>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">
                {hasFilters ? "No products match these filters" : "No products yet"}
              </p>
              <p className="text-[15px] text-muted-foreground">
                {hasFilters
                  ? "Try a different search or clear the filters."
                  : "Add your first product to start selling."}
              </p>
            </div>
            {hasFilters ? (
              <Button
                variant="outline"
                className="h-10 rounded-xl"
                onClick={() => navigate("/admin/products")}
              >
                Clear filters
              </Button>
            ) : (
              <Button asChild className="h-10 rounded-xl">
                <Link href="/admin/products/new">Add product</Link>
              </Button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              "transition-opacity duration-150",
              isNavigating && "pointer-events-none opacity-60"
            )}
            aria-busy={isNavigating}
          >
            <Table className="text-[15px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent [&>th]:h-12 [&>th]:text-[13px] [&>th]:font-medium [&>th]:text-muted-foreground">
                  <TableHead className="w-12 pl-6">
                    <Checkbox
                      checked={allSelected ? true : someSelected ? "indeterminate" : false}
                      onCheckedChange={(checked) => toggleAll(checked === true)}
                      aria-label="Select all products on this page"
                    />
                  </TableHead>
                  <SortHeader label="Product" field="name" query={query} navigate={navigate} />
                  <TableHead>Category</TableHead>
                  <SortHeader label="Price" field="basePrice" query={query} navigate={navigate} />
                  <SortHeader label="Stock" field="stockQuantity" query={query} navigate={navigate} />
                  <TableHead>Status</TableHead>
                  <SortHeader label="Updated" field="updatedAt" query={query} navigate={navigate} />
                  <TableHead className="w-14 pr-6">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const isSelected = selected.has(row.id)
                  const editHref = `/admin/products/${row.id}`
                  return (
                    <TableRow
                      key={row.id}
                      data-state={isSelected ? "selected" : undefined}
                      className="[&>td]:py-3.5"
                    >
                      <TableCell className="pl-6">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => toggleOne(row.id, checked === true)}
                          aria-label={`Select ${row.name}`}
                        />
                      </TableCell>
                      <TableCell className="max-w-[26rem]">
                        <Link href={editHref} className="group flex items-center gap-3.5">
                          <ProductThumb url={row.thumbnailUrl} size={52} />
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-foreground group-hover:underline group-hover:underline-offset-4">
                              {row.name}
                            </span>
                            <span className="block truncate font-mono text-[13px] text-muted-foreground">
                              {row.sku}
                            </span>
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.category.name}</TableCell>
                      <TableCell>
                        <PriceCell row={row} />
                      </TableCell>
                      <TableCell>
                        <span className="flex flex-col items-start gap-1">
                          <StockBadge quantity={row.stockQuantity} lowThreshold={lowThreshold} />
                          <span className="flex items-center gap-1.5 pl-1 text-[13px] text-muted-foreground tabular-nums">
                            {row.stockQuantity} units
                            {row.variantCount > 0 && (
                              <>
                                <span aria-hidden="true">·</span>
                                <Layers className="size-3" aria-hidden="true" />
                                {row.variantCount} {row.variantCount === 1 ? "variant" : "variants"}
                              </>
                            )}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <label className="inline-flex cursor-pointer items-center gap-2.5">
                          <Switch
                            checked={row.isPublished}
                            onCheckedChange={(checked) =>
                              setPublished([row.id], checked, `“${row.name}”`)
                            }
                            aria-label={`${row.isPublished ? "Unpublish" : "Publish"} ${row.name}`}
                          />
                          <span
                            className={cn(
                              "text-sm font-medium",
                              row.isPublished ? "text-foreground" : "text-muted-foreground"
                            )}
                          >
                            {row.isPublished ? "Live" : "Draft"}
                          </span>
                        </label>
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums whitespace-nowrap">
                        {dateFormatter.format(new Date(row.updatedAt))}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9 rounded-lg"
                              aria-label={`Actions for ${row.name}`}
                            >
                              <MoreHorizontal className="size-[18px]" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
                            <DropdownMenuItem asChild className="h-10 rounded-lg px-3 text-[15px]">
                              <Link href={editHref}>
                                <Pencil className="size-4" />
                                Edit product
                              </Link>
                            </DropdownMenuItem>
                            {row.isPublished && (
                              <DropdownMenuItem asChild className="h-10 rounded-lg px-3 text-[15px]">
                                <Link href={productHref(row.id)} target="_blank">
                                  <Eye className="size-4" />
                                  View in store
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="h-10 rounded-lg px-3 text-[15px]"
                              onSelect={() =>
                                setPublished([row.id], !row.isPublished, `“${row.name}”`)
                              }
                            >
                              {row.isPublished ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Send className="size-4" />
                              )}
                              {row.isPublished ? "Move to drafts" : "Publish"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              className="h-10 rounded-lg px-3 text-[15px]"
                              onSelect={() => setDeleteTarget(row)}
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <AdminPagination
          query={query}
          total={page.meta.total}
          totalPages={page.meta.totalPages}
          pageSize={ADMIN_PAGE_SIZE}
        />
      </section>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          {deleteTarget && deleteTarget.orderCount > 0 ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>This product can&apos;t be deleted</AlertDialogTitle>
                <AlertDialogDescription className="text-[15px]">
                  “{deleteTarget.name}” appears in {deleteTarget.orderCount}{" "}
                  {deleteTarget.orderCount === 1 ? "order" : "orders"}, and order history must
                  keep pointing at it. Move it to drafts to hide it from the store instead.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Close</AlertDialogCancel>
                {deleteTarget.isPublished && (
                  <AlertDialogAction
                    className="rounded-xl"
                    onClick={() =>
                      setPublished([deleteTarget.id], false, `“${deleteTarget.name}”`)
                    }
                  >
                    Move to drafts
                  </AlertDialogAction>
                )}
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this product?</AlertDialogTitle>
                <AlertDialogDescription className="text-[15px]">
                  “{deleteTarget?.name}” and its images and variants will be removed permanently.
                  This can&apos;t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl" disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  className="rounded-xl"
                  disabled={isDeleting}
                  onClick={(event) => {
                    event.preventDefault()
                    confirmDelete()
                  }}
                >
                  {isDeleting && <Loader2 className="size-4 animate-spin" />}
                  Delete product
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
