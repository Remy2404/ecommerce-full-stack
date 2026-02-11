import { CountryCode, getCountries, parsePhoneNumberFromString } from 'libphonenumber-js';

const SUPPORTED_COUNTRIES = new Set<string>(getCountries());
const DEFAULT_REGION = (process.env.NEXT_PUBLIC_DEFAULT_PHONE_REGION || 'KH').toUpperCase();

function resolveCountryCode(countryOrIso?: string): CountryCode | undefined {
  if (!countryOrIso) return undefined;

  const value = countryOrIso.trim();
  if (!value) return undefined;

  const iso = value.toUpperCase();
  if (iso.length === 2 && SUPPORTED_COUNTRIES.has(iso)) {
    return iso as CountryCode;
  }

  try {
    const names = new Intl.DisplayNames(['en'], { type: 'region' });
    for (const code of SUPPORTED_COUNTRIES) {
      const displayName = names.of(code);
      if (displayName && displayName.toLowerCase() === value.toLowerCase()) {
        return code as CountryCode;
      }
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export function normalizePhoneToE164(phone: string, countryOrIso?: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return null;

  const region = resolveCountryCode(countryOrIso) || (SUPPORTED_COUNTRIES.has(DEFAULT_REGION) ? DEFAULT_REGION as CountryCode : 'KH');
  const parsed = trimmed.startsWith('+')
    ? parsePhoneNumberFromString(trimmed)
    : parsePhoneNumberFromString(trimmed, region);

  if (!parsed || !parsed.isPossible()) {
    return null;
  }

  return parsed.number;
}

export function isValidPhoneNumberInput(phone: string, countryOrIso?: string): boolean {
  return normalizePhoneToE164(phone, countryOrIso) !== null;
}
