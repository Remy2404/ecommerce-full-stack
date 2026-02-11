import api from '@/services/api';
import { createOrder, getOrderByNumber, getUserOrders } from '@/services/order.service';
import { AxiosError } from 'axios';

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
  get: jest.Mock;
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
  couponCode: 'SAVE10',
  shippingAddress: {
    fullName: 'John Doe',
    phone: '0962026409',
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

describe('order.service getUserOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rethrows on unauthorized so caller can redirect', async () => {
    const unauthorized = {
      response: { status: 401 },
    } as AxiosError;
    mockedApi.get.mockRejectedValue(unauthorized);

    await expect(getUserOrders(0, 20)).rejects.toBe(unauthorized);
  });

  it('returns empty orders on non-auth failures', async () => {
    mockedApi.get.mockRejectedValue(new Error('network'));

    await expect(getUserOrders(0, 20)).resolves.toEqual({
      orders: [],
      pagination: { page: 0, limit: 20, total: 0, totalPages: 0 },
    });
  });
});

describe('order.service getOrderByNumber', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null on 404', async () => {
    const notFound = {
      response: { status: 404 },
    } as AxiosError;
    mockedApi.get.mockRejectedValue(notFound);

    await expect(getOrderByNumber('ORD-404')).resolves.toBeNull();
  });

  it('rethrows on unauthorized so caller can redirect', async () => {
    const unauthorized = {
      response: { status: 401 },
    } as AxiosError;
    mockedApi.get.mockRejectedValue(unauthorized);

    await expect(getOrderByNumber('ORD-401')).rejects.toBe(unauthorized);
  });
});
