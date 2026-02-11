type CheckoutAttemptStorageRecord = {
  fingerprint: string;
  seed: string;
};

export type CheckoutFingerprintItem = {
  productId: string;
  variantId?: string | null;
  quantity: number;
  merchantId?: string | null;
};

export type CheckoutFingerprintInput = {
  items: CheckoutFingerprintItem[];
  shippingAddressId?: string;
  paymentMethod: string;
  couponCode?: string;
};

export type MerchantGroup<T extends CheckoutFingerprintItem> = {
  merchantKey: string;
  items: T[];
};

const CHECKOUT_ATTEMPT_STORAGE_KEY = 'checkout:attempt:v1';
const UNKNOWN_MERCHANT_KEY = 'unknown-merchant';

const normalizeString = (value?: string | null): string => (value ?? '').trim();

const createAttemptSeed = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const sortFingerprintItems = <T extends CheckoutFingerprintItem>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const merchantCompare = normalizeString(a.merchantId).localeCompare(normalizeString(b.merchantId));
    if (merchantCompare !== 0) return merchantCompare;

    const productCompare = normalizeString(a.productId).localeCompare(normalizeString(b.productId));
    if (productCompare !== 0) return productCompare;

    const variantCompare = normalizeString(a.variantId).localeCompare(normalizeString(b.variantId));
    if (variantCompare !== 0) return variantCompare;

    return a.quantity - b.quantity;
  });
};

export function buildCheckoutFingerprint(input: CheckoutFingerprintInput): string {
  const normalizedItems = sortFingerprintItems(input.items).map((item) => ({
    productId: normalizeString(item.productId),
    variantId: normalizeString(item.variantId),
    quantity: item.quantity,
    merchantId: normalizeString(item.merchantId),
  }));

  return JSON.stringify({
    items: normalizedItems,
    shippingAddressId: normalizeString(input.shippingAddressId),
    paymentMethod: normalizeString(input.paymentMethod).toUpperCase(),
    couponCode: normalizeString(input.couponCode).toUpperCase(),
  });
}

function readAttemptRecord(): CheckoutAttemptStorageRecord | null {
  if (typeof window === 'undefined') return null;

  const raw = sessionStorage.getItem(CHECKOUT_ATTEMPT_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<CheckoutAttemptStorageRecord>;
    if (!parsed.fingerprint || !parsed.seed) return null;
    return { fingerprint: parsed.fingerprint, seed: parsed.seed };
  } catch {
    return null;
  }
}

function writeAttemptRecord(record: CheckoutAttemptStorageRecord): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(CHECKOUT_ATTEMPT_STORAGE_KEY, JSON.stringify(record));
}

export function getOrCreateCheckoutAttemptSeed(fingerprint: string): string {
  const existing = readAttemptRecord();
  if (existing && existing.fingerprint === fingerprint) {
    return existing.seed;
  }

  const nextSeed = createAttemptSeed();
  writeAttemptRecord({ fingerprint, seed: nextSeed });
  return nextSeed;
}

export function clearCheckoutAttemptSeed(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(CHECKOUT_ATTEMPT_STORAGE_KEY);
}

export function groupItemsByMerchantDeterministic<T extends CheckoutFingerprintItem>(
  items: T[]
): MerchantGroup<T>[] {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const merchantKey = normalizeString(item.merchantId) || UNKNOWN_MERCHANT_KEY;
    if (!grouped.has(merchantKey)) {
      grouped.set(merchantKey, []);
    }
    grouped.get(merchantKey)!.push(item);
  }

  const sortedMerchantKeys = [...grouped.keys()].sort((a, b) => a.localeCompare(b));

  return sortedMerchantKeys.map((merchantKey) => ({
    merchantKey,
    items: sortFingerprintItems(grouped.get(merchantKey) ?? []),
  }));
}

export function buildCheckoutIdempotencyKey(attemptSeed: string, groupIndex: number): string {
  return `${attemptSeed}:${groupIndex}`;
}
