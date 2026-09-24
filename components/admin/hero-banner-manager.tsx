"use client"

import * as React from "react"
import Image from "next/image"
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  ImagePlus,
  Images,
  Info,
  LayoutPanelLeft,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
  type LucideIcon,
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
  { tab: string; description: string; aspect: string; empty: string }
> = {
  MAIN: {
    tab: "Main carousel",
    description:
      "Large rotating slides at the top of the homepage, shown left to right in this order.",
    aspect: "aspect-video",
    empty: "Add your first slide to bring the homepage hero to life.",
  },
  SIDE: {
    tab: "Side cards",
    description: `Cards stacked beside the carousel. The first ${SIDE_CARD_SLOTS} live cards are shown.`,
    aspect: "aspect-4/3",
    empty:
      "Add side cards to promote a product or category next to the carousel.",
  },
}

// ── Small building blocks ───────────────────────────────────────────────────

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

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "neutral",
}: {
  icon: LucideIcon
  label: string
  value: string
  hint: string
  tone?: "neutral" | "warning"
}) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-border/70 bg-card p-5">
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-2xl",
          tone === "warning"
            ? "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
            : "bg-muted text-foreground"
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
        <p className="truncate text-sm text-muted-foreground">{hint}</p>
      </div>
    </div>
  )
}

/**
 * A faithful miniature of the storefront hero (8/4 grid: carousel + two
 * stacked cards), built from what is live right now. Clicking a tile edits it.
 */
