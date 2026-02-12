/**
 * Cache key builders for dashboard data.
 */
export function profileDataCacheKey(namespace, mode) {
  return `profile-data:${namespace}:${mode}`;
}

export function objectMapCacheKey(namespace) {
  return `object-map:${namespace}`;
}
