'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ShoppingCart,
  Search,
  Heart,
  Package,
  LogOut,
  Settings,
  UserCircle,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth-context';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import PillNav from '@/components/reactbit/PillNav';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

import { useCart } from '@/hooks/cart-context';
import { useWishlist } from '@/hooks/wishlist-context';
import { ThemeToggle } from '@/components/common/theme-toggle';

// User data is now provided by useAuth hook

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/products?sort=newest', label: 'New Arrivals' },
  { href: '/products?featured=true', label: 'Featured' },
  { href: '/products?sale=true', label: 'Sale' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount: cartItemCount, isHydrated: isCartHydrated } = useCart();
  const { itemCount: wishlistCount, isHydrated: isWishlistHydrated } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdminRoute) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdminRoute]);

  // Close mobile menu on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname, searchParams, isMobileMenuOpen]);

  const isLinkActive = (href: string) => {
    const [path, query] = href.split('?');

    if (pathname !== path) {
      // For Home page, strict match
      if (href === '/' && pathname === '/') return true;
      return false;
    }

    // Special case for Home link when path is just /
    if (href === '/' && pathname === '/') return true;

    const linkParams = new URLSearchParams(query || '');
    const linkParamKeys = Array.from(linkParams.keys());

    if (linkParamKeys.length === 0) {
      // For "Shop" (/products), it should only be active if no other nav link params are present
      const hasSpecialFilter = searchParams.get('featured') === 'true' ||
        searchParams.get('sale') === 'true' ||
        searchParams.get('sort') === 'newest';
      return !hasSpecialFilter;
    }

    // For links with query params, check if they all match
    return linkParamKeys.every(key => searchParams.get(key) === linkParams.get(key));
  };

  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-base',
          isScrolled
            ? 'glass-strong shadow-soft'
            : 'bg-background/80 backdrop-blur-sm'
        )}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20 relative">
            {/* Left: Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold tracking-tight"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-design-sm bg-primary text-primary-foreground">
                  S
                </div>
                <span className="hidden sm:inline lg:hidden xl:inline">Store</span>
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <PillNav
                items={navLinks}
                activeHref={navLinks.find(l => isLinkActive(l.href))?.href}
                showLogo={false}
                baseColor="hsl(var(--primary))"
                pillColor="hsl(var(--background))"
                pillTextColor="hsl(var(--muted-foreground))"
                hoveredPillTextColor="hsl(var(--background))"
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {/* Search Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="hidden sm:flex"
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hidden sm:flex"
                asChild
              >
                <Link href="/wishlist">
                  <Heart className="h-5 w-5" />
                  {isWishlistHydrated && wishlistCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                  <span className="sr-only">Wishlist</span>
                </Link>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                asChild
              >
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {isCartHydrated && cartItemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                  <span className="sr-only">Cart</span>
                </Link>
              </Button>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="relative"
                  >
                    {user.avatarUrl && !imageError ? (
                      <div className="relative h-8 w-8 overflow-hidden rounded-full">
                        <Image
                          src={user.avatarUrl}
                          alt={user.name || 'User avatar'}
                          fill
                          className="object-cover"
                          onError={() => setImageError(true)}
                        />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                        {user.name && user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsUserMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-design border border-border bg-popover p-2 shadow-float"
                        >
                          <div className="border-b border-border px-3 py-2 mb-2">
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                          <Link
                            href="/profile"
                            className="flex items-center gap-2 rounded-design-sm px-3 py-2 text-sm transition-colors hover:bg-accent"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <UserCircle className="h-4 w-4" />
                            My Profile
                          </Link>
                          {user.role === 'ADMIN' && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-2 rounded-design-sm px-3 py-2 text-sm transition-colors hover:bg-accent"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <LayoutGrid className="h-4 w-4" />
                              Admin Dashboard
                            </Link>
                          )}
                          <Link
                            href="/orders"
                            className="flex items-center gap-2 rounded-design-sm px-3 py-2 text-sm transition-colors hover:bg-accent"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Package className="h-4 w-4" />
                            My Orders
                          </Link>
                          <Link
                            href="/settings"
                            className="flex items-center gap-2 rounded-design-sm px-3 py-2 text-sm transition-colors hover:bg-accent"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </Link>
                          <button
                            className="flex w-full items-center gap-2 rounded-design-sm px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                            onClick={async () => {
                              setIsUserMenuOpen(false);
                              await logout();
                            }}
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex sm:items-center sm:gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-full w-80 max-w-full bg-background p-6 shadow-dramatic lg:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-bold">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'block rounded-design px-4 py-3 text-base font-medium transition-colors',
                      isLinkActive(link.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-8 border-t border-border pt-8">
                {!user && (
                  <div className="space-y-3">
                    <Button className="w-full" asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/register">Create Account</Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setIsSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed left-1/2 top-24 z-50 w-full max-w-2xl -translate-x-1/2 px-4"
            >
              <div className="rounded-design-lg bg-background p-4 shadow-dramatic">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    autoFocus
                    className="w-full rounded-design border-0 bg-muted py-4 pl-12 pr-4 text-base outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
