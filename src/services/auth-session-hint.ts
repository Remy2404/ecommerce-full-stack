const AUTH_SESSION_HINT_KEY = 'wing.auth.session';

const isBrowser = typeof window !== 'undefined';

const safeStorageGet = (key: string): string | null => {
  if (!isBrowser) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeStorageSet = (key: string, value: string): void => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures (e.g., private mode restrictions).
  }
};

const safeStorageRemove = (key: string): void => {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures (e.g., private mode restrictions).
  }
};

export const hasAuthSessionHint = (): boolean => safeStorageGet(AUTH_SESSION_HINT_KEY) === '1';

export const markAuthSessionHint = (): void => {
  safeStorageSet(AUTH_SESSION_HINT_KEY, '1');
};

export const clearAuthSessionHint = (): void => {
  safeStorageRemove(AUTH_SESSION_HINT_KEY);
};
