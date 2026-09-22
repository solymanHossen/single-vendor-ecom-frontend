'use client';

import * as React from 'react';
import Image from 'next/image';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteHeroBannerAction, reorderHeroBannersAction } from '@/actions/hero-banner.actions';
import type { HeroBanner, HeroBannerPlacement } from '@/lib/backend-hero';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { HeroBannerForm } from './hero-banner-form';

const PLACEMENT_LABELS: Record<HeroBannerPlacement, { title: string; description: string }> = {
  MAIN: { title: 'Main carousel', description: 'Full-width rotating slides' },
  SIDE: { title: 'Side cards', description: 'Two stacked cards beside the carousel' },
};

export function HeroBannerManager({ banners: initialBanners }: { banners: HeroBanner[] }) {
  const [banners, setBanners] = React.useState(initialBanners);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingBanner, setEditingBanner] = React.useState<HeroBanner | undefined>();
  const [formPlacement, setFormPlacement] = React.useState<HeroBannerPlacement>('MAIN');
  const [pendingId, setPendingId] = React.useState<number | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const groups = (['MAIN', 'SIDE'] as const).map((placement) => ({
    placement,
    items: banners
      .filter((b) => b.placement === placement)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));

  const openAdd = (placement: HeroBannerPlacement) => {
    setEditingBanner(undefined);
    setFormPlacement(placement);
    setFormOpen(true);
  };

  const openEdit = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setFormPlacement(banner.placement);
    setFormOpen(true);
  };

  const handleSaved = (banner: HeroBanner) => {
    setBanners((prev) => {
      const exists = prev.some((b) => b.id === banner.id);
      return exists ? prev.map((b) => (b.id === banner.id ? banner : b)) : [...prev, banner];
    });
  };

  const handleDelete = (banner: HeroBanner) => {
    if (!confirm(`Delete "${banner.title}"? This can't be undone.`)) return;
    setPendingId(banner.id);
    startTransition(async () => {
      const result = await deleteHeroBannerAction(banner.id);
      setPendingId(null);
      if (!('error' in result)) {
        setBanners((prev) => prev.filter((b) => b.id !== banner.id));
      }
    });
  };

  const handleMove = (placement: HeroBannerPlacement, index: number, direction: -1 | 1) => {
    const items = groups.find((g) => g.placement === placement)?.items ?? [];
    const current = items[index];
    const target = items[index + direction];
    if (!current || !target) return;

    const swapped = [
      { id: current.id, sortOrder: target.sortOrder },
      { id: target.id, sortOrder: current.sortOrder },
    ];

    setPendingId(current.id);
    startTransition(async () => {
      const result = await reorderHeroBannersAction(swapped);
      setPendingId(null);
      if (!('error' in result)) {
        setBanners((prev) =>
          prev.map((b) => {
            const swap = swapped.find((s) => s.id === b.id);
            return swap ? { ...b, sortOrder: swap.sortOrder } : b;
          }),
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <Card key={group.placement}>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>{PLACEMENT_LABELS[group.placement].title}</CardTitle>
              <CardDescription>{PLACEMENT_LABELS[group.placement].description}</CardDescription>
            </div>
            <Button size="sm" onClick={() => openAdd(group.placement)}>
              <Plus className="size-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {group.items.length === 0 && (
              <p className="text-sm text-muted-foreground">No banners yet.</p>
            )}
            {group.items.map((banner, index) => (
              <div
                key={banner.id}
                className="flex items-center gap-3 rounded-lg border border-border p-2"
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image src={banner.imageUrl} alt="" fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{banner.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{banner.href}</p>
                </div>
                <Badge variant={banner.isActive ? 'outline' : 'secondary'}>
                  {banner.isActive ? 'Active' : 'Hidden'}
                </Badge>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === 0 || isPending}
                    onClick={() => handleMove(group.placement, index, -1)}
                    aria-label="Move up"
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === group.items.length - 1 || isPending}
                    onClick={() => handleMove(group.placement, index, 1)}
                    aria-label="Move down"
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(banner)}
                    aria-label="Edit"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isPending && pendingId === banner.id}
                    onClick={() => handleDelete(banner)}
                    aria-label="Delete"
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <HeroBannerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        banner={editingBanner}
        defaultPlacement={formPlacement}
        onSaved={handleSaved}
      />
    </div>
  );
}
