import {
  buildCheckoutFingerprint,
  getOrCreateCheckoutAttemptSeed,
  clearCheckoutAttemptSeed,
  groupItemsByMerchantDeterministic,
  buildCheckoutIdempotencyKey,
} from '@/lib/checkout-attempt';

describe('checkout-attempt utility', () => {
  beforeEach(() => {
    clearCheckoutAttemptSeed();
    sessionStorage.clear();
  });

  it('reuses attempt seed for the same fingerprint and rotates for a new fingerprint', () => {
    const fingerprintA = buildCheckoutFingerprint({
      items: [
        { productId: 'p2', variantId: 'v2', quantity: 1, merchantId: 'm2' },
        { productId: 'p1', variantId: 'v1', quantity: 2, merchantId: 'm1' },
      ],
      shippingAddressId: 'address-1',
      paymentMethod: 'KHQR',
      couponCode: 'SAVE10',
    });

    const seed1 = getOrCreateCheckoutAttemptSeed(fingerprintA);
    const seed2 = getOrCreateCheckoutAttemptSeed(fingerprintA);
    expect(seed2).toBe(seed1);

    const fingerprintB = buildCheckoutFingerprint({
      items: [
        { productId: 'p2', variantId: 'v2', quantity: 1, merchantId: 'm2' },
        { productId: 'p1', variantId: 'v1', quantity: 2, merchantId: 'm1' },
      ],
      shippingAddressId: 'address-1',
      paymentMethod: 'KHQR',
      couponCode: 'SAVE15',
    });
    const seed3 = getOrCreateCheckoutAttemptSeed(fingerprintB);
    expect(seed3).not.toBe(seed1);
  });

  it('groups merchant carts deterministically for stable group indexes', () => {
    const groups = groupItemsByMerchantDeterministic([
      { productId: 'p3', variantId: 'v2', quantity: 1, merchantId: 'm2' },
      { productId: 'p2', variantId: 'v1', quantity: 1, merchantId: 'm1' },
      { productId: 'p1', variantId: 'v3', quantity: 1, merchantId: undefined },
      { productId: 'p1', variantId: 'v1', quantity: 1, merchantId: 'm1' },
    ]);

    expect(groups.map((group) => group.merchantKey)).toEqual(['m1', 'm2', 'unknown-merchant']);
    expect(groups[0].items.map((item) => `${item.productId}:${item.variantId}`)).toEqual([
      'p1:v1',
      'p2:v1',
    ]);
  });

  it('builds stable idempotency key from attempt seed and group index', () => {
    expect(buildCheckoutIdempotencyKey('attempt-seed', 3)).toBe('attempt-seed:3');
  });
});
