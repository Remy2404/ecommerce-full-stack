'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Search, 
  ChevronRight, 
  Clock, 
  Filter,
  ArrowLeft,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import { Order } from '@/types/order';

interface OrdersClientProps {
  orders: Order[];
}

const statusFilters = [
  { label: 'All Orders', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

export function OrdersClient({ orders }: OrdersClientProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = activeFilter === 'all' || order.status.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'success';
      case 'shipped':
      case 'delivering': return 'warning';
      case 'processing':
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/profile"
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">My Orders</h1>
        <p className="mt-2 text-muted-foreground">
          View and track your order history.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 lg:flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter Status
              </h3>
              <div className="space-y-1">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`w-full text-left rounded-design px-3 py-2 text-sm transition-colors ${
                      activeFilter === filter.value 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="rounded-design-lg bg-primary/5 p-6 border border-primary/10">
              <h4 className="font-semibold text-sm mb-2">Need help?</h4>
              <p className="text-xs text-muted-foreground mb-4">
                If you have any issues with your orders, please contact our support team.
              </p>
              <Button variant="outline" size="sm" className="w-full">Contact Support</Button>
            </div>
          </div>
        </aside>

        {/* Orders List */}
        <main className="flex-1">
          {/* Search */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by order number (e.g. ORD-...)" 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <AnimatePresence mode="popLayout">
            {filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {filteredOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    layout
                  >
                    <Link href={`/orders/${order.id}`}>
                      <Card className="hover:border-primary/30 hover:shadow-soft transition-all group overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6">
                            <div className="flex items-center gap-4 mb-4 sm:mb-0">
                              <div className="h-12 w-12 rounded-design bg-muted flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                <Package className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-lg">#{order.orderNumber}</p>
                                  <Badge variant={getStatusVariant(order.status)}>
                                    {order.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
                              <div className="text-left sm:text-right">
                                <p className="text-sm text-muted-foreground">Total Amount</p>
                                <p className="text-xl font-bold text-primary">{formatPrice(order.total)}</p>
                              </div>
                              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                <ChevronRight className="h-5 w-5" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center rounded-design-lg border-2 border-dashed border-border bg-muted/20"
              >
                <div className="h-20 w-20 rounded-full bg-muted/40 flex items-center justify-center mb-6">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-semibold">No orders found</h3>
                <p className="mt-2 text-muted-foreground max-w-xs mx-auto">
                  {searchQuery || activeFilter !== 'all' 
                    ? "We couldn't find any orders matching your current filters."
                    : "You haven't placed any orders yet. Start shopping to see your orders here!"}
                </p>
                <Button className="mt-8" asChild>
                  <Link href="/products">Start Shopping</Link>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
