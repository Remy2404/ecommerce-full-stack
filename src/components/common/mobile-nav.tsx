'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { House, Search, Heart, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/hooks/cart-context';
import { useWishlist } from '@/hooks/wishlist-context';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { href: '/', icon: House, label: 'Home' },
  { href: '/products', icon: Search, label: 'Shop' },
  { href: '/wishlist', icon: Heart, label: 'Wishlist' },
  { href: '/cart', icon: ShoppingCart, label: 'Cart' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function MobileNav() {
  const pathname = usePathname();
  const { itemCount: cartItemCount, isHydrated: isCartHydrated } = useCart();
  const { itemCount: wishlistCount, isHydrated: isWishlistHydrated } = useWishlist();

  // Hide on desktop and on checkout pages
  if (pathname.startsWith('/checkout')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden">
      <div className="safe-area-inset-bottom">
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            const count = item.label === 'Cart'
              ? (isCartHydrated ? cartItemCount : 0)
              : item.label === 'Wishlist'
                ? (isWishlistHydrated ? wishlistCount : 0)
                : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center gap-1 px-3 py-2 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {count > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                      {count > 9 ? '9+' : count}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute -top-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// Add safe area padding for iOS devices
const styles = `
.safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined') {
  const styleId = 'mobile-nav-styles';
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
}
