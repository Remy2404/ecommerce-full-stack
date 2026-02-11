'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth-context';
import { getUserOrders } from '@/services/order.service';
import { OrdersClient } from '@/components/orders/orders-client';
import { Order } from '@/types/order';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?callbackUrl=/orders');
      return;
    }

    async function fetchOrders() {
      if (!isAuthenticated) return;
      
      try {
        const result = await getUserOrders(0, 50);
        setOrders(result.orders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        router.push('/login?callbackUrl=/orders');
      } finally {
        setDataLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-background pt-16 lg:pt-20 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return <OrdersClient orders={orders} />;
}
