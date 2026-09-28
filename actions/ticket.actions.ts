'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { ApiError } from '@/lib/backend-client';
import { apiMessage } from '@/lib/backend-commerce';
import * as api from '@/lib/backend-tickets';
import type { NewTicketInput, TicketDetail } from '@/lib/backend-tickets';
import { checkImage } from '@/lib/upload-rules';

type Result<T> = T | { error: string };

async function signedIn<T>(fallback: string, work: (token: string) => Promise<T>): Promise<Result<T>> {
  const session = await auth();
  if (!session?.accessToken) return { error: 'Please sign in again' };
  try {
    return await work(session.accessToken);
  } catch (e) {
    return { error: e instanceof ApiError ? apiMessage(e.data, e.message) : fallback };
  }
}

function revalidateSupport(id?: number): void {
  revalidatePath('/dashboard/support');
  if (id !== undefined) revalidatePath(`/dashboard/support/${id}`);
  // The account nav shows an unread badge.
  revalidatePath('/dashboard', 'layout');
}

/** Any signed-in user (customers and staff) may attach photos to a thread. */
export async function uploadTicketAttachmentAction(
  formData: FormData,
): Promise<Result<{ url: string }>> {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'Choose a photo to attach' };
  const problem = checkImage(file, 'attachment');
  if (problem) return { error: problem.description };
  return signedIn("Couldn't upload the photo", async (token) => {
    const uploaded = await api.uploadTicketAttachment(token, file);
    return { url: uploaded.url };
  });
}

export async function createTicketAction(input: NewTicketInput): Promise<Result<{ ticket: TicketDetail }>> {
  return signedIn("Couldn't send your request", async (token) => {
    const ticket = await api.createTicket(token, input);
    revalidateSupport();
    return { ticket };
  });
}

export async function replyToTicketAction(
  id: number,
  input: { message: string; attachments: string[] },
): Promise<Result<{ ticket: TicketDetail }>> {
  return signedIn("Couldn't send your message", async (token) => {
    const ticket = await api.replyToTicket(token, id, input);
    revalidateSupport(id);
    return { ticket };
  });
}

export async function resolveTicketAction(id: number): Promise<Result<{ ticket: TicketDetail }>> {
  return signedIn("Couldn't update the request", async (token) => {
    const ticket = await api.resolveMyTicket(token, id);
    revalidateSupport(id);
    return { ticket };
  });
}

export async function rateTicketAction(
  id: number,
  satisfied: boolean,
): Promise<Result<{ ticket: TicketDetail }>> {
  return signedIn("Couldn't save your feedback", async (token) => {
    const ticket = await api.rateMyTicket(token, id, satisfied);
    revalidateSupport(id);
    return { ticket };
  });
}
