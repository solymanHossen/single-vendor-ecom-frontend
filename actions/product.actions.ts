'use server';

import { revalidatePath, updateTag } from 'next/cache';
import type { Session } from 'next-auth';
import { auth } from '@/auth';
import { ADMIN_ROLES, hasRole } from '@/auth.config';
import { ApiError } from '@/lib/backend-client';
import * as api from '@/lib/backend-admin-products';
import type {
  AdminProduct,
  ProductInput,
  ProductVariant,
  VariantInput,
} from '@/lib/backend-admin-products';
import { CATALOG_CACHE_TAG, NAVIGATION_CACHE_TAG } from '@/lib/backend-storefront';

type Result<T> = T | { error: string };

function errorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiError) return e.message;
  return fallback;
}

// Defense in depth: the admin layout gates on ADMIN_ROLES too, but actions
// are directly callable, so every one re-checks.
async function requireAdmin(): Promise<Session | null> {
  const session = await auth();
  if (!session?.accessToken || !hasRole(session.user?.role, ADMIN_ROLES)) return null;
  return session;
}

// updateTag (not revalidateTag): only ever runs inside Server Actions, so
// the storefront shows the change on the very next request.
function revalidateCatalog(productId?: number): void {
  updateTag(CATALOG_CACHE_TAG);
  updateTag(NAVIGATION_CACHE_TAG);
  revalidatePath('/admin/products');
  if (productId) revalidatePath(`/admin/products/${productId}`);
}

async function run<T>(
  fallback: string,
  work: (accessToken: string) => Promise<T>,
): Promise<Result<T>> {
  const session = await requireAdmin();
  if (!session?.accessToken) return { error: 'Not authorized' };
  try {
    return await work(session.accessToken);
  } catch (e) {
    return { error: errorMessage(e, fallback) };
  }
}

export async function uploadProductImageAction(
  formData: FormData,
): Promise<Result<{ url: string }>> {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'Choose an image to upload' };
  if (!file.type.startsWith('image/')) return { error: 'Only image files can be uploaded' };

  return run('Failed to upload image', async (token) => {
    const uploaded = await api.uploadProductImage(token, file);
    return { url: uploaded.url };
  });
}

export async function createProductAction(
  data: ProductInput,
): Promise<Result<{ product: AdminProduct }>> {
  return run('Failed to create product', async (token) => {
    const product = await api.createProduct(token, data);
    revalidateCatalog(product.id);
    return { product };
  });
}

export async function updateProductAction(
  id: number,
  data: Partial<ProductInput>,
): Promise<Result<{ product: AdminProduct }>> {
  return run('Failed to save product', async (token) => {
    const product = await api.updateProduct(token, id, data);
    revalidateCatalog(id);
    return { product };
  });
}

export async function deleteProductAction(id: number): Promise<Result<{ ok: true }>> {
  return run('Failed to delete product', async (token) => {
    await api.deleteProduct(token, id);
    revalidateCatalog();
    return { ok: true as const };
  });
}

export async function setProductsPublishedAction(
  ids: number[],
  isPublished: boolean,
): Promise<Result<{ updated: number }>> {
  return run('Failed to update products', async (token) => {
    const updated = await api.setProductsPublished(token, ids, isPublished);
    revalidateCatalog();
    return { updated };
  });
}

export async function createVariantAction(
  productId: number,
  data: VariantInput,
): Promise<Result<{ variant: ProductVariant }>> {
  return run('Failed to add variant', async (token) => {
    const variant = await api.createVariant(token, productId, data);
    revalidateCatalog(productId);
    return { variant };
  });
}

export async function updateVariantAction(
  productId: number,
  id: number,
  data: Partial<VariantInput>,
): Promise<Result<{ variant: ProductVariant }>> {
  return run('Failed to save variant', async (token) => {
    const variant = await api.updateVariant(token, id, data);
    revalidateCatalog(productId);
    return { variant };
  });
}

export async function deleteVariantAction(
  productId: number,
  id: number,
): Promise<Result<{ ok: true }>> {
  return run('Failed to delete variant', async (token) => {
    await api.deleteVariant(token, id);
    revalidateCatalog(productId);
    return { ok: true as const };
  });
}
