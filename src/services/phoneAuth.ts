import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { getAuth } from '../lib/firebaseClient';

// Extend window for debug flag
declare global {
  interface Window {
    __DEBUG?: boolean;
  }
}

// Module-level single instances (required for proper reCAPTCHA management)
let recaptcha: RecaptchaVerifier | null = null;
let confirmation: ConfirmationResult | null = null;

/**
 * Ensures exactly one RecaptchaVerifier instance exists per page.
 * Creates new instance if expired or missing.
 */
function ensureRecaptcha(auth: any, anchorId: string): RecaptchaVerifier {
  if (!recaptcha) {
    // Ensure an anchor element exists in DOM; create a hidden one if missing
    let container: string | HTMLElement = anchorId;
    try {
      if (typeof document !== 'undefined') {
        const el = document.getElementById(anchorId);
        if (el) {
          container = el;
        } else {
          const div = document.createElement('div');
          div.id = anchorId;
          div.style.display = 'none';
          document.body.appendChild(div);
          container = div;
        }
      }
    } catch {}

    recaptcha = new RecaptchaVerifier(auth, container, {
      size: 'invisible',
      callback: () => {
        if (window.__DEBUG) console.log('[PhoneAuth] reCAPTCHA solved');
      },
    });
  }
  return recaptcha;
}

/**
 * Sends OTP to phone number with E.164 validation.
 * @param e164Number Phone number in +countrycodenumber format (e.g., +911234567890)
 */
export async function sendOtp(e164Number: string): Promise<void> {
  if (window.__DEBUG) console.log('[PhoneAuth] sendOtp called with:', e164Number);

  // Validate E.164 format
  if (!e164Number.startsWith('+') || e164Number.length < 10) {
    const error = new Error('Invalid phone number format. Use +country code (e.g., +911234567890)');
    if (window.__DEBUG) console.error('[PhoneAuth] sendOtp validation failed:', error.message);
    throw error;
  }

  try {
    const auth = await getAuth();
    const appVerifier = ensureRecaptcha(auth, 'send-otp-anchor');
    confirmation = await signInWithPhoneNumber(auth, e164Number, appVerifier);
    if (window.__DEBUG) console.log('[PhoneAuth] sendOtp success - OTP sent');
  } catch (error: any) {
    if (window.__DEBUG) console.error('[PhoneAuth] sendOtp failed:', error.code, error.message);
    // Reset verifier so next attempt can recreate a fresh instance
    try {
      recaptcha?.clear();
    } catch {}
    recaptcha = null;
    throw error;
  }
}

/**
 * Confirms OTP code and completes authentication.
 * @param code 6-digit OTP code
 */
export async function confirmOtp(code: string): Promise<void> {
  if (window.__DEBUG) console.log('[PhoneAuth] confirmOtp called with code length:', code.length);

  if (!confirmation) {
    const error = new Error('No OTP request pending. Please request OTP first.');
    if (window.__DEBUG) console.error('[PhoneAuth] confirmOtp failed:', error.message);
    throw error;
  }

  try {
    await confirmation.confirm(code);
    const auth = await getAuth();
    await auth.currentUser?.getIdToken(true); // Refresh claims
    if (window.__DEBUG) console.log('[PhoneAuth] confirmOtp success - user authenticated');
  } catch (error: any) {
    if (window.__DEBUG) console.error('[PhoneAuth] confirmOtp failed:', error.code, error.message);
    throw error;
  }
}

/**
 * Resets the OTP flow - clears confirmation and recaptcha.
 * Call this before resending OTP.
 */
export function resetOtpFlow(): void {
  if (window.__DEBUG) console.log('[PhoneAuth] resetOtpFlow called');

  confirmation = null;
  if (recaptcha) {
    recaptcha.clear();
    recaptcha = null;
  }
}

/**
 * Returns true if an OTP request is pending (confirmation exists).
 */
export function isOtpPending(): boolean {
  return confirmation !== null;
}

/**
 * Maps Firebase auth errors to user-friendly messages.
 */
export function mapAuthError(error: any): string {
  if (!error?.code) return 'An unexpected error occurred. Please try again.';

  switch (error.code) {
    case 'auth/invalid-phone-number':
      return 'Invalid phone number format. Please use +country code (e.g., +911234567890)';
    case 'auth/missing-phone-number':
      return 'Phone number is required';
    case 'auth/too-many-requests':
      return 'Too many requests. Please wait a few minutes before trying again';
    case 'auth/invalid-verification-code':
      return 'Invalid OTP code. Please check and try again';
    case 'auth/code-expired':
      return 'OTP has expired. Please request a new one';
    case 'auth/invalid-verification-id':
      return 'OTP session expired. Please request a new OTP';
    case 'auth/missing-verification-code':
      return 'Please enter the 6-digit OTP code';
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded. Please try again later';
    default:
      return `Authentication failed: ${error.message || 'Unknown error'}`;
  }
}
