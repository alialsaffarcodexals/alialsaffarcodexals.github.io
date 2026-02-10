import { gqlRequest } from './graphql.client.js';
import { OBJECTS_BY_IDS_QUERY } from './queries/objects.query.js';

/**
 * Fetch object metadata by IDs.
 *
 * Why batching matters:
 * Some accounts have thousands of transactions → thousands of objectIds.
 * Sending a huge `_in: $ids` array in a single Hasura query can exceed limits
 * (query size/variable size/timeouts) and result in an empty objectMap.
 *
 * If objectMap is missing, the UI can't reliably exclude exam/exercise XP from totals.
 */
export async function fetchObjectsByIds(ids, token, { chunkSize = 200 } = {}) {
  if (!Array.isArray(ids) || ids.length === 0) return {};

  const unique = Array.from(new Set(ids.filter((x) => Number.isFinite(Number(x))).map((x) => Number(x))));
  if (!unique.length) return {};

  const out = {};

  // Best-effort batching: merge what we can.
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
      // Keep going: partial objectMap is better than none.
    }
  }

  return out;
}
