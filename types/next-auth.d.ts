import 'next-auth';
import 'next-auth/jwt';
import type { Role } from '@/lib/backend-auth';

declare module 'next-auth' {
  interface User {
    role: Role;
    isActive: boolean;
    accessToken: string;
  }

  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string;
      role: Role;
      isActive: boolean;
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
    accessToken: string;
    lastRevalidatedAt: number;
    error?: string;
  }
}
