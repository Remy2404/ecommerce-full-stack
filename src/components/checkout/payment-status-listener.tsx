'use client';

import { useEffect } from 'react';
import { verifyPayment } from '@/services/payment.service';
import { toast } from 'sonner';
import { HttpError } from '@/lib/http-error';

interface PaymentStatusListenerProps {
  md5: string;
  expiresAt?: string;
  onSuccess: () => void;
  onTerminalFailure?: (message: string) => void;
}

const DEFAULT_POLL_INTERVAL_MS = 3000;
const SLOW_POLL_INTERVAL_MS = 6000;
const LOCK_TTL_MS = 10000;
const DEFAULT_RATE_LIMIT_COOLDOWN_SECONDS = 60;
const TAB_ID_STORAGE_KEY = 'khqr:poll:tab-id';
const LOCK_KEY_PREFIX = 'khqr:poll:lock:';
const SUCCESS_KEY_PREFIX = 'khqr:poll:success:';

export function PaymentStatusListener({
  md5,
  expiresAt,
  onSuccess,
  onTerminalFailure,
}: PaymentStatusListenerProps) {
  useEffect(() => {
    if (!md5) return;

    const checkExpiration = () => {
      if (expiresAt) {
        const expirationTime = new Date(expiresAt).getTime();
        const now = new Date().getTime();
        if (now > expirationTime) return true;
      }
      return false;
    };

    if (checkExpiration()) {
      const message = 'Transaction timed out. Please generate a new QR code.';
      toast.error(message);
      onTerminalFailure?.(message);
      return;
    }

    let cancelled = false;
    let successHandled = false;
    let pollCount = 0;
    let consecutiveFailures = 0;
    let pollTimeout: NodeJS.Timeout | undefined;
    let rateLimitTimeout: NodeJS.Timeout | undefined;

    const lockKey = `${LOCK_KEY_PREFIX}${md5}`;
    const successKey = `${SUCCESS_KEY_PREFIX}${md5}`;
    const tabId = (() => {
      const existing = sessionStorage.getItem(TAB_ID_STORAGE_KEY);
      if (existing) return existing;
      const next = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(TAB_ID_STORAGE_KEY, next);
      return next;
    })();

    const clearTimers = () => {
      if (pollTimeout) clearTimeout(pollTimeout);
      if (rateLimitTimeout) clearTimeout(rateLimitTimeout);
      pollTimeout = undefined;
      rateLimitTimeout = undefined;
    };

    const releaseLock = () => {
      try {
        const raw = localStorage.getItem(lockKey);
        if (!raw) return;
        const parsed = JSON.parse(raw) as { owner?: string };
        if (parsed.owner === tabId) {
          localStorage.removeItem(lockKey);
        }
      } catch {
        localStorage.removeItem(lockKey);
      }
    };

    const stopPolling = () => {
      cancelled = true;
      clearTimers();
      releaseLock();
    };

    const isPendingFallback = (message: string) => /pending|processing|not found/i.test(message);
    const isTerminalFailureFallback = (message: string) =>
      /amount or currency mismatch|does not belong to you|unauthorized|failed|rejected|denied/i.test(
        message
      );

    const notifySuccessOnce = () => {
      if (successHandled) return;
      successHandled = true;
      clearTimers();
      onSuccess();
    };

    const scheduleNextPoll = (delayMs: number) => {
      if (cancelled) return;
      pollTimeout = setTimeout(() => {
        void pollPayment();
      }, delayMs);
    };

    const tryAcquireLock = (): boolean => {
      const now = Date.now();
      try {
        const existingRaw = localStorage.getItem(lockKey);
        if (existingRaw) {
          const existing = JSON.parse(existingRaw) as { owner?: string; expiresAt?: number };
          if (
            existing.owner &&
            existing.owner !== tabId &&
            typeof existing.expiresAt === 'number' &&
            existing.expiresAt > now
          ) {
            return false;
          }
        }

        localStorage.setItem(
          lockKey,
          JSON.stringify({
            owner: tabId,
            expiresAt: now + LOCK_TTL_MS,
          })
        );

        const confirmRaw = localStorage.getItem(lockKey);
        if (!confirmRaw) return false;
        const confirmed = JSON.parse(confirmRaw) as { owner?: string };
        return confirmed.owner === tabId;
      } catch {
        return true;
      }
    };

    const handleRateLimited = (error: HttpError) => {
      const waitSeconds = error.retryAfterSeconds ?? DEFAULT_RATE_LIMIT_COOLDOWN_SECONDS;
      toast.warning(`Payment verification paused due to rate limiting. Retrying in ${waitSeconds}s.`);
      clearTimers();
      rateLimitTimeout = setTimeout(() => {
        if (!cancelled) {
          scheduleNextPoll(DEFAULT_POLL_INTERVAL_MS);
        }
      }, Math.max(waitSeconds, 1) * 1000);
    };

    const pollPayment = async () => {
      if (cancelled) return;

      if (checkExpiration()) {
        const message = 'Transaction timed out. Please generate a new QR code.';
        toast.error(message);
        onTerminalFailure?.(message);
        stopPolling();
        return;
      }

      if (localStorage.getItem(successKey)) {
        stopPolling();
        notifySuccessOnce();
        return;
      }

      if (!tryAcquireLock()) {
        scheduleNextPoll(DEFAULT_POLL_INTERVAL_MS);
        return;
      }

      try {
        const result = await verifyPayment(md5);
        consecutiveFailures = 0;
        pollCount += 1;

        if (!result) {
          const nextInterval = pollCount > 10 ? SLOW_POLL_INTERVAL_MS : DEFAULT_POLL_INTERVAL_MS;
          scheduleNextPoll(nextInterval);
          return;
        }

        if (result.isPaid) {
          localStorage.setItem(successKey, JSON.stringify({ paidAt: Date.now() }));
          stopPolling();
          notifySuccessOnce();
          return;
        }

        const message = result.message || '';
        const isExpired =
          result.expired === true || /expired|time.?out|timed out/i.test(message);
        if (isExpired) {
          const expirationMessage = result.message || 'Transaction timed out. Please generate a new QR code.';
          toast.error(expirationMessage);
          onTerminalFailure?.(expirationMessage);
          stopPolling();
          return;
        }

        if (isTerminalFailureFallback(message) && !isPendingFallback(message)) {
          const failureMessage =
            result.message || 'Payment verification failed. Please check your order details.';
          toast.error(failureMessage);
          onTerminalFailure?.(failureMessage);
          stopPolling();
          return;
        }

        const nextInterval = pollCount > 10 ? SLOW_POLL_INTERVAL_MS : DEFAULT_POLL_INTERVAL_MS;
        scheduleNextPoll(nextInterval);
      } catch (error) {
        const httpError =
          error instanceof HttpError ? error : new HttpError({ message: 'Failed to verify payment' });

        if (httpError.statusCode === 429) {
          handleRateLimited(httpError);
          return;
        }

        if (httpError.statusCode === 401 || httpError.statusCode === 403) {
          const message = 'Session expired. Please sign in again.';
          toast.error(message);
          onTerminalFailure?.(message);
          stopPolling();
          if (process.env.NODE_ENV !== 'test') {
            const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `/login?callbackUrl=${callbackUrl}`;
          }
          return;
        }

        if (!httpError.statusCode) {
          const message = 'Network error while verifying payment. Please check your connection.';
          toast.error(message);
          onTerminalFailure?.(message);
          stopPolling();
          return;
        }

        consecutiveFailures += 1;
        if (consecutiveFailures >= 5) {
          const message =
            'Payment verification is taking longer than expected. Please check your order history.';
          toast.error(message);
          onTerminalFailure?.(message);
          stopPolling();
          return;
        }

        scheduleNextPoll(SLOW_POLL_INTERVAL_MS);
      } finally {
        releaseLock();
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== successKey || !event.newValue) return;
      stopPolling();
      notifySuccessOnce();
    };

    window.addEventListener('storage', onStorage);
    void pollPayment();

    return () => {
      window.removeEventListener('storage', onStorage);
      stopPolling();
    };
  }, [md5, expiresAt, onSuccess, onTerminalFailure]);

  return null;
}
