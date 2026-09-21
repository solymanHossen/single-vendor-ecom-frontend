import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:3000/api/v1';

const REFRESH_COOKIE_NAME = 'refresh_token';
const REFRESH_COOKIE_PATH = '/api/auth';

export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface SafeUser {
  id: number;
  email: string;
  name: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

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

async function backendFetch(path: string, init?: RequestInit) {
  return fetch(`${API_URL}${path}`, {
    ...init,
    cache: 'no-store',
  });
}

async function parseJson<T>(response: Response): Promise<T> {
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

// Backend Set-Cookie attributes are always a simple `; `-delimited list
// (name=value; HttpOnly; Secure; SameSite=Strict; Path=...; Max-Age=...) —
// no need for a full cookie-parsing dependency for this one shape.
function parseSetCookie(setCookieHeader: string): { value: string; maxAgeSeconds?: number } {
  const [pair, ...attrs] = setCookieHeader.split('; ');
  const eq = pair.indexOf('=');
  const value = pair.slice(eq + 1);

  const maxAgeAttr = attrs.find((attr) => attr.toLowerCase().startsWith('max-age='));
  const maxAgeSeconds = maxAgeAttr ? parseInt(maxAgeAttr.split('=')[1] ?? '', 10) : undefined;

  return { value, maxAgeSeconds: Number.isFinite(maxAgeSeconds) ? maxAgeSeconds : undefined };
}

// The backend's refresh_token cookie is set on a server-to-server fetch
// response, which fetch() never stores or forwards anywhere — this pulls it
// back out and re-hosts it as our own cookie on the frontend's own origin.
async function rehostRefreshCookie(response: Response): Promise<void> {
  const setCookieHeaders = response.headers.getSetCookie();
  const refreshCookie = setCookieHeaders.find((header) =>
    header.startsWith(`${REFRESH_COOKIE_NAME}=`),
  );

  if (!refreshCookie) return;

  const { value, maxAgeSeconds } = parseSetCookie(refreshCookie);
  const isProduction = process.env.NODE_ENV === 'production';

  (await cookies()).set(REFRESH_COOKIE_NAME, value, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: REFRESH_COOKIE_PATH,
    maxAge: maxAgeSeconds,
  });
}

export async function register(data: {
  email: string;
  password: string;
  name?: string;
}): Promise<void> {
  const response = await backendFetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  await parseJson(response);
}

export async function login(
  email: string,
  password: string,
): Promise<{ accessToken: string; user: SafeUser }> {
  const response = await backendFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const parsed = await parseJson<{ data: { accessToken: string; user: SafeUser } }>(response);
  await rehostRefreshCookie(response);

  return parsed.data;
}

// Only safe to call from a Server Action or Route Handler — see
// app/api/auth/refresh/route.ts. Never call this from auth.ts's jwt()
// callback: that also runs during plain Server Component renders, where
// cookie writes are silently unsafe/impossible, and by the time that failed
// the backend would have already rotated the refresh token server-side.
export async function refreshAccessToken(): Promise<{ accessToken: string } | null> {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE_NAME)?.value;
  if (!refreshToken) return null;

  const response = await backendFetch('/auth/refresh', {
    method: 'POST',
    headers: { Cookie: `${REFRESH_COOKIE_NAME}=${refreshToken}` },
  });

  if (!response.ok) return null;

  const parsed = await parseJson<{ data: { accessToken: string } }>(response);
  await rehostRefreshCookie(response);

  return parsed.data;
}

// /users/me is a strict superset of /auth/me (adds name/phone/avatarUrl on
// top of role/isActive), so this one call covers both the jwt() ban/role
// revalidation and the profile page's data needs.
export async function fetchMe(accessToken: string): Promise<UserProfile | null> {
  const response = await backendFetch('/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 401 || response.status === 403) return null;

  const parsed = await parseJson<{ data: UserProfile }>(response);
  return parsed.data;
}

export async function updateProfile(
  accessToken: string,
  data: UpdateProfileInput,
): Promise<UserProfile> {
  const response = await backendFetch('/users/me', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  const parsed = await parseJson<{ data: UserProfile }>(response);
  return parsed.data;
}

export async function uploadAvatar(accessToken: string, file: File): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'avatars');

  const response = await backendFetch('/storage/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  const parsed = await parseJson<{ data: UploadedFile }>(response);
  return parsed.data;
}

export async function logoutAll(accessToken: string): Promise<void> {
  const response = await backendFetch('/auth/logout-all', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  await parseJson(response);
}

// Best-effort: called from auth.ts's events.signOut, which must never let a
// backend outage block the user from completing local sign-out. `/auth/logout`
// sits behind the backend's global JWT guard (unlike /auth/refresh, which is
// @Public()) — it needs the access token *and* the refresh_token cookie.
export async function revokeBackendSession(accessToken: string | undefined): Promise<void> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (refreshToken && accessToken) {
    try {
      await backendFetch('/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Cookie: `${REFRESH_COOKIE_NAME}=${refreshToken}`,
        },
      });
    } catch {
      // Refresh token still expires naturally within JWT_REFRESH_EXPIRES_IN.
    }
  }

  cookieStore.delete({ name: REFRESH_COOKIE_NAME, path: REFRESH_COOKIE_PATH });
}

export async function forgotPassword(email: string): Promise<void> {
  const response = await backendFetch('/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  await parseJson(response);
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const response = await backendFetch('/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });

  await parseJson(response);
}
