/**
 * Mirrors the API's permission keys (src/access/permissions.ts). Labels and
 * descriptions come from GET /admin/roles/permissions; this file only needs
 * the keys, for type-safe checks in the UI.
 */
export const PERMISSIONS = [
  "analytics.view",
  "settings.manage",
  "orders.view",
  "orders.manage",
  "payments.manage",
  "returns.manage",
  "catalog.manage",
  "coupons.manage",
  "banners.manage",
  "customers.view",
  "customers.manage",
  "reviews.moderate",
  "tickets.manage",
] as const

export type Permission = (typeof PERMISSIONS)[number]

/** "owner" = SUPER_ADMIN-only areas (staff access, roles, audit log). */
export type Requirement = Permission | "owner"

export interface Access {
  role: "USER" | "ADMIN" | "SUPER_ADMIN"
  permissions: readonly Permission[]
}

export function can(access: Access, requirement: Requirement): boolean {
  if (requirement === "owner") return access.role === "SUPER_ADMIN"
  return access.permissions.includes(requirement)
}
