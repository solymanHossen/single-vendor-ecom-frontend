'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { ApiError } from '@/lib/backend-client';
import { apiMessage } from '@/lib/backend-commerce';
import { CATALOG_CACHE_TAG } from '@/lib/backend-storefront';
import { tokenIfPermitted } from '@/lib/action-auth';
import * as api from '@/lib/backend-reviews';
import type { AdminReview } from '@/lib/backend-reviews';

type Result<T> = T | { error: string };

async function withModeration<T>(fallback: string, work: (token: string) => Promise<T>): Promise<Result<T>> {
  const token = await tokenIfPermitted('reviews.moderate');
  if (!token) return { error: "You don't have permission to moderate reviews" };
  try {
    return await work(token);
  } catch (e) {
    return { error: e instanceof ApiError ? apiMessage(e.data, e.message) : fallback };
  }
}

function refresh(review: AdminReview): void {
  updateTag(api.reviewsTag(review.product.id));
  updateTag(CATALOG_CACHE_TAG);
  revalidatePath('/admin/reviews');
  revalidatePath('/admin', 'layout');
}

export async function moderateReviewAction(
  id: number,
  status: 'PUBLISHED' | 'HIDDEN',
): Promise<Result<{ review: AdminReview }>> {
  return withModeration("Couldn't update the review", async (token) => {
    const review = await api.moderateReview(token, id, status);
    refresh(review);
    return { review };
  });
}

export async function replyToReviewAction(id: number, text: string): Promise<Result<{ review: AdminReview }>> {
  return withModeration("Couldn't save the response", async (token) => {
    const review = await api.replyToReview(token, id, text);
    refresh(review);
    return { review };
  });
}

export async function removeReviewReplyAction(id: number): Promise<Result<{ review: AdminReview }>> {
  return withModeration("Couldn't remove the response", async (token) => {
    const review = await api.removeReviewReply(token, id);
    refresh(review);
    return { review };
  });
}
