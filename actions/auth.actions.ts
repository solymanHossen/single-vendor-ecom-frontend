'use server';

import { redirect } from 'next/navigation';
import * as backendAuth from '@/lib/backend-auth';
import { ApiError } from '@/lib/backend-auth';
import { auth } from '@/auth';
import {
  registerSchema,
  forgotPasswordSchema, resetPasswordSchema
} from '@/lib/validators';

function errorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiError) return e.message;
  return fallback;
}

// ─── Register ─────────────────────────────────────────
export async function registerAction(
  _state: unknown,
  formData: FormData,
) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  try {
    await backendAuth.register(parsed.data);
  } catch (e) {
    return { error: errorMessage(e, 'Registration failed') };
  }

  redirect('/login?registered=true');
}

// ─── Forgot Password ──────────────────────────────────
export async function forgotPasswordAction(
  _state: unknown,
  formData: FormData,
) {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  try {
    await backendAuth.forgotPassword(parsed.data.email);
    return { success: true };
  } catch (e) {
    return { error: errorMessage(e, 'Something went wrong') };
  }
}

// ─── Reset Password ───────────────────────────────────
export async function resetPasswordAction(
  token: string,
  _state: unknown,
  formData: FormData,
) {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  try {
    await backendAuth.resetPassword(token, parsed.data.password);
  } catch (e) {
    return { error: errorMessage(e, 'Reset failed or link expired') };
  }

  redirect('/login?reset=true');
}

// ─── Sign out of all devices ──────────────────────────
export async function logoutAllAction() {
  const session = await auth();
  if (!session?.accessToken) return { error: 'Not signed in' };

  try {
    await backendAuth.logoutAll(session.accessToken);
    return { success: true };
  } catch (e) {
    return { error: errorMessage(e, 'Failed to revoke sessions') };
  }
}
