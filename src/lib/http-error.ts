import { AxiosError } from 'axios';

type BackendErrorEnvelope = {
  success?: boolean;
  error?: string;
  message?: string;
  code?: string;
};

type AxiosLikeError = {
  message?: string;
  response?: {
    status?: number;
    data?: unknown;
    headers?: unknown;
  };
};

export interface ParsedHttpError {
  message: string;
  errorCode?: string;
  statusCode?: number;
  retryAfterSeconds?: number;
}

export class HttpError extends Error {
  readonly errorCode?: string;
  readonly statusCode?: number;
  readonly retryAfterSeconds?: number;

  constructor(parsed: ParsedHttpError) {
    super(parsed.message);
    this.name = 'HttpError';
    this.errorCode = parsed.errorCode;
    this.statusCode = parsed.statusCode;
    this.retryAfterSeconds = parsed.retryAfterSeconds;
  }
}

const normalizeText = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const toBackendEnvelope = (data: unknown): BackendErrorEnvelope => {
  if (!data || typeof data !== 'object') return {};
  return data as BackendErrorEnvelope;
};

const getHeaderValue = (headers: unknown, key: string): string | undefined => {
  if (!headers || typeof headers !== 'object') return undefined;

  const maybeAxiosHeaders = headers as { get?: (headerName: string) => unknown };
  if (typeof maybeAxiosHeaders.get === 'function') {
    const value = maybeAxiosHeaders.get(key);
    if (typeof value === 'string') return value;
  }

  const record = headers as Record<string, unknown>;
  const headerKey = Object.keys(record).find((candidate) => candidate.toLowerCase() === key.toLowerCase());
  if (!headerKey) return undefined;

  const value = record[headerKey];
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0];
    if (typeof first === 'string' || typeof first === 'number') return String(first);
  }

  return undefined;
};

const parseRetryAfterSeconds = (headerValue?: string): number | undefined => {
  if (!headerValue) return undefined;

  const asSeconds = Number.parseInt(headerValue, 10);
  if (!Number.isNaN(asSeconds) && asSeconds >= 0) return asSeconds;

  const retryDate = Date.parse(headerValue);
  if (!Number.isNaN(retryDate)) {
    const deltaMs = retryDate - Date.now();
    return Math.max(0, Math.ceil(deltaMs / 1000));
  }

  return undefined;
};

export function parseHttpError(error: unknown, fallback: string): ParsedHttpError {
  if (!error) return { message: fallback };

  if (error instanceof HttpError) {
    return {
      message: error.message,
      errorCode: error.errorCode,
      statusCode: error.statusCode,
      retryAfterSeconds: error.retryAfterSeconds,
    };
  }

  const axiosLikeError =
    error instanceof AxiosError || (error && typeof error === 'object' && 'response' in error)
      ? (error as AxiosLikeError)
      : null;

  if (axiosLikeError) {
    const data = axiosLikeError.response?.data as unknown;
    const envelope = toBackendEnvelope(data);
    const message =
      normalizeText(envelope.error) ??
      normalizeText(envelope.message) ??
      normalizeText(axiosLikeError.message) ??
      fallback;
    const retryAfterHeader = getHeaderValue(axiosLikeError.response?.headers, 'retry-after');

    return {
      message,
      errorCode: normalizeText(envelope.code),
      statusCode: axiosLikeError.response?.status,
      retryAfterSeconds: parseRetryAfterSeconds(retryAfterHeader),
    };
  }

  if (error instanceof Error) {
    return { message: normalizeText(error.message) ?? fallback };
  }

  return { message: fallback };
}

export function toHttpError(error: unknown, fallback: string): HttpError {
  if (error instanceof HttpError) return error;
  return new HttpError(parseHttpError(error, fallback));
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return parseHttpError(error, fallback).message;
}
