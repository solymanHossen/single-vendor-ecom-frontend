import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Header } from '@/components/header';

export default async function ProtectedLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');
  return (
    <>
      <Header />
      {children}
    </>
  );
}