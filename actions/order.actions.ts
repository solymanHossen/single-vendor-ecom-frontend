'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { auth } from '@/auth';
import { tokenIfPermitted } from '@/lib/action-auth';
import { ApiError } from '@/lib/backend-client';
import * as api from '@/lib/backend-commerce';
import type { Order, OrderQuote, OrderStatus } from '@/lib/backend-commerce';
import { CATALOG_CACHE_TAG } from '@/lib/backend-storefront';

type Result<T> = T | { error: string };

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof ApiError ? api.apiMessage(e.data, e.message) : fallback;
}

async function withToken<T>(
  fallback: string,
  work: (accessToken: string) => Promise<T>,
  options: { admin?: boolean } = {},
): Promise<Result<T>> {
  const session = await auth();
  if (!session?.accessToken) return { error: 'Please sign in to continue' };
  if (options.admin && !(await tokenIfPermitted('orders.manage'))) {
    return { error: "You don't have permission to update orders" };
  }
  try {
    return await work(session.accessToken);
  } catch (e) {
    return { error: errorMessage(e, fallback) };
  }
}

export async function quoteAction(input: {
  addressId?: number;
  couponCode?: string;
}): Promise<Result<{ quote: OrderQuote }>> {
  return withToken("Couldn't update the totals", async (token) => ({
    quote: await api.getQuote(token, input),
  }));
}

export async function placeOrderAction(input: {
  addressId: number;
  couponCode?: string;
  note?: string;
}): Promise<Result<{ order: Order }>> {
  return withToken("Couldn't place your order", async (token) => {
    const order = await api.placeOrder(token, input);
    // Stock changed: storefront stock badges and "sold out" states must follow.
    updateTag(CATALOG_CACHE_TAG);
    revalidatePath('/dashboard/orders');
    return { order };
  });
}

export async function cancelOrderAction(id: number): Promise<Result<{ order: Order }>> {
  return withToken("Couldn't cancel this order", async (token) => {
    const order = await api.cancelOrder(token, id);
    updateTag(CATALOG_CACHE_TAG);
    revalidatePath('/dashboard/orders');
    revalidatePath(`/dashboard/orders/${id}`);
    return { order };
  });
}

export async function updateOrderStatusAction(
  id: number,
  status: OrderStatus,
): Promise<Result<{ order: Order }>> {
  return withToken(
    "Couldn't update the order",
    async (token) => {
      const order = await api.updateOrderStatus(token, id, status);
      if (status === 'CANCELLED') updateTag(CATALOG_CACHE_TAG);
      revalidatePath('/admin/orders');
      revalidatePath(`/admin/orders/${id}`);
      revalidatePath('/admin');
      return { order };
    },
    { admin: true },
  );
}
