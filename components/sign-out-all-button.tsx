'use client';

import { useState, useTransition } from 'react';
import { signOut } from 'next-auth/react';
import { Loader2, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { logoutAllAction } from '@/actions/auth.actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export function SignOutAllButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const confirm = () => {
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
    <AlertDialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="h-10 rounded-xl">
          <LogOut className="size-4" />
          Sign out of all devices
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out everywhere?</AlertDialogTitle>
          <AlertDialogDescription className="text-[15px]">
            Every device signed in to your account — including this one — will be signed out.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl" disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="rounded-xl"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              confirm();
            }}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Sign out everywhere
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