function HomepagePreview({
  slides,
  sideCards,
  onEdit,
}: {
  slides: HeroBanner[]
  sideCards: HeroBanner[]
  onEdit: (banner: HeroBanner) => void
}) {
  const [slideIndex, setSlideIndex] = React.useState(0)
  const current = slides[Math.min(slideIndex, Math.max(0, slides.length - 1))]

  return (
    <section
      aria-labelledby="preview-heading"
      className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2
            id="preview-heading"
            className="text-lg font-semibold text-foreground"
          >
            Homepage preview
          </h2>
          <p className="text-[15px] text-muted-foreground">
            Exactly what shoppers see right now. Click a banner to edit it.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="h-10 rounded-xl px-4 text-sm"
        >
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" />
            Open homepage
          </a>
        </Button>
      </div>

      <div className="grid gap-3 rounded-2xl bg-muted/50 p-3 lg:grid-cols-12">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-muted lg:col-span-8">
          {current ? (
            <button
              type="button"
              onClick={() => onEdit(current)}
              className="group absolute inset-0 text-left"
              aria-label={`Edit slide "${current.title}"`}
            >
              <Image
                src={current.imageUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-black/70 to-transparent p-4 text-white">
                <span className="line-clamp-1 text-base font-semibold">
                  {current.title}
                </span>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-black opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Pencil className="size-3" />
                  Edit
                </span>
              </span>
            </button>
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              No live slides
            </span>
          )}
          {slides.length > 1 && (
            <div className="absolute top-3 left-3 flex gap-1.5 rounded-full bg-black/40 px-2 py-1.5 backdrop-blur">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setSlideIndex(index)}
                  aria-label={`Preview slide ${index + 1}`}
                  aria-current={index === slideIndex}
                  className={cn(
                    "h-1.5 rounded-full bg-white transition-all",
                    index === slideIndex
                      ? "w-5"
                      : "w-1.5 opacity-60 hover:opacity-100"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 lg:col-span-4 lg:grid-cols-1">
          {Array.from({ length: SIDE_CARD_SLOTS }, (_, index) => {
            const card = sideCards[index]
            return (
              <div
                key={index}
                className="relative aspect-video overflow-hidden rounded-xl bg-muted lg:aspect-auto"
              >
                {card ? (
                  <button
                    type="button"
                    onClick={() => onEdit(card)}
                    className="group absolute inset-0"
                    aria-label={`Edit side card "${card.title}"`}
                  >
                    <Image
                      src={card.imageUrl}
                      alt=""
                      fill
                      sizes="25vw"
                      className="object-cover"
                    />
                    <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-black opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      <Pencil className="size-3" />
                      Edit
                    </span>
                  </button>
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground">
                    Empty slot
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Manager ─────────────────────────────────────────────────────────────────

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
  const [dragId, setDragId] = React.useState<number | null>(null)
  const [dropId, setDropId] = React.useState<number | null>(null)
  const [, startTransition] = React.useTransition()

  const itemsFor = React.useCallback(
    (placement: HeroBannerPlacement) =>
      banners
        .filter((banner) => banner.placement === placement)
        // id breaks ties exactly like the backend's ORDER BY sort_order, id.
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    [banners]
  )

  const mainItems = itemsFor("MAIN")
  const sideItems = itemsFor("SIDE")
  const liveSlides = mainItems.filter((banner) => banner.isActive)
  const liveSide = sideItems.filter((banner) => banner.isActive)
  const hiddenCount = banners.filter((banner) => !banner.isActive).length

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

  /**
   * Moves one banner to a new position and persists the placement's full
   * order renumbered 0..n-1 — used by both drag-and-drop and the arrow
   * buttons. Renumbering (not swapping) also repairs any tied positions.
   */
  const moveTo = (
    placement: HeroBannerPlacement,
    fromIndex: number,
    toIndex: number
  ) => {
    const items = itemsFor(placement)
    if (
      fromIndex === toIndex ||
      !items[fromIndex] ||
      toIndex < 0 ||
      toIndex >= items.length
    )
      return

    const reordered = [...items]
    const [moved] = reordered.splice(fromIndex, 1)
    if (!moved) return
    reordered.splice(toIndex, 0, moved)

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
    setBusyId(moved.id)
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
        description="The first thing shoppers see. Arrange, preview and publish the homepage carousel and side cards."
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

      <div className="space-y-6">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl bg-destructive/8 px-5 py-4 text-[15px] text-destructive"
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

        <section
          aria-label="Banner summary"
          className="grid gap-4 sm:grid-cols-3"
        >
          <SummaryCard
            icon={Images}
            label="Carousel slides live"
            value={`${liveSlides.length} of ${mainItems.length}`}
            hint={
              liveSlides.length === 0
                ? "The hero is empty"
                : "Rotating on the homepage"
            }
            tone={liveSlides.length === 0 ? "warning" : "neutral"}
          />
          <SummaryCard
            icon={LayoutPanelLeft}
            label="Side card slots"
            value={`${Math.min(liveSide.length, SIDE_CARD_SLOTS)} of ${SIDE_CARD_SLOTS} filled`}
            hint={
              liveSide.length > SIDE_CARD_SLOTS
                ? `${liveSide.length - SIDE_CARD_SLOTS} live card(s) not shown`
                : liveSide.length < SIDE_CARD_SLOTS
                  ? "Add a card to fill the slot"
                  : "Both slots in use"
            }
            tone={liveSide.length === SIDE_CARD_SLOTS ? "neutral" : "warning"}
          />
          <SummaryCard
            icon={EyeOff}
            label="Hidden drafts"
            value={String(hiddenCount)}
            hint={
              hiddenCount === 0
                ? "Everything is published"
                : "Saved but not on the homepage"
            }
          />
        </section>

        <HomepagePreview
          slides={liveSlides}
          sideCards={liveSide.slice(0, SIDE_CARD_SLOTS)}
          onEdit={openEdit}
        />

        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as HeroBannerPlacement)}
          className="gap-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
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
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <GripVertical className="size-4" />
              Drag cards to reorder
            </p>
          </div>

          {(Object.keys(PLACEMENTS) as HeroBannerPlacement[]).map(
            (placement) => {
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
                        {SIDE_CARD_SLOTS} appear on the homepage. Hide or
                        reorder the rest.
                      </p>
                    </div>
                  )}

                  {items.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
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
                    <ul className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                      {items.map((banner, index) => {
                        const busy = busyId === banner.id
                        if (banner.isActive) liveRank += 1
                        const offHomepage =
                          placement === "SIDE" &&
                          banner.isActive &&
                          liveRank > SIDE_CARD_SLOTS
                        const isDragging = dragId === banner.id
                        const isDropTarget =
                          dropId === banner.id && dragId !== banner.id

                        return (
                          <li
                            key={banner.id}
                            draggable={busyId === null}
                            onDragStart={(event) => {
                              event.dataTransfer.effectAllowed = "move"
                              setDragId(banner.id)
                            }}
                            onDragOver={(event) => {
                              if (dragId === null) return
                              event.preventDefault()
                              if (dropId !== banner.id) setDropId(banner.id)
                            }}
                            onDragLeave={() =>
                              setDropId((current) =>
                                current === banner.id ? null : current
                              )
                            }
                            onDrop={(event) => {
                              event.preventDefault()
                              const from = items.findIndex(
                                (item) => item.id === dragId
                              )
                              if (from !== -1) moveTo(placement, from, index)
                              setDragId(null)
                              setDropId(null)
                            }}
                            onDragEnd={() => {
                              setDragId(null)
                              setDropId(null)
                            }}
                            className={cn(
                              "group/card flex flex-col overflow-hidden rounded-3xl border bg-card transition-[border-color,box-shadow,opacity] duration-150",
                              isDropTarget
                                ? "border-primary ring-4 ring-primary/15"
                                : "border-border/70 hover:border-foreground/20",
                              isDragging && "opacity-50"
                            )}
                          >
                            <div
                              className={cn(
                                "relative overflow-hidden bg-muted",
                                config.aspect
                              )}
                            >
                              <Image
                                src={banner.imageUrl}
                                alt=""
                                fill
                                sizes="(min-width: 1536px) 30vw, (min-width: 640px) 45vw, 100vw"
                                className={cn(
                                  "object-cover transition-[filter,opacity] duration-200",
                                  !banner.isActive && "opacity-50 grayscale"
                                )}
                              />
                              <span className="absolute top-3 left-3 flex size-9 items-center justify-center rounded-full bg-background/95 text-sm font-semibold text-foreground tabular-nums shadow-sm backdrop-blur">
                                {index + 1}
                              </span>
                              <span
                                className="absolute top-3 right-3 flex size-9 cursor-grab items-center justify-center rounded-full bg-background/95 text-muted-foreground shadow-sm backdrop-blur active:cursor-grabbing"
                                aria-hidden="true"
                              >
                                <GripVertical className="size-4.5" />
                              </span>
                              <span
                                className={cn(
                                  "absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm",
                                  banner.isActive
                                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                                    : "bg-background/95 text-muted-foreground"
                                )}
                              >
                                {banner.isActive ? (
                                  <Eye className="size-3.5" />
                                ) : (
                                  <EyeOff className="size-3.5" />
                                )}
                                {banner.isActive ? "Live" : "Hidden"}
                              </span>
                              {busy && (
                                <span className="absolute inset-0 flex items-center justify-center bg-background/50">
                                  <Loader2 className="size-6 animate-spin" />
                                </span>
                              )}
                            </div>

                            <div className="flex flex-1 flex-col gap-4 p-5">
                              <div className="min-w-0 space-y-1.5">
                                <p className="line-clamp-2 text-lg leading-snug font-semibold text-foreground">
                                  {banner.title}
                                </p>
                                <a
                                  href={banner.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex max-w-full items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                                >
                                  <span className="truncate">
                                    {banner.href}
                                  </span>
                                  <ExternalLink className="size-3.5 shrink-0" />
                                </a>
                                {offHomepage && (
                                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                    Not shown — only {SIDE_CARD_SLOTS} side
                                    cards fit
                                  </p>
                                )}
                              </div>

                              <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/70 pt-4">
                                <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground">
                                  <Switch
                                    checked={banner.isActive}
                                    disabled={busy}
                                    onCheckedChange={(checked) =>
                                      handleToggle(banner, checked)
                                    }
                                    aria-label={`Show "${banner.title}" on the homepage`}
                                  />
                                  {banner.isActive ? "Live" : "Hidden"}
                                </label>
                                <div className="flex items-center">
                                  <IconAction
                                    label="Move earlier"
                                    onClick={() =>
                                      moveTo(placement, index, index - 1)
                                    }
                                    disabled={index === 0 || busyId !== null}
                                  >
                                    <ArrowLeft className="size-4.5" />
                                  </IconAction>
                                  <IconAction
                                    label="Move later"
                                    onClick={() =>
                                      moveTo(placement, index, index + 1)
                                    }
                                    disabled={
                                      index === items.length - 1 ||
                                      busyId !== null
                                    }
                                  >
                                    <ArrowRight className="size-4.5" />
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
                              </div>
                            </div>
                          </li>
                        )
                      })}

                      <li>
                        <button
                          type="button"
                          onClick={openAdd}
                          className="flex h-full min-h-64 w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border bg-card/50 text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                        >
                          <span className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                            <Plus className="size-6" />
                          </span>
                          <span className="text-[15px] font-medium">
                            Add {placement === "MAIN" ? "slide" : "side card"}
                          </span>
                        </button>
                      </li>
                    </ul>
                  )}
                </TabsContent>
              )
            }
          )}
        </Tabs>
      </div>

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
