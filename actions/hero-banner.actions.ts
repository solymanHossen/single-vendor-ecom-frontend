'use server';

import { revalidatePath, updateTag } from 'next/cache';
import type { Session } from 'next-auth';
import { auth } from '@/auth';
import { hasRole, SUPER_ADMIN_ROLES } from '@/auth.config';
import { ApiError } from '@/lib/backend-auth';
import * as backendHero from '@/lib/backend-hero';
import type { HeroBanner, HeroBannerInput, UpdateHeroBannerInput } from '@/lib/backend-hero';

function errorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiError) return e.message;
  return fallback;
}

// Defense in depth: the admin page itself also gates on SUPER_ADMIN_ROLES,
// but every mutating action re-checks here too since actions are directly
// callable regardless of which page rendered the form that invoked them.
async function requireSuperAdmin(): Promise<Session | null> {
  const session = await auth();
  if (!session?.accessToken || !hasRole(session.user?.role, SUPER_ADMIN_ROLES)) {
    return null;
  }
  return session;
}

// updateTag (not revalidateTag) since this only ever runs inside these
// Server Actions — it gives immediate read-your-own-writes semantics instead
// of revalidateTag's stale-while-revalidate behavior.
function revalidateHeroBanners(): void {
  updateTag('hero-banners');
  revalidatePath('/');
}

export async function uploadHeroBannerImageAction(
  formData: FormData,
): Promise<{ url: string; key: string } | { error: string }> {
  const session = await requireSuperAdmin();
  if (!session?.accessToken) return { error: 'Not authorized' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Choose an image to upload' };
  }
  if (!file.type.startsWith('image/')) {
    return { error: 'Banner image must be an image file' };
  }

  try {
    const uploaded = await backendHero.uploadHeroBannerImage(session.accessToken, file);
    return { url: uploaded.url, key: uploaded.key };
  } catch (e) {
    return { error: errorMessage(e, 'Failed to upload image') };
  }
}

export async function createHeroBannerAction(
  data: HeroBannerInput,
): Promise<{ banner: HeroBanner } | { error: string }> {
  const session = await requireSuperAdmin();
  if (!session?.accessToken) return { error: 'Not authorized' };

  try {
    const banner = await backendHero.createHeroBanner(session.accessToken, data);
    revalidateHeroBanners();
    return { banner };
  } catch (e) {
    return { error: errorMessage(e, 'Failed to create banner') };
  }
}

export async function updateHeroBannerAction(
  id: number,
  data: UpdateHeroBannerInput,
): Promise<{ banner: HeroBanner } | { error: string }> {
  const session = await requireSuperAdmin();
  if (!session?.accessToken) return { error: 'Not authorized' };

  try {
    const banner = await backendHero.updateHeroBanner(session.accessToken, id, data);
    revalidateHeroBanners();
    return { banner };
  } catch (e) {
    return { error: errorMessage(e, 'Failed to update banner') };
  }
}

export async function deleteHeroBannerAction(
  id: number,
): Promise<{ success: true } | { error: string }> {
  const session = await requireSuperAdmin();
  if (!session?.accessToken) return { error: 'Not authorized' };

  try {
    await backendHero.deleteHeroBanner(session.accessToken, id);
    revalidateHeroBanners();
    return { success: true };
  } catch (e) {
    return { error: errorMessage(e, 'Failed to delete banner') };
  }
}

export async function reorderHeroBannersAction(
  items: { id: number; sortOrder: number }[],
): Promise<{ success: true } | { error: string }> {
  const session = await requireSuperAdmin();
  if (!session?.accessToken) return { error: 'Not authorized' };

  try {
    await backendHero.reorderHeroBanners(session.accessToken, items);
    revalidateHeroBanners();
    return { success: true };
  } catch (e) {
    return { error: errorMessage(e, 'Failed to reorder banners') };
  }
}
