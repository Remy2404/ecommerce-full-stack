import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { getUserOrders } from '@/actions/order.actions';
import { OrdersClient } from '@/components/orders/orders-client';

export const metadata = {
  title: 'My Orders',
  description: 'View and track your order history.',
};

export default async function OrdersPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/api/auth/signin?callbackUrl=/orders');
  }

  const result = await getUserOrders();
  const orders = result.success ? result.data || [] : [];

  // Transform data to match client component expectations if needed
  const formattedOrders = (orders as any[]).map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    total: order.total.toString(),
    createdAt: new Date(order.createdAt),
  }));

  return <OrdersClient orders={formattedOrders} />;
}
