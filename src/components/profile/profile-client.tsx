'use client';

import Link from 'next/link';
import { 
  Package, 
  Heart, 
  Settings, 
  ChevronRight, 
  ShoppingBag, 
  Clock, 
  CreditCard, 
  MapPin,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/hooks/wishlist-context';
import Image from 'next/image';
import type { Order } from '@/types/order';

interface ProfileClientProps {
  user: {
    name: string;
    email: string;
    image?: string;
    memberSince: string;
  };
  stats: {
    orderCount: number;
    points: number;
  };
  recentOrders: Order[];
}

export function ProfileClient({ user, stats, recentOrders }: ProfileClientProps) {
  const { itemCount: wishlistCount, isHydrated: isWishlistHydrated } = useWishlist();

  const dashboardStats = [
    { label: "Orders", value: stats.orderCount.toString(), icon: Package },
    { 
      label: "Wishlist", 
      value: isWishlistHydrated ? wishlistCount.toString() : "...", 
      icon: Heart 
    },
    { label: "Points", value: stats.points.toString(), icon: Star },
  ];

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(price));
  };

  const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return 'success';
      case 'DELIVERING':
      case 'READY':
        return 'warning';
      case 'PENDING':
      case 'CONFIRMED':
      case 'PREPARING':
      case 'PAID':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Header / Welcome */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-2 border-background shadow-soft">
            {user.image ? (
              <Image src={user.image} alt={user.name} width={80} height={80} className="h-full w-full object-cover" />
            ) : (
              <span>{user.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}!</h1>
            <p className="text-muted-foreground">Member since {user.memberSince}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button asChild>
            <Link href="/products">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Shop Now
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        {dashboardStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className="h-12 w-12 rounded-design-sm bg-primary/5 flex items-center justify-center text-primary">
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              {recentOrders.length > 0 && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/orders" className="gap-1">
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-design border border-border hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-design-sm bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">#{order.orderNumber}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="font-semibold">{formatPrice(order.total)}</p>
                        </div>
                        <Badge variant={getStatusVariant(order.status)}>
                          {order.status}
                        </Badge>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/orders/${order.orderNumber}`}>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mb-4 opacity-20" />
                  <p>You haven&apos;t placed any orders yet.</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link href="/products">Browse products</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions / Shortcuts */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button variant="outline" className="w-full justify-between group" asChild>
                <Link href="/wishlist">
                  <span className="flex items-center">
                    <Heart className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                    My Wishlist
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href="/settings">
                   <span className="flex items-center">
                    <CreditCard className="mr-3 h-4 w-4 text-muted-foreground" />
                    Payment Methods
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href="/settings">
                   <span className="flex items-center">
                    <MapPin className="mr-3 h-4 w-4 text-muted-foreground" />
                    Shipping Addresses
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Promotion Card */}
          <div className="rounded-design-lg bg-primary p-6 text-primary-foreground shadow-elevated">
            <h3 className="text-lg font-bold mb-2">Refer a Friend</h3>
            <p className="text-sm text-primary-foreground/80 mb-4">
              Get $10 for every friend you refer. They get $10 off their first order too!
            </p>
            <Button variant="secondary" className="w-full">Get Referral Link</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
