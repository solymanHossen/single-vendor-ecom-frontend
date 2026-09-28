'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@/lib/backend-client';
import { apiMessage } from '@/lib/backend-commerce';
import { tokenIfPermitted } from '@/lib/action-auth';
import * as api from '@/lib/backend-tickets';
import type { StaffReplyInput, TicketDetail, TicketUpdate } from '@/lib/backend-tickets';

type Result<T> = T | { error: string };

async function withSupport<T>(fallback: string, work: (token: string) => Promise<T>): Promise<Result<T>> {
  const token = await tokenIfPermitted('tickets.manage');
  if (!token) return { error: "You don't have permission to manage support" };
  try {
    return await work(token);
  } catch (e) {
    return { error: e instanceof ApiError ? apiMessage(e.data, e.message) : fallback };
  }
}

function revalidateTicket(id: number): void {
  revalidatePath('/admin/tickets');
  revalidatePath(`/admin/tickets/${id}`);
  // The sidebar badge counts tickets needing a reply.
  revalidatePath('/admin', 'layout');
}

export async function staffReplyAction(
  id: number,
  input: StaffReplyInput,
): Promise<Result<{ ticket: TicketDetail }>> {
  return withSupport(input.internal ? "Couldn't add the note" : "Couldn't send the reply", async (token) => {
    const ticket = await api.staffReply(token, id, input);
    revalidateTicket(id);
    return { ticket };
  });
}

export async function updateTicketAction(
  id: number,
  input: TicketUpdate,
): Promise<Result<{ ticket: TicketDetail }>> {
  return withSupport("Couldn't update the ticket", async (token) => {
    const ticket = await api.updateTicket(token, id, input);
    revalidateTicket(id);
    return { ticket };
  });
}
