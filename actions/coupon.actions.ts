'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@/lib/backend-client';
import { apiMessage } from '@/lib/backend-commerce';
import { tokenIfPermitted } from '@/lib/action-auth';
import * as api from '@/lib/backend-coupons';
import type { Coupon, CouponInput } from '@/lib/backend-coupons';

type Result<T> = T | { error: string };

/**
 * Every action re-checks live permissions (actions are directly callable);
 * the API enforces the same rule again.
 */
async function withCoupons<T>(
  fallback: string,
  work: (accessToken: string) => Promise<T>,
): Promise<Result<T>> {
  const token = await tokenIfPermitted('coupons.manage');
  if (!token) return { error: "You don't have permission to manage coupons" };
  try {
    return await work(token);
  } catch (e) {
    return { error: e instanceof ApiError ? apiMessage(e.data, e.message) : fallback };
  }
}

function revalidateCoupons(id?: number): void {
  revalidatePath('/admin/coupons');
  if (id !== undefined) revalidatePath(`/admin/coupons/${id}`);
  // The storefront announcement bar promotes the soonest-ending coupon.
  revalidatePath('/', 'layout');
}

export async function createCouponAction(input: CouponInput): Promise<Result<{ coupon: Coupon }>> {
  return withCoupons("Couldn't create the coupon", async (token) => {
    const coupon = await api.createCoupon(token, input);
    revalidateCoupons();
    return { coupon };
  });
}

export async function updateCouponAction(
  id: number,
  input: Partial<CouponInput>,
): Promise<Result<{ coupon: Coupon }>> {
  return withCoupons("Couldn't save the coupon", async (token) => {
    const coupon = await api.updateCoupon(token, id, input);
    revalidateCoupons(id);
    return { coupon };
  });
}

export async function setCouponActiveAction(
  id: number,
  isActive: boolean,
): Promise<Result<{ coupon: Coupon }>> {
  return withCoupons(
    isActive ? "Couldn't switch the coupon on" : "Couldn't switch the coupon off",
    async (token) => {
      const coupon = await api.updateCoupon(token, id, { isActive });
      revalidateCoupons(id);
      return { coupon };
    },
  );
}

export async function deleteCouponAction(id: number): Promise<Result<{ ok: true }>> {
  return withCoupons("Couldn't delete the coupon", async (token) => {
    await api.deleteCoupon(token, id);
    revalidateCoupons(id);
    return { ok: true as const };
  });
}
