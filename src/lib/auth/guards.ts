/**
 * Warn if current host isn't in Firebase Auth → Authorized domains.
 */
const DEFAULT_ALLOWED = [
  "localhost",
  "127.0.0.1",
  "testyourself.app",
  "www.testyourself.app",
  "testyourself-80a10.web.app",
  "testyourself-80a10.firebaseapp.com"
];

export function assertAuthorizedDomain(host: string, extraAllowed: string[] = []) {
  try {
    const envList = (process.env.NEXT_PUBLIC_AUTH_ALLOWED_DOMAINS || process.env.VITE_AUTH_ALLOWED_DOMAINS || "");
    const allowed = new Set(
      envList.split(",").map(s => s.trim()).filter(Boolean)
        .concat(DEFAULT_ALLOWED)
        .concat(extraAllowed)
    );

    const isAllowed =
      allowed.has(host) ||
      allowed.has(host.replace(/^www\./, "")) ||
      (host.endsWith(".localhost") && allowed.has("localhost"));

    if (!isAllowed && typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.warn(`[Auth] Current host "${host}" is not in Authorized Domains. Add it in Firebase Console → Authentication → Settings.`);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[Auth] Domain check skipped:", e);
  }
}
