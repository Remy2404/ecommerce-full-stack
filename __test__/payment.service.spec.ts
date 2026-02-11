import api from '@/services/api';
import { verifyPayment } from '@/services/payment.service';
import { AxiosError } from 'axios';
import { HttpError } from '@/lib/http-error';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

const mockedApi = api as unknown as {
  post: jest.Mock;
};

describe('payment.service verifyPayment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls backend verify endpoint through authenticated api client', async () => {
    mockedApi.post.mockResolvedValue({
      data: {
        success: true,
        message: 'ok',
        data: { isPaid: false, currency: 'USD', message: 'pending' },
      },
    });

    await verifyPayment('abc-md5');

    expect(mockedApi.post).toHaveBeenCalledWith('/payments/verify/md5/abc-md5');
  });

  it('rethrows unauthorized error so poller can stop and auth flow can redirect', async () => {
    const unauthorized = new AxiosError('Unauthorized', undefined, undefined, undefined, {
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: {} as never,
      data: {},
    });
    mockedApi.post.mockRejectedValue(unauthorized);

    await expect(verifyPayment('abc-md5')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Unauthorized',
    });
  });

  it('propagates structured 429 metadata for retry-aware polling', async () => {
    const rateLimited = {
      response: {
        status: 429,
        headers: { 'retry-after': '20' },
        data: { success: false, error: 'Too many requests', code: 'RATE_LIMITED' },
      },
      message: 'Request failed',
    } as AxiosError;
    mockedApi.post.mockRejectedValue(rateLimited);

    await expect(verifyPayment('abc-md5')).rejects.toMatchObject({
      statusCode: 429,
      errorCode: 'RATE_LIMITED',
      retryAfterSeconds: 20,
    });
  });

  it('rethrows network errors as HttpError for terminal handling', async () => {
    const networkError = new AxiosError('Network Error');
    mockedApi.post.mockRejectedValue(networkError);

    await expect(verifyPayment('abc-md5')).rejects.toBeInstanceOf(HttpError);
  });
});
