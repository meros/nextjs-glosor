/** Reads JSON from localStorage. Returns the fallback when the key is missing, unreadable or invalid. */
export function readStored<T>(key: string, parse: (value: unknown) => T | null, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    return parse(JSON.parse(raw)) ?? fallback;
  } catch {
    return fallback;
  }
}

/** Writes JSON to localStorage. Storage can be full or blocked (private mode), and that must not break the app. */
export function writeStored(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignored on purpose: the app keeps working for this session.
  }
}

export function hasStored(key: string): boolean {
  try {
    return window.localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}
