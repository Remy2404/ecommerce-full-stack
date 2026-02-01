'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth-context';
import { getUserOrders } from '@/actions/order.actions';
import { OrdersClient } from '@/components/orders/orders-client';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?callbackUrl=/orders');
      return;
    }

    async function fetchOrders() {
      if (!isAuthenticated) return;
      
      try {
        const result = await getUserOrders();
        if (result.success && result.data) {
          const formattedOrders = (result.data as any[]).map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            total: order.total.toString(),
            createdAt: new Date(order.createdAt),
          }));
          setOrders(formattedOrders);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
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
