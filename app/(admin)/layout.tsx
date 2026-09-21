import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ADMIN_ROLES, hasRole } from '@/auth.config';

export default async function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');
  if (!hasRole(session.user.role, ADMIN_ROLES)) redirect('/dashboard');
  return <>{children}</>;
}