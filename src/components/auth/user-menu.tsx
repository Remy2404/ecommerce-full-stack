'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, Package, Heart, Settings, ChevronDown, LayoutGrid } from 'lucide-react';
import { signOutUser } from '@/actions/auth.actions';

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOutUser();
  };

  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-design px-2 py-1.5 transition-colors hover:bg-muted"
      >
        {user.image ? (
          <div className="relative h-8 w-8 overflow-hidden rounded-full">
            <Image
              src={user.image}
              alt={user.name || 'User'}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {initials}
          </div>
        )}
        <span className="hidden text-sm font-medium sm:block">
          {user.name?.split(' ')[0] || 'User'}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-design-lg border border-border bg-card shadow-soft">
            <div className="border-b border-border p-3">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <div className="p-1">
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-design px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              )}
              <Link
                href="/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-design px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <Package className="h-4 w-4" />
                My Orders
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-design px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <Heart className="h-4 w-4" />
                Wishlist
              </Link>
              <Link
                href="/account"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-design px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <Settings className="h-4 w-4" />
                Account Settings
              </Link>
            </div>

            <div className="border-t border-border p-1">
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="flex w-full items-center gap-3 rounded-design px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {isLoading ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
