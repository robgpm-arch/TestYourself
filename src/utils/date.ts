// src/utils/date.ts

/**
 * Parse a DOB string in either 'dd-mm-yyyy' or 'yyyy-mm-dd' to a Date (local).
 * Returns null if invalid.
 */
export function parseDobString(dob: string): Date | null {
  if (!dob) return null;

  // 'dd-mm-yyyy'
  if (/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
    const [dd, mm, yyyy] = dob.split('-').map(n => parseInt(n, 10));
    if (!dd || !mm || !yyyy) return null;
    // Use noon to avoid timezone midnight issues
    const d = new Date(yyyy, mm - 1, dd, 12, 0, 0, 0);
    // Guard against invalid dates (e.g., 31-02-2024)
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }

  // 'yyyy-mm-dd' (native date input)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    const [yyyy, mm, dd] = dob.split('-').map(n => parseInt(n, 10));
    const d = new Date(yyyy, mm - 1, dd, 12, 0, 0, 0);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }

  // Try generic parse as last resort
  const t = Date.parse(dob);
  if (Number.isNaN(t)) return null;
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Calculate age in full years at "today" from a Date of birth.
 */
export function calcAgeFromDate(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return Math.max(0, age);
}

/**
 * Safe convenience that accepts a DOB string (dd-mm-yyyy or yyyy-mm-dd).
 */
export function calcAgeFromDobString(dob: string): number | null {
  const d = parseDobString(dob);
  if (!d) return null;
  return calcAgeFromDate(d);
}