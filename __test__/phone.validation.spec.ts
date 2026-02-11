import { isValidPhoneNumberInput, normalizePhoneToE164 } from '@/lib/phone';
import { registerSchema } from '@/validations/auth';

describe('Global phone validation', () => {
  it('accepts valid local and international formats', () => {
    expect(isValidPhoneNumberInput('09620264091', 'KH')).toBe(true);
    expect(isValidPhoneNumberInput('+8559620264091')).toBe(true);
    expect(isValidPhoneNumberInput('07911123456', 'GB')).toBe(true);
    expect(normalizePhoneToE164('09620264091', 'KH')).toBe('+8559620264091');
    expect(normalizePhoneToE164('096-202-64091', 'KH')).toBe('+8559620264091');
    expect(normalizePhoneToE164('2025550187', 'US')).toBe('+12025550187');
  });

  it('rejects invalid formats', () => {
    expect(isValidPhoneNumberInput('1234', 'KH')).toBe(false);
    expect(isValidPhoneNumberInput('09abc264091', 'KH')).toBe(false);
    expect(normalizePhoneToE164('++855123')).toBeNull();
  });

  it('register schema uses the same backend-compatible rule', () => {
    const valid = registerSchema.safeParse({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '09620264091',
      password: 'Password1',
      confirmPassword: 'Password1',
      agreeToTerms: true,
    });
    expect(valid.success).toBe(true);

    const invalid = registerSchema.safeParse({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234',
      password: 'Password1',
      confirmPassword: 'Password1',
      agreeToTerms: true,
    });
    expect(invalid.success).toBe(false);
  });
});
