/**
 * path.js
 * Parses backend path strings into readable project names for UI display.
 */
export function projectFromPath(path) {
  if (!path || typeof path !== 'string') return 'Unknown';
  const clean = path.split('?')[0].replace(/\/+$/, '');
  const last = clean.split('/').filter(Boolean).pop();
  return last || 'Unknown';
}
