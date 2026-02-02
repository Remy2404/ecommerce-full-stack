'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth-context';
import { getOrderById } from '@/actions/order.actions';
import { OrderDetailClient } from '@/components/orders/order-detail-client';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [order, setOrder] = useState<any>(null);
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

        const formattedOrder = {
          id: orderData.id,
          orderNumber: orderData.orderNumber,
          status: orderData.status,
          total: orderData.total.toString(),
          subtotal: orderData.subtotal.toString(),
          deliveryFee: orderData.deliveryFee.toString(),
          discount: (orderData.discount || 0).toString(),
          tax: (orderData.tax || 0).toString(),
          createdAt: new Date(orderData.createdAt),
          deliveryInstructions: (orderData as any).deliveryInstructions,
          shippingAddress: (orderData as any).deliveryAddress ? {
            firstName: (orderData as any).user?.firstName,
            lastName: (orderData as any).user?.lastName,
            street: (orderData as any).deliveryAddress.street,
            city: (orderData as any).deliveryAddress.city,
            province: (orderData as any).deliveryAddress.province,
            postalCode: (orderData as any).deliveryAddress.postalCode,
          } : null,
          paymentInfo: (orderData as any).payment ? {
            method: (orderData as any).payment.method,
            status: (orderData as any).payment.status,
            transactionId: (orderData as any).payment.transactionId,
            amount: (orderData as any).payment.amount.toString(),
          } : null,
          deliveryInfo: (orderData as any).delivery ? {
            status: (orderData as any).delivery.status,
            deliveredTime: (orderData as any).delivery.deliveredTime ? new Date((orderData as any).delivery.deliveredTime) : null,
          } : null,
          items: (orderData as any).items?.map((item: any) => ({
            id: item.id,
            productName: item.productName,
            productImage: item.productImage,
            variantName: item.variantName,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
            subtotal: item.subtotal.toString(),
          })) || [],
        };

        setOrder(formattedOrder);
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
