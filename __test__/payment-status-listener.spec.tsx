import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { PaymentStatusListener } from '@/components/checkout/payment-status-listener';
import { verifyPayment } from '@/services/payment.service';
import { HttpError } from '@/lib/http-error';

jest.mock('@/services/payment.service', () => ({
  verifyPayment: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

const mockedVerifyPayment = verifyPayment as jest.MockedFunction<typeof verifyPayment>;

describe('PaymentStatusListener', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('pauses and resumes polling when backend responds with 429 retry metadata', async () => {
    mockedVerifyPayment
      .mockRejectedValueOnce(
        new HttpError({
          message: 'Too many requests',
          statusCode: 429,
          retryAfterSeconds: 2,
        })
      )
      .mockResolvedValueOnce({
        isPaid: true,
        currency: 'USD',
        message: 'Payment completed',
      });

    const onSuccess = jest.fn();
    render(<PaymentStatusListener md5="md5-test" onSuccess={onSuccess} />);

    await waitFor(() => expect(mockedVerifyPayment).toHaveBeenCalledTimes(1));

    jest.advanceTimersByTime(4999);
    expect(mockedVerifyPayment).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1);
    await waitFor(() => expect(mockedVerifyPayment).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it('stops polling on auth failure and reports terminal failure', async () => {
    mockedVerifyPayment.mockRejectedValue(
      new HttpError({
        message: 'Unauthorized',
        statusCode: 401,
      })
    );

    const onTerminalFailure = jest.fn();
    render(
      <PaymentStatusListener
        md5="md5-auth"
        onSuccess={jest.fn()}
        onTerminalFailure={onTerminalFailure}
      />
    );

    await waitFor(() => expect(mockedVerifyPayment).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(onTerminalFailure).toHaveBeenCalledWith('Session expired. Please sign in again.')
    );

    jest.advanceTimersByTime(20000);
    expect(mockedVerifyPayment).toHaveBeenCalledTimes(1);
  });
});
