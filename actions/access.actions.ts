'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { ApiError } from '@/lib/backend-client';
import { apiMessage } from '@/lib/backend-commerce';
import { fetchMe } from '@/lib/backend-auth';
import * as api from '@/lib/backend-access';
import type { AdminUserDetail, StaffRole, StaffRoleInput } from '@/lib/backend-access';
import { can, type Requirement } from '@/lib/permissions';

type Result<T> = T | { error: string };

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof ApiError ? apiMessage(e.data, e.message) : fallback;
}

/**
 * Defense in depth: the API enforces every rule, but actions are directly
 * callable, so each one re-checks the caller's live permissions first.
 */
async function authorized<T>(
  requirement: Requirement,
  fallback: string,
  work: (accessToken: string) => Promise<T>,
): Promise<Result<T>> {
  const session = await auth();
  if (!session?.accessToken) return { error: 'Please sign in again' };
  const profile = await fetchMe(session.accessToken);
  if (!profile || !can(profile, requirement)) {
    return { error: "You don't have permission to do this" };
  }
  try {
    return await work(session.accessToken);
  } catch (e) {
    return { error: errorMessage(e, fallback) };
  }
}

function revalidateUser(id: number): void {
  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${id}`);
}

// ── Users ───────────────────────────────────────────────────────────────────

export async function setUserStatusAction(
  id: number,
  isActive: boolean,
): Promise<Result<{ user: AdminUserDetail }>> {
  return authorized('customers.manage', "Couldn't update the account", async (token) => {
    const user = await api.setUserStatus(token, id, isActive);
    revalidateUser(id);
    return { user };
  });
}

export async function unlockUserAction(id: number): Promise<Result<{ user: AdminUserDetail }>> {
  return authorized('customers.manage', "Couldn't unlock the account", async (token) => {
    const user = await api.unlockUser(token, id);
    revalidateUser(id);
    return { user };
  });
}

export async function revokeUserSessionsAction(id: number): Promise<Result<{ user: AdminUserDetail }>> {
  return authorized('customers.manage', "Couldn't sign the account out", async (token) => {
    const user = await api.revokeUserSessions(token, id);
    revalidateUser(id);
    return { user };
  });
}

export async function revokeUserSessionAction(
  id: number,
  sessionId: number,
): Promise<Result<{ user: AdminUserDetail }>> {
  return authorized('customers.manage', "Couldn't end the session", async (token) => {
    const user = await api.revokeUserSession(token, id, sessionId);
    revalidateUser(id);
    return { user };
  });
}

export async function setUserAccessAction(
  id: number,
  access: { role: 'USER' | 'ADMIN'; staffRoleId: number | null },
): Promise<Result<{ user: AdminUserDetail }>> {
  return authorized('owner', "Couldn't change access", async (token) => {
    const user = await api.setUserAccess(token, id, access);
    revalidateUser(id);
    revalidatePath('/admin/roles');
    return { user };
  });
}

// ── Roles ───────────────────────────────────────────────────────────────────

export async function saveStaffRoleAction(
  id: number | null,
  input: StaffRoleInput,
): Promise<Result<{ role: StaffRole }>> {
  return authorized('owner', "Couldn't save the role", async (token) => {
    const role = id === null ? await api.createStaffRole(token, input) : await api.updateStaffRole(token, id, input);
    revalidatePath('/admin/roles');
    revalidatePath('/admin/users');
    return { role };
  });
}

export async function deleteStaffRoleAction(id: number): Promise<Result<{ ok: true }>> {
  return authorized('owner', "Couldn't delete the role", async (token) => {
    await api.deleteStaffRole(token, id);
    revalidatePath('/admin/roles');
    return { ok: true as const };
  });
}
