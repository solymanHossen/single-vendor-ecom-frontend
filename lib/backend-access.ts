import { backendFetch, parseJson } from "@/lib/backend-client"
import type { Permission } from "@/lib/permissions"

// Mirrors the API's admin-users, staff-roles and audit entities.

export type UserType = "all" | "customers" | "staff"
export type UserStatus = "all" | "active" | "inactive" | "locked"

export interface AdminUser {
  id: number
  name: string | null
  email: string
  phone: string | null
  avatarUrl: string | null
  role: "USER" | "ADMIN" | "SUPER_ADMIN"
  staffRole: { id: number; name: string } | null
  isActive: boolean
  isLocked: boolean
  lockedUntil: string | null
  lastLoginAt: string | null
  activeSessions: number
  orderCount: number
  hasGoogle: boolean
  hasPassword: boolean
  createdAt: string
}

export interface AdminUserSession {
  id: number
  deviceInfo: string | null
  createdAt: string
  expiresAt: string
}

export interface AdminUserDetail extends AdminUser {
  sessions: AdminUserSession[]
  totalSpent: string
  lastOrderAt: string | null
  addressCount: number
  permissions: Permission[]
}

export interface AdminUserPage {
  items: AdminUser[]
  meta: { page: number; limit: number; total: number; totalPages: number }
  counts: { all: number; customers: number; staff: number; inactive: number; locked: number }
}

export interface AdminUserQuery {
  page: number
  search?: string
  type: UserType
  status: UserStatus
}

export interface StaffRole {
  id: number
  name: string
  description: string
  permissions: Permission[]
  memberCount: number
  createdAt: string
  updatedAt: string
}

export interface PermissionGroup {
  key: string
  label: string
  permissions: Array<{ key: Permission; label: string; description: string }>
}

export interface StaffRoleInput {
  name: string
  description: string
  permissions: Permission[]
}

export type AuditArea = "user" | "role" | "settings" | "auth"

export interface AuditLog {
  id: number
  actor: { id: number; name: string | null; email: string } | null
  actorEmail: string | null
  action: string
  targetType: string
  targetId: string | null
  summary: string
  metadata: unknown
  ipAddress: string | null
  createdAt: string
}

export interface AuditPage {
  items: AuditLog[]
  meta: { page: number; limit: number; total: number; totalPages: number }
  /** Entries older than this are purged nightly by the API. */
  retentionDays: number
}

function authed(accessToken: string, init: RequestInit = {}): RequestInit {
  return {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
  }
}

async function request<T>(accessToken: string, path: string, init?: RequestInit): Promise<T> {
  const response = await backendFetch(path, authed(accessToken, init))
  return (await parseJson<{ data: T }>(response)).data
}

// ── Users ───────────────────────────────────────────────────────────────────

export const ADMIN_USERS_PAGE_SIZE = 20

export function getAdminUsers(accessToken: string, query: AdminUserQuery): Promise<AdminUserPage> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(ADMIN_USERS_PAGE_SIZE),
    type: query.type,
    status: query.status,
  })
  if (query.search) params.set("search", query.search)
  return request(accessToken, `/admin/users?${params.toString()}`)
}

/** Null when the user doesn't exist or isn't visible to the caller. */
export async function getAdminUser(accessToken: string, id: number): Promise<AdminUserDetail | null> {
  const response = await backendFetch(`/admin/users/${id}`, authed(accessToken))
  if (response.status === 404) return null
  return (await parseJson<{ data: AdminUserDetail }>(response)).data
}

export const setUserStatus = (accessToken: string, id: number, isActive: boolean) =>
  request<AdminUserDetail>(accessToken, `/admin/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  })

export const unlockUser = (accessToken: string, id: number) =>
  request<AdminUserDetail>(accessToken, `/admin/users/${id}/unlock`, { method: "POST" })

export const revokeUserSessions = (accessToken: string, id: number) =>
  request<AdminUserDetail>(accessToken, `/admin/users/${id}/sessions/revoke`, { method: "POST" })

export const revokeUserSession = (accessToken: string, id: number, sessionId: number) =>
  request<AdminUserDetail>(accessToken, `/admin/users/${id}/sessions/${sessionId}`, {
    method: "DELETE",
  })

export const setUserAccess = (
  accessToken: string,
  id: number,
  access: { role: "USER" | "ADMIN"; staffRoleId: number | null }
) =>
  request<AdminUserDetail>(accessToken, `/admin/users/${id}/access`, {
    method: "PATCH",
    body: JSON.stringify(access),
  })

// ── Roles ───────────────────────────────────────────────────────────────────

export const getStaffRoles = (accessToken: string) => request<StaffRole[]>(accessToken, "/admin/roles")

export const getPermissionCatalog = (accessToken: string) =>
  request<PermissionGroup[]>(accessToken, "/admin/roles/permissions")

export const createStaffRole = (accessToken: string, input: StaffRoleInput) =>
  request<StaffRole>(accessToken, "/admin/roles", { method: "POST", body: JSON.stringify(input) })

export const updateStaffRole = (accessToken: string, id: number, input: Partial<StaffRoleInput>) =>
  request<StaffRole>(accessToken, `/admin/roles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })

export const deleteStaffRole = (accessToken: string, id: number) =>
  request<null>(accessToken, `/admin/roles/${id}`, { method: "DELETE" })

// ── Audit ───────────────────────────────────────────────────────────────────

export function getAuditLogs(
  accessToken: string,
  query: { page: number; area?: AuditArea; targetType?: string; targetId?: string; limit?: number }
): Promise<AuditPage> {
  const params = new URLSearchParams({ page: String(query.page), limit: String(query.limit ?? 30) })
  if (query.area) params.set("area", query.area)
  if (query.targetType) params.set("targetType", query.targetType)
  if (query.targetId) params.set("targetId", query.targetId)
  return request(accessToken, `/admin/audit-logs?${params.toString()}`)
}
