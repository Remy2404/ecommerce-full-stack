import api from '@/services/api';
import { createOrder } from '@/services/order.service';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
  },
}));

const mockedApi = api as unknown as {
  post: jest.Mock;
};

const orderApiResponse = {
  id: 'order-1',
  orderNumber: 'ORD-001',
  status: 'PENDING',
  paymentStatus: 'PENDING',
  items: [],
  subtotal: 100,
  deliveryFee: 5,
  discount: 0,
  tax: 10,
  total: 115,
  createdAt: '2026-02-10T00:00:00Z',
};

const requestPayload = {
  items: [{ productId: 'p1', quantity: 1 }],
  paymentMethod: 'KHQR' as const,
  shippingAddress: {
    fullName: 'John Doe',
    phone: '012345678',
    street: 'Street 1',
    city: 'Phnom Penh',
    zipCode: '12000',
    country: 'Cambodia',
  },
};

describe('order.service createOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends Idempotency-Key header when provided', async () => {
    mockedApi.post.mockResolvedValue({ data: orderApiResponse });

    const result = await createOrder(requestPayload, 'idem-key-1');

    expect(result.success).toBe(true);
    expect(mockedApi.post).toHaveBeenCalledWith('/orders', requestPayload, {
      headers: { 'Idempotency-Key': 'idem-key-1' },
    });
  });

  it('does not send Idempotency-Key header when not provided', async () => {
    mockedApi.post.mockResolvedValue({ data: orderApiResponse });

    const result = await createOrder(requestPayload);

    expect(result.success).toBe(true);
    expect(mockedApi.post).toHaveBeenCalledWith('/orders', requestPayload, {
      headers: undefined,
    });
  });
});

