import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { OrderDetailClient } from '@/components/orders/order-detail-client';
import { OrdersClient } from '@/components/orders/orders-client';
import type { Order } from '@/types/order';

const baseOrder: Order = {
  id: 'order-1',
  orderNumber: 'ORD-001',
  userId: 'user-1',
  status: 'PREPARING',
  paymentStatus: 'PENDING',
  paymentMethod: 'KHQR',
  items: [],
  subtotal: 100,
  deliveryFee: 5,
  discount: 0,
  tax: 10,
  total: 115,
  shippingAddress: {
    fullName: 'John Doe',
    phone: '012345678',
    street: 'Street 1',
    city: 'Phnom Penh',
    zipCode: '12000',
    country: 'Cambodia',
  },
  createdAt: '2026-02-10T00:00:00Z',
  updatedAt: '2026-02-10T00:00:00Z',
};

describe('orders UI status alignment', () => {
  it('treats COMPLETED payment as success state', () => {
    render(<OrderDetailClient order={{ ...baseOrder, paymentStatus: 'COMPLETED' }} />);
    const badge = screen.getByText('COMPLETED');
    expect(badge.className).toContain('bg-success');
  });

  it('allows filtering by backend semantic order statuses', () => {
    render(
      <OrdersClient
        orders={[
          { ...baseOrder, id: 'order-preparing', orderNumber: 'ORD-PRE', status: 'PREPARING' },
          { ...baseOrder, id: 'order-delivered', orderNumber: 'ORD-DEL', status: 'DELIVERED' },
        ]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Preparing' }));
    expect(screen.getByText('#ORD-PRE')).toBeInTheDocument();
    expect(screen.queryByText('#ORD-DEL')).not.toBeInTheDocument();
  });
});
