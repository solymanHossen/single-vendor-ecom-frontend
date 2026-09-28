'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { tokenIfPermitted } from '@/lib/action-auth';
import { ApiError } from '@/lib/backend-client';
import { apiMessage } from '@/lib/backend-commerce';
import * as api from '@/lib/backend-settings';
import type { StoreSettings, StoreSettingsPatch } from '@/lib/backend-settings';
import { checkImage } from '@/lib/upload-rules';

type Result<T> = T | { error: string };

const superAdminToken = () => tokenIfPermitted('settings.manage');

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof ApiError ? apiMessage(e.data, e.message) : fallback;
}

export async function updateSettingsAction(
  patch: StoreSettingsPatch,
): Promise<Result<{ settings: StoreSettings }>> {
  const token = await superAdminToken();
  if (!token) return { error: "You don't have permission to change store settings" };
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
  if (!token) return { error: "You don't have permission to change store settings" };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'Choose an image to upload' };
  const problem = checkImage(file, 'logo');
  if (problem) return { error: problem.description };

  try {
    const uploaded = await api.uploadBrandingImage(token, file);
    return { url: uploaded.url };
  } catch (e) {
    return { error: errorMessage(e, "Couldn't upload the image") };
  }
}
