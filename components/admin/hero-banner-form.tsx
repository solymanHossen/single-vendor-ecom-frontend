'use client';

import * as React from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2 } from 'lucide-react';
import {
  createHeroBannerAction,
  updateHeroBannerAction,
  uploadHeroBannerImageAction,
} from '@/actions/hero-banner.actions';
import type { HeroBanner, HeroBannerPlacement } from '@/lib/backend-hero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface HeroBannerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner?: HeroBanner;
  defaultPlacement: HeroBannerPlacement;
  onSaved: (banner: HeroBanner) => void;
}

export function HeroBannerForm({
  open,
  onOpenChange,
  banner,
  defaultPlacement,
  onSaved,
}: HeroBannerFormProps) {
  const isEditing = !!banner;

  const [placement, setPlacement] = React.useState<HeroBannerPlacement>(
    banner?.placement ?? defaultPlacement,
  );
  const [title, setTitle] = React.useState(banner?.title ?? '');
  const [href, setHref] = React.useState(banner?.href ?? '');
  const [isActive, setIsActive] = React.useState(banner?.isActive ?? true);
  const [imageUrl, setImageUrl] = React.useState(banner?.imageUrl ?? '');
  const [imageKey, setImageKey] = React.useState(banner?.imageKey ?? '');

  const [isUploading, startUpload] = React.useTransition();
  const [isSaving, startSave] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Re-seed local state whenever the dialog is (re)opened for a different
  // banner, or for "add new" — Dialog keeps this component mounted between
  // opens, so state doesn't reset on its own. Adjusted during render (React's
  // recommended "resetting state when a prop changes" pattern) rather than in
  // an effect, which would cause an extra render before the reset is visible.
  const resetKey = open ? (banner ? `edit-${banner.id}` : `add-${defaultPlacement}`) : null;
  const [lastResetKey, setLastResetKey] = React.useState<string | null>(null);
  if (resetKey && resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setPlacement(banner?.placement ?? defaultPlacement);
    setTitle(banner?.title ?? '');
    setHref(banner?.href ?? '');
    setIsActive(banner?.isActive ?? true);
    setImageUrl(banner?.imageUrl ?? '');
    setImageKey(banner?.imageKey ?? '');
    setError(null);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    startUpload(async () => {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadHeroBannerImageAction(formData);

      if ('error' in result) {
        setError(result.error);
        return;
      }
      setImageUrl(result.url);
      setImageKey(result.key);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !imageKey) {
      setError('Upload a banner image first');
      return;
    }
    if (!title.trim() || !href.trim()) {
      setError('Title and link are required');
      return;
    }

    startSave(async () => {
      const data = {
        placement,
        title: title.trim(),
        href: href.trim(),
        imageUrl,
        imageKey,
        isActive,
      };
      const result = isEditing
        ? await updateHeroBannerAction(banner.id, data)
        : await createHeroBannerAction(data);

      if ('error' in result) {
        setError(result.error);
        return;
      }
      onSaved(result.banner);
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit banner' : 'Add banner'}</DialogTitle>
          <DialogDescription>
            {placement === 'MAIN' ? 'Main carousel slide' : 'Side banner card'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Placement</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={placement === 'MAIN' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlacement('MAIN')}
              >
                Main carousel
              </Button>
              <Button
                type="button"
                variant={placement === 'SIDE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlacement('SIDE')}
              >
                Side card
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Image</Label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={cn(
                'relative flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40 hover:bg-muted/60',
                isUploading && 'opacity-60',
              )}
            >
              {imageUrl ? (
                <Image src={imageUrl} alt="" fill className="object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <ImagePlus className="size-5" />
                  <span className="text-xs">Click to upload</span>
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="banner-title">Title</Label>
            <Input
              id="banner-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Next-Gen Gaming Rigs & RTX Flash Sale"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="banner-href">Link</Label>
            <Input
              id="banner-href"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              placeholder="/shop?category=gaming-pc"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">Visible on the storefront</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSaving || isUploading}>
              {isSaving ? 'Saving...' : isEditing ? 'Save changes' : 'Add banner'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
