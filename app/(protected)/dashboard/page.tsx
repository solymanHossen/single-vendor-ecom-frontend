import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { SignOutAllButton } from '@/components/sign-out-all-button';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) redirect('/login');

  return (
    <div className="page-container flex min-h-svh flex-col gap-4 py-6 lg:py-8">
      <div className="max-w-2xl space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Dashboard
        </p>
        <h1 className="text-3xl font-semibold">
          Welcome back{session.user?.name ? `, ${session.user.name}` : ''}
        </h1>
        <p className="text-muted-foreground">
          Signed in as <span className="font-medium">{session.user.email}</span>{' '}
          — role <span className="font-medium">{session.user.role}</span>.
        </p>
        <div className="pt-2">
          <SignOutAllButton />
        </div>
      </div>
    </div>
  );
}