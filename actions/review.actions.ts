'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { auth } from '@/auth';
import { ApiError } from '@/lib/backend-client';
import { apiMessage } from '@/lib/backend-commerce';
import { CATALOG_CACHE_TAG } from '@/lib/backend-storefront';
import * as api from '@/lib/backend-reviews';
import type { OwnReview, ReviewInput } from '@/lib/backend-reviews';
import { checkImage } from '@/lib/upload-rules';

type Result<T> = T | { error: string };

async function signedIn<T>(fallback: string, work: (token: string) => Promise<T>): Promise<Result<T>> {
  const session = await auth();
  if (!session?.accessToken) return { error: 'Please sign in first' };
  try {
    return await work(session.accessToken);
  } catch (e) {
    return { error: e instanceof ApiError ? apiMessage(e.data, e.message) : fallback };
  }
}

/** A rating changes the product page, its card stars and "Top rated". */
function refreshProduct(productId: number): void {
  updateTag(api.reviewsTag(productId));
  updateTag(CATALOG_CACHE_TAG);
  revalidatePath(`/products/${productId}`);
  revalidatePath('/dashboard/orders', 'layout');
}

export async function uploadReviewPhotoAction(formData: FormData): Promise<Result<{ url: string }>> {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'Choose a photo' };
  const problem = checkImage(file, 'attachment');
  if (problem) return { error: problem.description };
  return signedIn("Couldn't upload the photo", async (token) => ({
    url: (await api.uploadReviewPhoto(token, file)).url,
  }));
}

export async function createReviewAction(
  productId: number,
  input: ReviewInput,
): Promise<Result<{ review: OwnReview }>> {
  return signedIn("Couldn't post your review", async (token) => {
    const review = await api.createReview(token, productId, input);
    refreshProduct(productId);
    return { review };
  });
}

export async function updateReviewAction(
  productId: number,
  id: number,
  input: ReviewInput,
): Promise<Result<{ review: OwnReview }>> {
  return signedIn("Couldn't save your review", async (token) => {
    const review = await api.updateReview(token, id, input);
    refreshProduct(productId);
    return { review };
  });
}

export async function deleteReviewAction(productId: number, id: number): Promise<Result<{ ok: true }>> {
  return signedIn("Couldn't delete your review", async (token) => {
    await api.deleteReview(token, id);
    refreshProduct(productId);
    return { ok: true as const };
  });
}

/** No cache refresh: a vote shouldn't reshuffle the page under the shopper. */
export async function toggleHelpfulAction(
  id: number,
): Promise<Result<{ helpful: boolean; helpfulCount: number }>> {
  return signedIn("Couldn't save your vote", (token) => api.toggleHelpful(token, id));
}
