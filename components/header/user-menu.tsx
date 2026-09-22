'use client';

import * as React from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import {
  User,
  UserCircle,
  LayoutDashboard,
  ShieldCheck,
  Package,
  Heart,
  LogOut,
  LogIn,
  ChevronDown,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { ADMIN_ROLES, hasRole } from '@/auth.config';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';

export function UserMenu() {
  const { data: session, status } = useSession();
  const isAdmin = hasRole(session?.user?.role, ADMIN_ROLES);

  if (status === 'unauthenticated' || !session) {
    return (
      <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold shadow-xs" asChild>
        <Link href="/login">
          <LogIn className="size-3.5 mr-1.5" />
          Sign in
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 px-2 rounded-full hover:bg-muted/70 flex items-center gap-2 focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="User Account Menu"
        >
          <Avatar className="size-8 border border-border/80">
            {session.user?.avatarUrl && <AvatarImage src={session.user.avatarUrl} alt={session.user.name || ''} />}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {getInitials(session.user?.name, session.user?.email)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden lg:inline-flex text-xs font-medium text-foreground max-w-[100px] truncate">
            {session.user?.name || 'My Account'}
          </span>
          <ChevronDown className="hidden lg:inline-block size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60 p-2 shadow-lg rounded-xl border border-border">
        {/* User Identity Header */}
        <DropdownMenuLabel className="p-2 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground truncate max-w-[140px]">
              {session.user?.name || 'Account'}
            </p>
            {isAdmin ? (
              <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4 font-mono">
                Admin
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-mono">
                Member
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{session.user?.email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Navigation Section */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="p-2 cursor-pointer rounded-lg text-xs">
            <Link href="/profile">
              <UserCircle className="size-4 mr-2 text-muted-foreground" />
              <span>My Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="p-2 cursor-pointer rounded-lg text-xs">
            <Link href="/dashboard">
              <LayoutDashboard className="size-4 mr-2 text-muted-foreground" />
              <span>Customer Dashboard</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="p-2 cursor-pointer rounded-lg text-xs">
            <Link href="/dashboard?tab=orders">
              <Package className="size-4 mr-2 text-muted-foreground" />
              <span>Order History</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="p-2 cursor-pointer rounded-lg text-xs">
            <Link href="/wishlist">
              <Heart className="size-4 mr-2 text-muted-foreground" />
              <span>Saved Wishlist</span>
            </Link>
          </DropdownMenuItem>

          {isAdmin && (
            <DropdownMenuItem asChild className="p-2 cursor-pointer rounded-lg text-xs text-primary font-medium">
              <Link href="/admin">
                <ShieldCheck className="size-4 mr-2 text-primary" />
                <span>Admin Panel</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Logout Action */}
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => signOut({ callbackUrl: '/' })}
          className="p-2 cursor-pointer rounded-lg text-xs"
        >
          <LogOut className="size-4 mr-2" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
