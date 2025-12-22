'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ShoppingCart, 
  User, 
  Search, 
  Heart,
  Package,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOutUser } from '@/actions/auth.actions';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface NavbarProps {
  cartItemCount?: number;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
}

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/products?category=new', label: 'New Arrivals' },
  { href: '/products?featured=true', label: 'Featured' },
];

export function Navbar({ cartItemCount = 0, user }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2 text-xl font-bold tracking-tight"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-design-sm bg-primary text-primary-foreground">
                S
              </div>
              <span className="hidden sm:inline">Store</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    pathname === link.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
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
                asChild
                className="hidden sm:flex"
              >
                <Link href="/wishlist">
                  <Heart className="h-5 w-5" />
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
                  {cartItemCount > 0 && (
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
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
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
                              await signOutUser();
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
                      pathname === link.href
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
