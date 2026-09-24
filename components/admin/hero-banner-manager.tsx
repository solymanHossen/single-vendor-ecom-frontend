"use client"

import * as React from "react"
import Image from "next/image"
import {
  ArrowDown,
  ArrowUp,
  CircleAlert,
  ExternalLink,
  ImagePlus,
  Info,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react"
import {
  deleteHeroBannerAction,
  reorderHeroBannersAction,
  updateHeroBannerAction,
} from "@/actions/hero-banner.actions"
import type { HeroBanner, HeroBannerPlacement } from "@/lib/backend-hero"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
import { cn } from "@/lib/utils"
import { AdminPageHeader } from "./admin-page-header"
import { HeroBannerForm } from "./hero-banner-form"

/** The homepage renders exactly two side cards beside the carousel. */
const SIDE_CARD_SLOTS = 2

const PLACEMENTS: Record<
  HeroBannerPlacement,
  {
    tab: string
    title: string
    description: string
    aspect: string
    empty: string
  }
> = {
  MAIN: {
    tab: "Main carousel",
    title: "Main carousel",
    description:
      "Large rotating slides at the top of the homepage. Shown in this order.",
    aspect: "aspect-video w-44 sm:w-56",
    empty: "Add your first slide to bring the homepage hero to life.",
  },
  SIDE: {
    tab: "Side cards",
    title: "Side cards",
    description: `The ${SIDE_CARD_SLOTS} cards stacked beside the carousel. The first ${SIDE_CARD_SLOTS} live cards are shown.`,
    aspect: "aspect-4/3 w-36 sm:w-44",
    empty:
      "Add side cards to promote a product or category next to the carousel.",
  },
}

function IconAction({
  label,
  onClick,
  disabled,
  destructive = false,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  destructive?: boolean
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          className={cn(
            "size-10 rounded-xl text-muted-foreground hover:text-foreground",
            destructive && "hover:bg-destructive/10 hover:text-destructive"
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function HeroBannerManager({
  banners: initialBanners,
}: {
  banners: HeroBanner[]
}) {
  const [banners, setBanners] = React.useState(initialBanners)
  const [tab, setTab] = React.useState<HeroBannerPlacement>("MAIN")
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingBanner, setEditingBanner] = React.useState<
    HeroBanner | undefined
  >()
  const [deleteTarget, setDeleteTarget] = React.useState<HeroBanner | null>(
    null
  )
  const [busyId, setBusyId] = React.useState<number | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [, startTransition] = React.useTransition()

  const itemsFor = (placement: HeroBannerPlacement) =>
    banners
      .filter((banner) => banner.placement === placement)
      // id breaks ties exactly like the backend's ORDER BY sort_order, id.
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)

  const openAdd = () => {
    setEditingBanner(undefined)
    setFormOpen(true)
  }

  const openEdit = (banner: HeroBanner) => {
    setEditingBanner(banner)
    setFormOpen(true)
  }

  const handleSaved = (banner: HeroBanner) => {
    setBanners((prev) =>
      prev.some((item) => item.id === banner.id)
        ? prev.map((item) => (item.id === banner.id ? banner : item))
        : [...prev, banner]
    )
    setTab(banner.placement)
  }

  // Optimistic: flip immediately, roll back if the server refuses.
  const handleToggle = (banner: HeroBanner, isActive: boolean) => {
    setError(null)
    setBusyId(banner.id)
    setBanners((prev) =>
      prev.map((item) => (item.id === banner.id ? { ...item, isActive } : item))
    )
    startTransition(async () => {
      const result = await updateHeroBannerAction(banner.id, { isActive })
      setBusyId(null)
      if ("error" in result) {
        setBanners((prev) =>
          prev.map((item) =>
            item.id === banner.id ? { ...item, isActive: !isActive } : item
          )
        )
        setError(result.error)
      }
    })
  }

  // Sends the placement's full order renumbered 0..n-1, not just a swap:
  // swapping two equal sortOrders (e.g. both 0) would change nothing, while
  // renumbering always produces exactly the order the admin sees.
  const handleMove = (
    placement: HeroBannerPlacement,
    index: number,
    direction: -1 | 1
  ) => {
    const items = itemsFor(placement)
    const current = items[index]
    const target = items[index + direction]
    if (!current || !target) return

    const reordered = [...items]
    reordered[index] = target
    reordered[index + direction] = current
    const nextOrder = reordered.map((item, position) => ({
      id: item.id,
      sortOrder: position,
    }))
    const previousOrder = items.map((item) => ({
      id: item.id,
      sortOrder: item.sortOrder,
    }))
    const apply = (pairs: Array<{ id: number; sortOrder: number }>) =>
      setBanners((prev) =>
        prev.map((item) => {
          const match = pairs.find((pair) => pair.id === item.id)
          return match ? { ...item, sortOrder: match.sortOrder } : item
        })
      )

    setError(null)
    setBusyId(current.id)
    apply(nextOrder)
    startTransition(async () => {
      const result = await reorderHeroBannersAction(nextOrder)
      setBusyId(null)
      if ("error" in result) {
        apply(previousOrder)
        setError(result.error)
      }
    })
  }

  const confirmDelete = () => {
    const banner = deleteTarget
    if (!banner) return
    setError(null)
    setBusyId(banner.id)
    startTransition(async () => {
      const result = await deleteHeroBannerAction(banner.id)
      setBusyId(null)
      setDeleteTarget(null)
      if ("error" in result) {
        setError(result.error)
        return
      }
      setBanners((prev) => prev.filter((item) => item.id !== banner.id))
    })
  }

  return (
    <>
      <AdminPageHeader
        title="Hero banners"
        description="The first thing shoppers see. Control the homepage carousel and the cards beside it."
        actions={
          <Button
            onClick={openAdd}
            className="h-11 rounded-xl px-5 text-[15px] font-semibold"
          >
            <Plus className="size-5" />
            New banner
          </Button>
        }
      />

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-2xl bg-destructive/8 px-5 py-4 text-[15px] text-destructive"
        >
          <CircleAlert className="mt-0.5 size-5 shrink-0" />
          <p className="flex-1">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="rounded-lg p-1 hover:bg-destructive/10"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as HeroBannerPlacement)}
        className="gap-6"
      >
        <TabsList className="h-12! rounded-2xl bg-muted p-1">
          {(Object.keys(PLACEMENTS) as HeroBannerPlacement[]).map(
            (placement) => (
              <TabsTrigger
                key={placement}
                value={placement}
                className="h-10 gap-2 rounded-xl px-5 text-[15px] font-medium data-[state=active]:shadow-sm"
              >
                {PLACEMENTS[placement].tab}
                <span className="rounded-full bg-foreground/8 px-2 py-0.5 text-xs tabular-nums">
                  {itemsFor(placement).length}
                </span>
              </TabsTrigger>
            )
          )}
        </TabsList>

        {(Object.keys(PLACEMENTS) as HeroBannerPlacement[]).map((placement) => {
          const config = PLACEMENTS[placement]
          const items = itemsFor(placement)
          const liveCount = items.filter((item) => item.isActive).length
          let liveRank = 0

          return (
            <TabsContent
              key={placement}
              value={placement}
              className="space-y-5"
            >
              <p className="text-[15px] text-muted-foreground">
                {config.description}
              </p>

              {placement === "SIDE" && liveCount > SIDE_CARD_SLOTS && (
                <div className="flex items-start gap-3 rounded-2xl bg-amber-50 px-5 py-4 text-[15px] text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  <Info className="mt-0.5 size-5 shrink-0" />
                  <p>
                    {liveCount} side cards are live, but only the first{" "}
                    {SIDE_CARD_SLOTS} appear on the homepage. Hide or reorder
                    the rest.
                  </p>
                </div>
              )}

              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-background px-6 py-16 text-center">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                    <ImagePlus className="size-6 text-muted-foreground" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-foreground">
                      No banners yet
                    </p>
                    <p className="text-[15px] text-muted-foreground">
                      {config.empty}
                    </p>
                  </div>
                  <Button
                    onClick={openAdd}
                    className="h-11 rounded-xl px-5 text-[15px] font-semibold"
                  >
                    <Plus className="size-5" />
                    New banner
                  </Button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {items.map((banner, index) => {
                    const busy = busyId === banner.id
                    if (banner.isActive) liveRank += 1
                    const offHomepage =
                      placement === "SIDE" &&
                      banner.isActive &&
                      liveRank > SIDE_CARD_SLOTS
                    return (
                      <li
                        key={banner.id}
                        className="flex flex-wrap items-center gap-5 rounded-3xl border border-border/70 bg-background p-4 sm:flex-nowrap"
                      >
                        <span className="hidden w-6 text-center text-base font-semibold text-muted-foreground tabular-nums sm:block">
                          {index + 1}
                        </span>

                        <div
                          className={cn(
                            "relative shrink-0 overflow-hidden rounded-2xl bg-muted",
                            config.aspect
                          )}
                        >
                          <Image
                            src={banner.imageUrl}
                            alt=""
                            fill
                            sizes="224px"
                            className={cn(
                              "object-cover transition-[filter,opacity] duration-200",
                              !banner.isActive && "opacity-50 grayscale"
                            )}
                          />
                          {busy && (
                            <span className="absolute inset-0 flex items-center justify-center bg-background/50">
                              <Loader2 className="size-5 animate-spin" />
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-2">
                          <p className="line-clamp-2 text-base font-semibold text-foreground sm:text-lg">
                            {banner.title}
                          </p>
                          <a
                            href={banner.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex max-w-full items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                          >
                            <span className="truncate">{banner.href}</span>
                            <ExternalLink className="size-3.5 shrink-0" />
                          </a>
                          {offHomepage && (
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                              Not shown — only {SIDE_CARD_SLOTS} side cards fit
                            </p>
                          )}
                        </div>

                        <label className="flex shrink-0 cursor-pointer items-center gap-3 rounded-2xl bg-muted/60 px-4 py-2.5">
                          <Switch
                            checked={banner.isActive}
                            disabled={busy}
                            onCheckedChange={(checked) =>
                              handleToggle(banner, checked)
                            }
                            aria-label={`Show "${banner.title}" on the homepage`}
                          />
                          <span
                            className={cn(
                              "w-12 text-sm font-semibold",
                              banner.isActive
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-muted-foreground"
                            )}
                          >
                            {banner.isActive ? "Live" : "Hidden"}
                          </span>
                        </label>

                        <div className="flex shrink-0 items-center gap-0.5">
                          <IconAction
                            label="Move up"
                            onClick={() => handleMove(placement, index, -1)}
                            disabled={index === 0 || busyId !== null}
                          >
                            <ArrowUp className="size-4.5" />
                          </IconAction>
                          <IconAction
                            label="Move down"
                            onClick={() => handleMove(placement, index, 1)}
                            disabled={
                              index === items.length - 1 || busyId !== null
                            }
                          >
                            <ArrowDown className="size-4.5" />
                          </IconAction>
                          <IconAction
                            label="Edit banner"
                            onClick={() => openEdit(banner)}
                          >
                            <Pencil className="size-4.5" />
                          </IconAction>
                          <IconAction
                            label="Delete banner"
                            onClick={() => setDeleteTarget(banner)}
                            disabled={busy}
                            destructive
                          >
                            <Trash2 className="size-4.5" />
                          </IconAction>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      <HeroBannerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        banner={editingBanner}
        defaultPlacement={tab}
        onSaved={handleSaved}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-3xl p-6 sm:max-w-md!">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              Delete this banner?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px]">
              “{deleteTarget?.title}” will be removed from the homepage and its
              image deleted. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-11 rounded-xl px-5 text-[15px]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(event) => {
                event.preventDefault()
                confirmDelete()
              }}
              className="h-11 rounded-xl px-5 text-[15px] font-semibold"
            >
              {busyId === deleteTarget?.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete banner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
