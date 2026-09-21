'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import * as backendAuth from '@/lib/backend-auth';
import { ApiError, type UserProfile } from '@/lib/backend-auth';
import { updateProfileSchema } from '@/lib/validators';

function errorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiError) return e.message;
  return fallback;
}

export async function updateProfileAction(
  _state: unknown,
  formData: FormData,
): Promise<{ error?: string; profile?: UserProfile }> {
  const session = await auth();
  if (!session?.accessToken) return { error: 'Not signed in' };

  const name = formData.get('name');
  const phone = formData.get('phone');
  const avatarUrl = formData.get('avatarUrl');

  const raw = {
    name: typeof name === 'string' && name.trim() !== '' ? name.trim() : undefined,
    phone: typeof phone === 'string' ? (phone.trim() === '' ? null : phone.trim()) : undefined,
    avatarUrl:
      typeof avatarUrl === 'string' && avatarUrl.trim() !== '' ? avatarUrl.trim() : undefined,
  };

  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  try {
    const profile = await backendAuth.updateProfile(session.accessToken, parsed.data);
    revalidatePath('/profile');
    return { profile };
  } catch (e) {
    return { error: errorMessage(e, 'Failed to update profile') };
  }
}

// Avatar changes take effect immediately on upload — unlike name/phone,
// there's no separate "Save changes" step, matching how avatar upload works
// almost everywhere else. Does the upload *and* the PATCH in one action so
// the client only needs to wait on a single round trip.
export async function uploadAvatarAction(
  formData: FormData,
): Promise<{ profile: UserProfile } | { error: string }> {
  const session = await auth();
  if (!session?.accessToken) return { error: 'Not signed in' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Choose an image to upload' };
  }
  if (!file.type.startsWith('image/')) {
    return { error: 'Avatar must be an image file' };
  }

  try {
    const uploaded = await backendAuth.uploadAvatar(session.accessToken, file);
    const profile = await backendAuth.updateProfile(session.accessToken, {
      avatarUrl: uploaded.url,
    });
    revalidatePath('/profile');
    return { profile };
  } catch (e) {
    return { error: errorMessage(e, 'Failed to save avatar') };
  }
}
