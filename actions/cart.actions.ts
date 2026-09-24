'use server';

import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { ApiError } from '@/lib/backend-client';
import * as api from '@/lib/backend-commerce';
import { EMPTY_CART, type Cart, type CartCaller } from '@/lib/backend-commerce';

/** Identifies a guest's cart. httpOnly: only these actions ever read it. */
const GUEST_CART_COOKIE = 'aura_cart';
const GUEST_CART_MAX_AGE = 60 * 60 * 24 * 30; // matches the API's cart TTL

type CartResult = { cart: Cart } | { cart: Cart; error: string };

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof ApiError ? api.apiMessage(e.data, e.message) : fallback;
}

/**
 * Resolves who owns the cart. A signed-in shopper who still carries a guest
 * cookie gets that guest cart merged into their account first, so nothing
 * added before signing in is lost.
 */
async function resolveCaller(createGuest: boolean): Promise<CartCaller | null> {
  const [session, jar] = await Promise.all([auth(), cookies()]);
  const guestId = jar.get(GUEST_CART_COOKIE)?.value;

  if (session?.accessToken) {
    if (guestId) {
      try {
        await api.mergeGuestCart(session.accessToken, guestId);
        jar.delete(GUEST_CART_COOKIE);
      } catch {
        // Keep the cookie and retry on the next cart call.
      }
    }
    return { accessToken: session.accessToken };
  }

  if (guestId) return { sessionId: guestId };
  if (!createGuest) return null;

  const sessionId = crypto.randomUUID();
  jar.set(GUEST_CART_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: GUEST_CART_MAX_AGE,
  });
  return { sessionId };
}

async function currentCart(caller: CartCaller | null): Promise<Cart> {
  if (!caller) return EMPTY_CART;
  try {
    return await api.fetchCart(caller);
  } catch {
    return EMPTY_CART;
  }
}

export async function getCartAction(): Promise<Cart> {
  return currentCart(await resolveCaller(false));
}

export async function addToCartAction(input: {
  productId: number;
  variantId?: number;
  quantity: number;
}): Promise<CartResult> {
  const caller = await resolveCaller(true);
  if (!caller) return { cart: EMPTY_CART, error: 'Could not start a cart' };
  try {
    return { cart: await api.addCartLine(caller, input) };
  } catch (e) {
    return { cart: await currentCart(caller), error: errorMessage(e, "Couldn't add this item") };
  }
}

export async function updateCartLineAction(key: string, quantity: number): Promise<CartResult> {
  const caller = await resolveCaller(false);
  if (!caller) return { cart: EMPTY_CART, error: 'Your cart is empty' };
  try {
    return { cart: await api.setCartLineQuantity(caller, key, quantity) };
  } catch (e) {
    return { cart: await currentCart(caller), error: errorMessage(e, "Couldn't update quantity") };
  }
}

export async function removeCartLineAction(key: string): Promise<CartResult> {
  const caller = await resolveCaller(false);
  if (!caller) return { cart: EMPTY_CART };
  try {
    return { cart: await api.removeCartLine(caller, key) };
  } catch (e) {
    return { cart: await currentCart(caller), error: errorMessage(e, "Couldn't remove this item") };
  }
}
