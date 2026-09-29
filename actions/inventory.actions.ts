'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { ApiError } from '@/lib/backend-client';
import { apiMessage } from '@/lib/backend-commerce';
import { CATALOG_CACHE_TAG } from '@/lib/backend-storefront';
import { tokenIfPermitted } from '@/lib/action-auth';
import * as api from '@/lib/backend-inventory';
import type { AdjustInput, ImportResult, InventoryUnit } from '@/lib/backend-inventory';

type Result<T> = T | { error: string };

function failure(e: unknown, fallback: string): { error: string } {
  return { error: e instanceof ApiError ? apiMessage(e.data, e.message) : fallback };
}

/** Stock shows on every storefront card and product page. */
function refresh(): void {
  updateTag(CATALOG_CACHE_TAG);
  revalidatePath('/admin/inventory', 'layout');
  revalidatePath('/admin/products', 'layout');
}

export async function adjustStockAction(input: AdjustInput): Promise<Result<{ unit: InventoryUnit }>> {
  const token = await tokenIfPermitted('catalog.manage');
  if (!token) return { error: "You don't have permission to change stock" };
  try {
    const unit = await api.adjustStock(token, input);
    refresh();
    return { unit };
  } catch (e) {
    return failure(e, "Couldn't update stock");
  }
}

export async function importStockAction(csv: string, dryRun: boolean): Promise<Result<{ result: ImportResult }>> {
  const token = await tokenIfPermitted('catalog.manage');
  if (!token) return { error: "You don't have permission to change stock" };
  try {
    const result = await api.importStock(token, csv, dryRun);
    if (!dryRun) refresh();
    return { result };
  } catch (e) {
    return failure(e, dryRun ? "Couldn't read the file" : "Couldn't import stock");
  }
}

/** Public — any shopper, signed in or not. */
export async function subscribeStockAlertAction(
  productId: number,
  email: string,
  variantId: number | null,
): Promise<Result<{ ok: true }>> {
  try {
    await api.subscribeStockAlert(productId, { email, variantId });
    return { ok: true as const };
  } catch (e) {
    return failure(e, "Couldn't save your request");
  }
}
