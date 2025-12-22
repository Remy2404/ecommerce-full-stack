'use client';

import Link from 'next/link';
import { 
  User, 
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

export default function ProfilePage() {
  // Mock data for the dashboard
  const user = {
    name: "Ramy",
    email: "ramy@example.com",
    memberSince: "December 2024",
    stats: [
      { label: "Orders", value: "12", icon: Package },
      { label: "Wishlist", value: "8", icon: Heart },
      { label: "Points", value: "250", icon: Star },
    ]
  };

  const recentOrders = [
    { id: "ORD-12345", date: "2 hours ago", status: "Delivering", total: "$299.99" },
    { id: "ORD-12344", date: "Yesterday", status: "Delivered", total: "$125.00" },
    { id: "ORD-12343", date: "Dec 18, 2024", status: "Delivered", total: "$59.99" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Header / Welcome */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
            {user.name.charAt(0)}
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
        {user.stats.map((stat, i) => (
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
              <Button variant="ghost" size="sm" asChild>
                <Link href="/orders" className="gap-1">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-design border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-design-sm bg-muted flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {order.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="font-semibold">{order.total}</p>
                      </div>
                      <Badge variant={order.status === 'Delivering' ? 'warning' : 'success'}>
                        {order.status}
                      </Badge>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/orders/${order.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
          <div className="rounded-design-lg bg-primary p-6 text-primary-foreground">
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
