'use client';

import { useTransition } from 'react';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { logoutAllAction } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';

export function SignOutAllButton() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await logoutAllAction();
      if (result.error) {
        toast.error("Couldn't sign out other devices", { description: result.error });
        return;
      }
      toast.success('Signed out everywhere', {
        description: 'Every session was ended. Sign in again to continue.',
      });
      await signOut({ callbackUrl: '/login' });
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? 'Signing out...' : 'Sign out of all devices'}
    </Button>
  );
}
