import 'next-auth';
import 'next-auth/jwt';
import type { Role } from '@/lib/backend-auth';

declare module 'next-auth' {
  interface User {
    role: Role;
    isActive: boolean;
    avatarUrl: string | null;
    accessToken: string;
  }

  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string;
      role: Role;
      isActive: boolean;
      avatarUrl: string | null;
    };
    accessToken: string;
    error?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    isActive: boolean;
    avatarUrl: string | null;
    accessToken: string;
    lastRevalidatedAt: number;
    error?: string;
  }
}
