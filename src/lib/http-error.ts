import { AxiosError } from 'axios';

type MessageShape = { message?: string };

export function getErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;

  if (error instanceof AxiosError) {
    const data = error.response?.data as unknown;
    if (data && typeof data === 'object' && 'message' in data) {
      const msg = (data as MessageShape).message;
      if (typeof msg === 'string' && msg.trim()) return msg;
    }

    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message;
    }
  }

  return fallback;
}

