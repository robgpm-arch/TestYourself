export type Explained = {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;   // e.g., "Create index" link
  raw?: string;
};

// --- Safe console logging ----------------------------------------------------
type LogType = 'debug' | 'info' | 'warn' | 'error';
type ConsoleMethodName = 'debug' | 'info' | 'warn' | 'error' | 'log';

const ConsoleMethod: Record<LogType, ConsoleMethodName> = {
  debug: 'debug',
  info:  'info',
  warn:  'warn',
  error: 'error',
};

const safeConsoleLog = (logType: LogType, ...args: unknown[]) => {
  try {
    // Prefer the mapped method; always fall back to 'log'
    const method: ConsoleMethodName = ConsoleMethod[logType] ?? 'log';
    const fn = (console as unknown as Record<string, unknown>)[method] as unknown;

    // Call the console function with an explicit `this` using Function.prototype.apply.call,
    // so environments that care about binding won't throw "Illegal invocation".
    if (typeof fn === 'function') {
      Function.prototype.apply.call(fn, console, args as any[]);
      return;
    }

    // If the specific method isn't a function, fall back to console.log
    Function.prototype.apply.call(console.log, console, args as any[]);
  } catch {
    // Final fallback: swallow logger errors so they never mask the real error
    try { console.log(...(args as any[])); } catch {}
  }
};

// Exported logger facade
export const logger = {
  debug: (...args: unknown[]) => safeConsoleLog('debug', ...args),
  info:  (...args: unknown[]) => safeConsoleLog('info',  ...args),
  warn:  (...args: unknown[]) => safeConsoleLog('warn',  ...args),
  error: (...args: unknown[]) => safeConsoleLog('error', ...args),
};

export function explainFirebaseError(err: any): Explained {
  const raw = (err?.message || "").toString();
  const code = (err?.code || "").toString();          // e.g. "permission-denied"

  // Detect "create index" link (Firestore failed-precondition)
  const idxMatch = raw.match(/(https:\/\/console\.firebase\.google\.com\/[^\s)]+)/i);

  // Common mappings
  switch (code) {
    case "permission-denied":
      return {
        title: "Permission denied",
        message:
          "You don't have access to write this data. Make sure you're signed in as an admin and your Firestore rules allow /courses writes.",
        raw,
      };
    case "failed-precondition":
      if (idxMatch) {
        return {
          title: "Missing Firestore index",
          message:
            "This query requires a composite index. Open the Firebase Console link below and click \"Create index\", then retry once it finishes building.",
          actionLabel: "Create index",
          actionHref: idxMatch[1],
          raw,
        };
      }
      return {
        title: "Precondition failed",
        message: "A Firestore precondition failed. Check query/orderBy fields or indexes.",
        raw,
      };
    case "already-exists":
      return {
        title: "Duplicate",
        message:
          "A course with this slug already exists. Choose a different slug.",
        raw,
      };
    case "invalid-argument":
      return {
        title: "Invalid data",
        message:
          "Some field values are invalid (e.g., wrong type or format). Check required fields and try again.",
        raw,
      };
    case "unauthenticated":
      return {
        title: "Not signed in",
        message: "Please sign in again and ensure you have admin access.",
        raw,
      };
    case "unavailable":
      return {
        title: "Network/server issue",
        message: "Firestore is temporarily unavailable or you are offline. Try again.",
        raw,
      };
    case "resource-exhausted":
      return {
        title: "Quota exceeded",
        message: "Write quota or rate limit exceeded. Please wait and retry.",
        raw,
      };
    default:
      // Sometimes Firestore uses only the message text ("Missing or insufficient permissions.")
      if (/insufficient permissions/i.test(raw)) {
        return {
          title: "Permission denied",
          message:
            "Firestore rules blocked this write. Confirm admin claims and rules for /courses.",
          raw,
        };
      }
      return {
        title: "Save failed",
        message: "An unexpected error occurred.",
        raw,
      };
  }
}