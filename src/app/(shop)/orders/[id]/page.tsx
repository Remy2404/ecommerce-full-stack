'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth-context';
import { getOrderById } from '@/actions/order.actions';
import { OrderDetailClient } from '@/components/orders/order-detail-client';
import { Order } from '@/types/order';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?callbackUrl=/orders/${resolvedParams.id}`);
      return;
    }

    async function fetchOrder() {
      if (!isAuthenticated) return;
      
      try {
        const result = await getOrderById(resolvedParams.id);
        
        if (!result.success || !result.data) {
          setNotFound(true);
          return;
        }

        const orderData = result.data;
        if (!orderData) return;

        setOrder(orderData);
      } catch (error) {
        console.error('Failed to fetch order:', error);
        setNotFound(true);
      } finally {
        setDataLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchOrder();
    }
  }, [isAuthenticated, isLoading, router, resolvedParams.id]);

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-background pt-16 lg:pt-20 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background pt-16 lg:pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground">The order you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return <OrderDetailClient order={order} />;
}
