import api from '@/services/api';
import { verifyPayment } from '@/services/payment.service';

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
});

