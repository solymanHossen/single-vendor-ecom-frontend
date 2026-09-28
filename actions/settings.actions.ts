'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { auth } from '@/auth';
import { hasRole, SUPER_ADMIN_ROLES } from '@/auth.config';
import { ApiError } from '@/lib/backend-client';
import { apiMessage } from '@/lib/backend-commerce';
import * as api from '@/lib/backend-settings';
import type { StoreSettings, StoreSettingsPatch } from '@/lib/backend-settings';

type Result<T> = T | { error: string };

const MAX_BRANDING_IMAGE_BYTES = 2 * 1024 * 1024;

async function superAdminToken(): Promise<string | null> {
  const session = await auth();
  if (!session?.accessToken || !hasRole(session.user?.role, SUPER_ADMIN_ROLES)) return null;
  return session.accessToken;
}

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof ApiError ? apiMessage(e.data, e.message) : fallback;
}

export async function updateSettingsAction(
  patch: StoreSettingsPatch,
): Promise<Result<{ settings: StoreSettings }>> {
  const token = await superAdminToken();
  if (!token) return { error: 'Only a super admin can change store settings' };
  try {
    const settings = await api.updateStoreSettings(token, patch);
    // Brand, footer, banner and titles render from these on every page.
    updateTag(api.STORE_SETTINGS_CACHE_TAG);
    revalidatePath('/', 'layout');
    return { settings };
  } catch (e) {
    return { error: errorMessage(e, "Couldn't save settings") };
  }
}

export async function uploadBrandingImageAction(
  formData: FormData,
): Promise<Result<{ url: string }>> {
  const token = await superAdminToken();
  if (!token) return { error: 'Only a super admin can change store settings' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'Choose an image to upload' };
  if (!file.type.startsWith('image/')) return { error: 'Only image files can be used' };
  if (file.size > MAX_BRANDING_IMAGE_BYTES) return { error: 'Keep the image under 2 MB' };

  try {
    const uploaded = await api.uploadBrandingImage(token, file);
    return { url: uploaded.url };
  } catch (e) {
    return { error: errorMessage(e, "Couldn't upload the image") };
  }
}
