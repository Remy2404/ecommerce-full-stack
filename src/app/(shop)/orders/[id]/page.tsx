import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { getOrderById } from '@/actions/order.actions';
import { OrderDetailClient } from '@/components/orders/order-detail-client';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return {
    title: `Order #${resolvedParams.id}`,
  };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  
  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=/orders/${resolvedParams.id}`);
  }

  const result = await getOrderById(resolvedParams.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const order = result.data;

  // Transform data to match client component expectations
  const formattedOrder = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    total: order.total.toString(),
    subtotal: order.subtotal.toString(),
    deliveryFee: order.deliveryFee.toString(),
    discount: (order.discount || 0).toString(),
    tax: (order.tax || 0).toString(),
    createdAt: new Date(order.createdAt),
    deliveryInstructions: order.deliveryInstructions,
    shippingAddress: (order as any).deliveryAddress ? {
      firstName: (order as any).user.firstName,
      lastName: (order as any).user.lastName,
      street: (order as any).deliveryAddress.street,
      city: (order as any).deliveryAddress.city,
      province: (order as any).deliveryAddress.province,
      postalCode: (order as any).deliveryAddress.postalCode,
    } : null,
    paymentInfo: (order as any).payment ? {
      method: (order as any).payment.method,
      status: (order as any).payment.status,
      transactionId: (order as any).payment.transactionId,
      amount: (order as any).payment.amount.toString(),
    } : null,
    deliveryInfo: (order as any).delivery ? {
      status: (order as any).delivery.status,
      deliveredTime: (order as any).delivery.deliveredTime ? new Date((order as any).delivery.deliveredTime) : null,
    } : null,
    orderItems: (order as any).orderItems?.map((item: any) => ({
      id: item.id,
      productName: item.productName,
      productImage: item.productImage,
      variantName: item.variantName,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      subtotal: item.subtotal.toString(),
    })) || [],
  };

  return <OrderDetailClient order={formattedOrder} />;
}
