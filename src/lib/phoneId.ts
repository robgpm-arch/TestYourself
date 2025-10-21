// Helpers to normalize phone numbers and derive synthetic auth emails

/**
 * Normalize a raw mobile input into E.164.
 * For Indian mobiles, a 10-digit input becomes +91xxxxxxxxxx by default.
 */
export function normalizeToE164(raw: string, defaultCountry = '+91'): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';
  // If the user typed a 10-digit mobile, assume Indian country code by default
  if (digits.length === 10) return defaultCountry + digits;
  // If they already included a +countrycode, keep it; otherwise just prefix +
  return raw.startsWith('+') ? raw : '+' + digits;
}

/** Convert an E.164 phone number to a synthetic email for Firebase auth. */
export function phoneToSynthEmail(e164: string): string {
  const digits = (e164 || '').replace(/^\+/, '');
  return `ph-${digits}@testyourself.app`;
}

/** Convenience: raw mobile -> normalized synthetic email. */
export function mobileToAuthEmail(rawMobile: string, defaultCountry = '+91') {
  return phoneToSynthEmail(normalizeToE164(rawMobile, defaultCountry));
}

