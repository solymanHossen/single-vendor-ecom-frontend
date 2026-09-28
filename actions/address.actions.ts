'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { ApiError } from '@/lib/backend-client';
import * as api from '@/lib/backend-commerce';
import type { Address, AddressInput, AddressUpdate } from '@/lib/backend-commerce';

type Result<T> = T | { error: string };

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof ApiError ? api.apiMessage(e.data, e.message) : fallback;
}

async function withToken<T>(
  fallback: string,
  work: (accessToken: string) => Promise<T>,
): Promise<Result<T>> {
  const session = await auth();
  if (!session?.accessToken) return { error: 'Please sign in to continue' };
  try {
    return await work(session.accessToken);
  } catch (e) {
    return { error: errorMessage(e, fallback) };
  }
}

/** The address book feeds checkout and the account overview. */
function revalidateAddresses(): void {
  revalidatePath('/dashboard/addresses');
  revalidatePath('/dashboard');
}

export async function createAddressAction(
  input: AddressInput,
): Promise<Result<{ address: Address }>> {
  return withToken("Couldn't save this address", async (token) => {
    const address = await api.createAddress(token, input);
    revalidateAddresses();
    return { address };
  });
}

export async function updateAddressAction(
  id: number,
  input: AddressUpdate,
): Promise<Result<{ address: Address }>> {
  return withToken("Couldn't update this address", async (token) => {
    const address = await api.updateAddress(token, id, input);
    revalidateAddresses();
    return { address };
  });
}

export async function deleteAddressAction(id: number): Promise<Result<{ ok: true }>> {
  return withToken("Couldn't delete this address", async (token) => {
    await api.deleteAddress(token, id);
    revalidateAddresses();
    return { ok: true as const };
  });
}
