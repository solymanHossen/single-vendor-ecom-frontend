'use client';

import * as React from 'react';
import { useActionState, useRef, useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { Camera, Loader2 } from 'lucide-react';
import { updateProfileAction, uploadAvatarAction } from '@/actions/profile.actions';
import type { UserProfile } from '@/lib/backend-auth';
import { getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const { update } = useSession();
  const [state, formAction, isPending] = useActionState(updateProfileAction, undefined);

  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [isUploading, startUpload] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (state?.profile) {
      update({
        name: state.profile.name,
        avatarUrl: state.profile.avatarUrl,
      });
    }
  }, [state?.profile, update]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    startUpload(async () => {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadAvatarAction(formData);

      if ('error' in result) {
        setUploadError(result.error);
        return;
      }

      // Persisted already (uploadAvatarAction saves it, not just uploads it)
      // — reflect it locally and push it into the session so the header
      // avatar updates immediately too, without a separate Save click.
      setAvatarUrl(result.profile.avatarUrl);
      await update({ name: result.profile.name, avatarUrl: result.profile.avatarUrl });
    });
  };

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar size="lg">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
            <AvatarFallback>{getInitials(profile.name, profile.email)}</AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50"
            title="Change avatar"
          >
            {isUploading ? <Loader2 className="size-3 animate-spin" /> : <Camera className="size-3" />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <div>
          <p className="text-sm font-medium">Profile photo</p>
          <p className="text-xs text-muted-foreground">JPG, PNG, or WebP.</p>
        </div>
      </div>

      {uploadError && (
        <Alert variant="destructive">
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state?.profile && (
        <Alert>
          <AlertDescription>Profile updated successfully.</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" defaultValue={profile.name ?? ''} placeholder="Jane Doe" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={profile.phone ?? ''} placeholder="+1 555-0100" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={profile.email} disabled />
        <p className="text-xs text-muted-foreground">Email can&apos;t be changed here.</p>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save changes'}
      </Button>
    </form>
  );
}
