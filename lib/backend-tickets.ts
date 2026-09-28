import { backendFetch, parseJson, type UploadedFile } from "@/lib/backend-client"
import type { OrderStatus } from "@/lib/backend-commerce"

// Mirrors the API's ticket entities (customer /tickets and staff /admin/tickets).

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING" | "RESOLVED" | "CLOSED"
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH"
export type TicketCategory = "ORDER" | "DELIVERY" | "PAYMENT" | "RETURN" | "PRODUCT" | "ACCOUNT" | "OTHER"
export type TicketMessageKind = "REPLY" | "NOTE" | "EVENT"
export type TicketView = "needs_reply" | "mine" | "unassigned" | "waiting" | "resolved" | "all"

export interface TicketPerson {
  id: number
  name: string | null
  /** Staff views only. */
  email: string | null
  avatarUrl: string | null
}

export interface TicketMessage {
  id: number
  kind: TicketMessageKind
  isInternal: boolean
  fromStaff: boolean
  /** null = the system (e.g. auto-close). */
  sender: TicketPerson | null
  message: string
  attachments: string[]
  createdAt: string
}

export interface TicketListItem {
  id: number
  subject: string
  category: TicketCategory
  status: TicketStatus
  priority: TicketPriority
  orderId: number | null
  awaitingStaff: boolean
  unread: boolean
  replyCount: number
  preview: { text: string; fromStaff: boolean; at: string } | null
  lastMessageAt: string
  createdAt: string
  customer: TicketPerson | null
  assignee: TicketPerson | null
}

export interface TicketDetail extends TicketListItem {
  messages: TicketMessage[]
  order: { id: number; status: OrderStatus; totalAmount: string; itemCount: number; createdAt: string } | null
  satisfied: boolean | null
  firstResponseAt: string | null
  resolvedAt: string | null
  canReply: boolean
  customerStats: { orderCount: number; ticketCount: number; memberSince: string } | null
}

export interface TicketPage {
  items: TicketListItem[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface TicketSummary {
  views: Record<TicketView, number>
  openCount: number
  avgFirstResponseMinutes: number | null
  satisfactionRate: number | null
  ratedCount: number
}

export interface NewTicketInput {
  category: TicketCategory
  subject: string
  message: string
  orderId?: number
  attachments: string[]
}

export const ADMIN_TICKET_PAGE_SIZE = 25
export const MAX_ATTACHMENTS = 4

function authed(accessToken: string, init: RequestInit = {}): RequestInit {
  return {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
  }
}

async function request<T>(accessToken: string, path: string, init: RequestInit = {}): Promise<T> {
  const response = await backendFetch(path, authed(accessToken, init))
  return (await parseJson<{ data: T }>(response)).data
}

const post = (body: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(body) })

// ── Customer ────────────────────────────────────────────────────────────────

export function getMyTickets(
  accessToken: string,
  query: { page: number; state?: "active" | "resolved" | "all" }
): Promise<TicketPage> {
  const params = new URLSearchParams({ page: String(query.page), limit: "20", state: query.state ?? "all" })
  return request(accessToken, `/tickets?${params.toString()}`)
}

/** Null when it doesn't exist or isn't the caller's. Opening it marks replies read. */
export async function getMyTicket(accessToken: string, id: number): Promise<TicketDetail | null> {
  const response = await backendFetch(`/tickets/${id}`, authed(accessToken))
  if (response.status === 404) return null
  return (await parseJson<{ data: TicketDetail }>(response)).data
}

export async function getUnreadTicketCount(accessToken: string): Promise<number> {
  try {
    return (await request<{ count: number }>(accessToken, "/tickets/unread-count")).count
  } catch {
    return 0 // A badge is never worth breaking the page for.
  }
}

export const createTicket = (accessToken: string, input: NewTicketInput) =>
  request<TicketDetail>(accessToken, "/tickets", post(input))

export const replyToTicket = (accessToken: string, id: number, input: { message: string; attachments: string[] }) =>
  request<TicketDetail>(accessToken, `/tickets/${id}/messages`, post(input))

export const resolveMyTicket = (accessToken: string, id: number) =>
  request<TicketDetail>(accessToken, `/tickets/${id}/resolve`, { method: "POST" })

export const rateMyTicket = (accessToken: string, id: number, satisfied: boolean) =>
  request<TicketDetail>(accessToken, `/tickets/${id}/rating`, post({ satisfied }))

export async function uploadTicketAttachment(accessToken: string, file: File): Promise<UploadedFile> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("folder", "tickets")
  const response = await backendFetch("/storage/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  })
  return (await parseJson<{ data: UploadedFile }>(response)).data
}

// ── Staff ───────────────────────────────────────────────────────────────────

export interface AdminTicketQuery {
  page: number
  view: TicketView
  search?: string
  priority?: TicketPriority
  category?: TicketCategory
  userId?: number
}

export function getAdminTickets(accessToken: string, query: AdminTicketQuery): Promise<TicketPage> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(ADMIN_TICKET_PAGE_SIZE),
    view: query.view,
  })
  if (query.search) params.set("search", query.search)
  if (query.priority) params.set("priority", query.priority)
  if (query.category) params.set("category", query.category)
  if (query.userId) params.set("userId", String(query.userId))
  return request(accessToken, `/admin/tickets?${params.toString()}`)
}

/** Tickets waiting for a staff reply — the sidebar badge. Never throws. */
export async function getSupportQueueCount(accessToken: string): Promise<number> {
  try {
    const page = await request<TicketPage>(accessToken, "/admin/tickets?view=needs_reply&limit=1")
    return page.meta.total
  } catch {
    return 0
  }
}

export const getTicketSummary = (accessToken: string) =>
  request<TicketSummary>(accessToken, "/admin/tickets/summary")

export const getTicketAssignees = (accessToken: string) =>
  request<TicketPerson[]>(accessToken, "/admin/tickets/assignees")

export async function getAdminTicket(accessToken: string, id: number): Promise<TicketDetail | null> {
  const response = await backendFetch(`/admin/tickets/${id}`, authed(accessToken))
  if (response.status === 404) return null
  return (await parseJson<{ data: TicketDetail }>(response)).data
}

export interface StaffReplyInput {
  message: string
  attachments: string[]
  internal: boolean
  status?: "IN_PROGRESS" | "WAITING" | "RESOLVED"
}

export const staffReply = (accessToken: string, id: number, input: StaffReplyInput) =>
  request<TicketDetail>(accessToken, `/admin/tickets/${id}/messages`, post(input))

export interface TicketUpdate {
  status?: TicketStatus
  priority?: TicketPriority
  category?: TicketCategory
  assigneeId?: number | null
}

export const updateTicket = (accessToken: string, id: number, input: TicketUpdate) =>
  request<TicketDetail>(accessToken, `/admin/tickets/${id}`, { method: "PATCH", body: JSON.stringify(input) })
