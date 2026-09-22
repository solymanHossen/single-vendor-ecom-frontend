export const API_URL = process.env.API_URL ?? 'http://localhost:3000/api/v1';

export interface UploadedFile {
  url: string;
  key: string;
  mimeType: string;
  size: number;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Defaults to no-store (session/user data must never be cached). A caller
// that wants Next's own tag/time-based revalidation instead — for public,
// cacheable content like the hero banners list — passes `next: {...}` and
// no `cache`; Next's fetch throws if both `cache` and `next.revalidate` are
// set, so the no-store default is skipped entirely in that case rather than
// passed alongside it.
export async function backendFetch(path: string, init?: RequestInit) {
  const wantsNextCaching = 'next' in (init ?? {});

  return fetch(`${API_URL}${path}`, {
    ...(wantsNextCaching || init?.cache ? {} : { cache: 'no-store' as const }),
    ...init,
  });
}

export async function parseJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      (body as { message?: string } | null)?.message ?? 'Request failed',
      response.status,
      body,
    );
  }

  return body as T;
}
