'use client';

import { useTransition } from 'react';
import { signOut } from 'next-auth/react';
import { logoutAllAction } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';

export function SignOutAllButton() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await logoutAllAction();
      await signOut({ callbackUrl: '/login' });
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? 'Signing out...' : 'Sign out of all devices'}
    </Button>
  );
}
