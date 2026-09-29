'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { ApiError } from '@/lib/backend-client';
import { apiMessage } from '@/lib/backend-commerce';
import { CATALOG_CACHE_TAG } from '@/lib/backend-storefront';
import { tokenIfPermitted } from '@/lib/action-auth';
import { getAdminProducts } from '@/lib/backend-admin-products';
import * as api from '@/lib/backend-campaigns';
import type { CampaignDetail, CampaignInput } from '@/lib/backend-campaigns';
import { checkImage } from '@/lib/upload-rules';

type Result<T> = T | { error: string };

async function withCampaigns<T>(fallback: string, work: (token: string) => Promise<T>): Promise<Result<T>> {
  const token = await tokenIfPermitted('campaigns.manage');
  if (!token) return { error: "You don't have permission to manage campaigns" };
  try {
    return await work(token);
  } catch (e) {
    return { error: e instanceof ApiError ? apiMessage(e.data, e.message) : fallback };
  }
}

/** Campaign prices show on every card, product page and the homepage. */
function refresh(campaign?: { id: number; slug: string }): void {
  updateTag(CATALOG_CACHE_TAG);
  revalidatePath('/admin/campaigns');
  if (campaign) {
    revalidatePath(`/admin/campaigns/${campaign.id}`);
    revalidatePath(`/campaigns/${campaign.slug}`);
  }
  revalidatePath('/', 'layout');
}

export async function createCampaignAction(input: CampaignInput): Promise<Result<{ campaign: CampaignDetail }>> {
  return withCampaigns("Couldn't create the campaign", async (token) => {
    const campaign = await api.createCampaign(token, input);
    refresh(campaign);
    return { campaign };
  });
}

export async function updateCampaignAction(
  id: number,
  input: Partial<CampaignInput>,
): Promise<Result<{ campaign: CampaignDetail }>> {
  return withCampaigns("Couldn't save the campaign", async (token) => {
    const campaign = await api.updateCampaign(token, id, input);
    refresh(campaign);
    return { campaign };
  });
}

export async function endCampaignAction(id: number): Promise<Result<{ campaign: CampaignDetail }>> {
  return withCampaigns("Couldn't end the campaign", async (token) => {
    const campaign = await api.endCampaign(token, id);
    refresh(campaign);
    return { campaign };
  });
}

export async function deleteCampaignAction(id: number): Promise<Result<{ ok: true }>> {
  return withCampaigns("Couldn't delete the campaign", async (token) => {
    await api.deleteCampaign(token, id);
    refresh();
    return { ok: true as const };
  });
}

export async function uploadCampaignBannerAction(formData: FormData): Promise<Result<{ url: string }>> {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'Choose an image' };
  const problem = checkImage(file, 'banner');
  if (problem) return { error: problem.description };
  return withCampaigns("Couldn't upload the banner", async (token) => ({
    url: (await api.uploadCampaignBanner(token, file)).url,
  }));
}

export interface ProductOption {
  id: number;
  name: string;
  thumbnailUrl: string | null;
  basePrice: string;
  price: string;
  categoryName: string;
  isPublished: boolean;
  stockQuantity: number;
}

/** Product search for the campaign's product picker. */
export async function searchCampaignProductsAction(search: string): Promise<Result<{ items: ProductOption[] }>> {
  return withCampaigns("Couldn't search products", async (token) => {
    const page = await getAdminProducts(token, {
      page: 1,
      search: search.trim() || undefined,
      status: 'all',
      stock: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    });
    return {
      items: page.items.map((product) => ({
        id: product.id,
        name: product.name,
        thumbnailUrl: product.thumbnailUrl,
        basePrice: product.basePrice,
        price: product.discountPrice ?? product.basePrice,
        categoryName: product.category.name,
        isPublished: product.isPublished,
        stockQuantity: product.stockQuantity,
      })),
    };
  });
}
