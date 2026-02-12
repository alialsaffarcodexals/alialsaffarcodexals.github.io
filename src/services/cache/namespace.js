/**
 * tokenCacheNamespace
 * Derives a stable per-user namespace from the auth token.
 */
export function tokenCacheNamespace(token) {
  if (!token || typeof token !== 'string') return 'anon';
  return token.slice(-24);
}
