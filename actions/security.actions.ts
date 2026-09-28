'use server';

import { auth } from '@/auth';
import * as backendAuth from '@/lib/backend-auth';
import { ApiError } from '@/lib/backend-auth';
import { apiMessage } from '@/lib/backend-commerce';

function errorMessage(e: unknown, fallback: string): string {
  // Validation failures carry a list of messages; show them all.
  return e instanceof ApiError ? apiMessage(e.data, e.message) : fallback;
}

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: true } | { error: string }> {
  const session = await auth();
  if (!session?.accessToken) return { error: 'Not signed in' };
  try {
    await backendAuth.changePassword(session.accessToken, input);
    return { ok: true };
  } catch (e) {
    return { error: errorMessage(e, "Couldn't change your password") };
  }
}
