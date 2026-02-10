import { createOrder as createOrderAction } from '@/actions/order.actions';
import * as orderService from '@/services/order.service';
import * as authService from '@/services/auth.service';
import type { CheckoutInput } from '@/types';

jest.mock('@/services/order.service');
jest.mock('@/services/auth.service');

const mockedOrderService = orderService as jest.Mocked<typeof orderService>;
const mockedAuthService = authService as jest.Mocked<typeof authService>;

const checkoutInput: CheckoutInput = {
  items: [
    {
      productId: 'p1',
      variantId: 'v1',
      name: 'Product',
      image: '/img.png',
      quantity: 1,
      price: 10,
    },
  ],
  shippingAddress: {
    id: 'addr-1',
    street: 'Street 1',
    city: 'Phnom Penh',
    province: 'PP',
    postalCode: '12000',
    fullName: 'John Doe',
    phone: '012345678',
  },
  paymentData: { method: 'KHQR' },
  subtotal: 10,
  deliveryFee: 0,
  discount: 0,
  tax: 1,
  total: 11,
};

describe('order.actions createOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('forwards idempotency key to order service', async () => {
    mockedAuthService.getCurrentUser.mockResolvedValue({
      id: 'u1',
      email: 'u@example.com',
      name: 'John Doe',
      role: 'CUSTOMER',
      emailVerified: true,
      twofaEnabled: false,
    });
    mockedOrderService.createOrder.mockResolvedValue({
      success: true,
      order: {
        id: 'order-1',
        orderNumber: 'ORD-001',
      } as never,
    });

    const result = await createOrderAction(checkoutInput, 'idem-action-1');

    expect(result.success).toBe(true);
    expect(mockedOrderService.createOrder).toHaveBeenCalledWith(
      expect.any(Object),
      'idem-action-1'
    );
  });

  it('returns unauthorized and does not call service without current user', async () => {
    mockedAuthService.getCurrentUser.mockResolvedValue(null);

    const result = await createOrderAction(checkoutInput, 'idem-action-2');

    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(mockedOrderService.createOrder).not.toHaveBeenCalled();
  });
});

