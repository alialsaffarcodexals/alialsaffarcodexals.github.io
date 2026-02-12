/**
 * objects.service.js
 * Fetches object metadata by IDs and converts results into a quick lookup map.
 */
import { gqlRequest } from './graphql.client.js';
import { OBJECTS_BY_IDS_QUERY } from './queries/objects.query.js';

/**
 * Get object metadata by ids.
 * We do this in chunks so one huge request does not fail.
 */
export async function fetchObjectsByIds(ids, token, { chunkSize = 200 } = {}) {
  if (!Array.isArray(ids) || ids.length === 0) return {};

  const unique = Array.from(new Set(ids.filter((x) => Number.isFinite(Number(x))).map((x) => Number(x))));
  if (!unique.length) return {};

  const out = {};

  // Fetch each chunk and merge what we get.
  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    try {
      const objData = await gqlRequest(OBJECTS_BY_IDS_QUERY, { ids: chunk }, token);
      const objects = Array.isArray(objData?.object) ? objData.object : [];
      for (const o of objects) {
        if (!o || o.id === undefined || o.id === null) continue;
        out[o.id] = o;
      }
    } catch {
      // Keep going. Some data is better than nothing.
    }
  }

  return out;
}
