/**
 * Reads a cached value from sessionStorage if present and not expired.
 */
export function readSessionCache(key, ttlMs) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.ts !== 'number') return null;
    if (Date.now() - parsed.ts > ttlMs) return null;

    return parsed.value ?? null;
  } catch {
    return null;
  }
}

/**
 * Writes a timestamped value to sessionStorage cache.
 */
export function writeSessionCache(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), value }));
  } catch {
    // Cache is optional, so ignore write errors.
  }
}
